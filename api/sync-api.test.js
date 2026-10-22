const test = require('node:test');
const assert = require('node:assert/strict');
const { createSyncServer } = require('./mock-sync-server');

let fixture;

function request(port, body) {
  return fetch(`http://127.0.0.1:${port}/sync-survey`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body)
  }).then(async response => ({
    status: response.status,
    body: await response.json()
  }));
}

function survey(deviceId, localId, schoolName = 'Govt Primary School') {
  return {
    deviceId,
    localId,
    surveyVersion: 1,
    capturedAt: '2026-10-22T10:00:00Z',
    answers: { schoolName, district: 'Ahmedabad' }
  };
}

test.beforeEach(async () => {
  fixture = createSyncServer();
  await new Promise(resolve => fixture.server.listen(0, '127.0.0.1', resolve));
});

test.afterEach(async () => {
  await new Promise(resolve => fixture.server.close(resolve));
});

test('accepts same localId from different devices without overwrite', async () => {
  const port = fixture.server.address().port;

  const ankit = await request(port, survey('ankit-phone', 'School_1'));
  const pooja = await request(port, survey('pooja-phone', 'School_1'));

  assert.equal(ankit.status, 201);
  assert.equal(pooja.status, 201);
  assert.notEqual(ankit.body.serverSurveyId, pooja.body.serverSurveyId);
  assert.equal(fixture.records.size, 2);
});

test('repeated same-device request is idempotent', async () => {
  const port = fixture.server.address().port;
  const payload = survey('ankit-phone', 'School_1');

  const first = await request(port, payload);
  const second = await request(port, payload);

  assert.equal(first.status, 201);
  assert.equal(second.status, 200);
  assert.equal(first.body.serverSurveyId, second.body.serverSurveyId);
  assert.equal(fixture.records.size, 1);
});

test('same device/localId with different data never silently overwrites', async () => {
  const port = fixture.server.address().port;

  const first = await request(port, survey('ankit-phone', 'School_1', 'Govt Primary School'));
  const conflicting = await request(port, survey('ankit-phone', 'School_1', 'Private Primary School'));

  assert.equal(first.status, 201);
  assert.equal(conflicting.status, 409);
  assert.equal(fixture.records.size, 1);
});

test('rejects malformed requests', async () => {
  const port = fixture.server.address().port;

  const response = await request(port, {
    deviceId: 'ankit-phone',
    localId: 'School_1'
  });

  assert.equal(response.status, 400);
});

test('concurrent duplicate requests result in one stored record', async () => {
  const port = fixture.server.address().port;
  const payload = survey('ankit-phone', 'School_1');

  const results = await Promise.all(
    Array.from({ length: 20 }, () => request(port, payload))
  );

  assert.equal(fixture.records.size, 1);
  assert.equal(results.filter(r => r.status === 201).length, 1);
  assert.equal(results.filter(r => r.status === 200).length, 19);
});
