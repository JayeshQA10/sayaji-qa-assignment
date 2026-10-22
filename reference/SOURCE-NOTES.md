# Source notes

The assignment requires:

1. Automated scripts
2. Test cases/plans
3. README with scenario answers

The Android reference requires offline-first survey collection, local persistence, and background synchronization. The builder reference describes dynamic schemas, visibility logic, rosters and HFC rules.

Important supplied-source defect:

The sample JSON's `hfc_sleep_plausible.logic` contains two objects without a comma and uses `questioID` rather than the documented `attr` field. The visibility rule for q3 also conflicts with the HFC condition. These are reported as defects in the README and should be resolved by the product/schema owner before treating the sample as a production contract.
