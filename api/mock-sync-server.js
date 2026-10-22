const http = require('node:http');
const { randomUUID } = require('node:crypto');

function createSyncServer() {
  const records = new Map();

  function keyFor(body) {
    return `${body.deviceId}:${body.localId}`;
  }

  function validate(body) {
    if (!body || typeof body !== 'object') return 'JSON body is required';
    if (!body.deviceId) return 'deviceId is required';
    if (!body.localId) return 'localId is required';
    if (body.surveyVersion === undefined) return 'surveyVersion is required';
    if (!body.answers || typeof body.answers !== 'object') return 'answers is required';
    return null;
  }

  function response(res, status, body) {
    res.writeHead(status, { 'content-type': 'application/json' });
    res.end(JSON.stringify(body));
  }

  const server = http.createServer((req, res) => {
    if (req.method !== 'POST' || req.url !== '/sync-survey') {
      return response(res, 404, { error: 'not_found' });
    }

    let raw = '';
    req.on('data', chunk => { raw += chunk; });
    req.on('end', () => {
      let body;
      try {
        body = JSON.parse(raw || '{}');
      } catch {
        return response(res, 400, { error: 'invalid_json' });
      }

      const validationError = validate(body);
      if (validationError) {
        return response(res, 400, { error: validationError });
      }

      const key = keyFor(body);
      const existing = records.get(key);

      if (existing) {
        // Same client record is idempotent. Never silently overwrite immutable identity.
        const existingIdentity = JSON.stringify(existing.payload.answers);
        const incomingIdentity = JSON.stringify(body.answers);

        if (existingIdentity !== incomingIdentity) {
          return response(res, 409, {
            error: 'idempotency_conflict',
            message: 'Same deviceId/localId was already accepted with different data',
            serverSurveyId: existing.serverSurveyId
          });
        }

        return response(res, 200, {
          status: 'already_synced',
          serverSurveyId: existing.serverSurveyId
        });
      }

      const serverSurveyId = randomUUID();
      records.set(key, {
        serverSurveyId,
        payload: body,
        createdAt: new Date().toISOString()
      });

      return response(res, 201, {
        status: 'created',
        serverSurveyId
      });
    });
  });

  return {
    server,
    records,
    reset: () => records.clear()
  };
}

module.exports = { createSyncServer };
