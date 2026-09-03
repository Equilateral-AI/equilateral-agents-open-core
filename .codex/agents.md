## Codex Witness Dispatch Polling

Use the seat named by the current MindMeld authorization session — not a similarly named project seat.

1. Call `mindmeld_init_session` to discover pending dispatches for your seat.
2. Claim executable work via `dispatch_claim_step`.
3. Execute by consequence_tier:
   - `read_only`, `write_local`, `write_shared` → proceed
   - `publish`, `production` → STOP, human release required
4. Report results via `dispatch_report_step`.
5. Poll again after reporting — repeat until no work remains.

Never claim work assigned to another seat. Empty `for_this_seat` is a noop — sleep and check again.