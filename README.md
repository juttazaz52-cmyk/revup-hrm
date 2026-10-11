# RevUp Global HRM

npm install && node server.js  (PORT env, default 3100)
Admin: admin / RevUp@2026 · Manager: manager / Manager@2026
Delete hrm.sqlite to reset to seed data. node shots.js = smoke test + screenshots.

## v2: Attendance, overtime, tax
- /attendance (admin+manager): daily marking, check-in/out, OT hours, "mark all present". /attendance/grid: monthly grid.
- Settings (admin): working days (26), hours/day (8), OT multiplier (1.5x), tax slabs (FY2025-26 PK salaried) + 9% surcharge > Rs 10M.
- Payroll: absent = 1 unpaid day, half-day = 0.5, leave/late/unmarked = paid; deduction = pay/working days. OT = pay/(days*hours)*multiplier.
  Tax = slab tax on (monthly gross x 12) / 12, per-employee toggle. server.v1.js = previous version backup.

## v3 (Phase 1): self-service, team leads, leave, approvals
Roles: admin, manager (HR), teamlead, employee. Logins: bilal/Lead@2026 (team lead), ali, hira, usman / Agent@2026.
Backup of previous version: server.v2.js + hrm.v2.sqlite. If node_modules is missing: PUPPETEER_SKIP_DOWNLOAD=1 npm ci
