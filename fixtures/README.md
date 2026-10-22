# Fixtures

The original `3.Sample Survey Schema.json` is kept outside the generated test fixture because the supplied source contains malformed JSON in the HFC section. That defect is intentionally called out in the README.

For automated examples, the web fixture models the valid `q_3 -> q_4` hobby visibility rule directly from the supplied schema:

- `q_3`: Do you have a hobby?
- `q_4`: What is your hobby? (If Yes)
- q4 visible when q3 = Yes

The automation demonstrates the rule without silently modifying the source attachment.
