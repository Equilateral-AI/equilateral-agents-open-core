# Standards Schema Reference

Project/Object can inject coding standards into AI sessions for consistent
enforcement. Standards are YAML files stored in a `.standards/` directory.

## Directory Structure

```
.standards/
  yaml/
    development-principles.yaml
    testing-principles.yaml
    api-design-standards.yaml
    cost-optimization-principles.yaml
    serverless/
      lambda-database-standards.yaml
      api-gateway-cors-standards.yaml
    well-architected/
      security.yaml
      reliability.yaml
      cost-optimization.yaml
```

## YAML Standards Schema

Each YAML file defines rules for a specific domain:

```yaml
id: development-principles         # REQUIRED: unique, kebab-case
category: core                     # REQUIRED: patterns | core | serverless | security | ...
priority: 10                       # REQUIRED: 10=critical, 20=important, 30=advisory
updated: 2026-02-01                # REQUIRED: ISO date

rules:                             # REQUIRED: actionable rules
  - action: ALWAYS                 # ALWAYS | NEVER | USE | PREFER | AVOID
    rule: "Fail fast and loud -- make failures obvious and immediate"
  - action: NEVER
    rule: "Return mock data or fallback values from production code on failure"
  - action: PREFER
    rule: "Explicit code over clever implicit code"
    applies_to:                    # Optional: file glob patterns
      - "src/**/*.js"

anti_patterns:                     # REQUIRED: what NOT to do
  - "Returning mock/default objects in catch blocks to hide API failures"
  - "Logging a warning and returning success when required data is missing"

examples:                          # Optional: code examples
  correct_implementation: |
    // Good example code
  wrong_implementation: |
    // Bad example code

cost_impact:                       # Optional: cost/performance impact
  bad_pattern: "$25/month per million invocations"
  good_pattern: "$0 - resolved at deploy time"

context: |                         # Optional: background for humans
  Why this pattern matters and when to apply it.

related:                           # Optional: related standard IDs
  - api-design-standards
  - testing-principles

tags:                              # Optional: for filtering
  - core
  - error-handling
  - cost-optimization
```

## Action Keywords

| Action | Enforcement | Meaning |
|--------|-------------|---------|
| `ALWAYS` | `[REQUIRE]` | Must follow in all cases |
| `USE` | `[REQUIRE]` | Recommended approach to adopt |
| `NEVER` | `[AVOID]` | Must not do under any circumstances |
| `AVOID` | `[AVOID]` | Should not do; flag if encountered |
| `PREFER` | `[PREFER]` | Follow when practical, OK to deviate with reason |

## Creating Your Own Standards

1. Create a `.standards/yaml/` directory in your project root
2. Add YAML files following the schema above
3. Use `priority: 10` for critical rules, `20` for important, `30` for advisory
4. The standards-loader scans all `*.yaml` and `*.yml` files automatically
5. Rules are loaded in priority order (lower number first)
6. Maximum 30 rules injected per session

## Standards Sources

### Open Standards (curated)

Pre-built standards via the Equilateral Agents package:

```bash
npm install @equilateral/agents
npx equilateral-agents init --standards
```

Includes: development principles, testing, API design, serverless/Lambda,
cost optimization, security, and AWS Well-Architected Framework patterns.

### Community Standards (contributed)

Battle-tested patterns from the developer community:

```bash
git submodule add https://github.com/Equilateral-AI/EquilateralAgents-Community-Standards .standards-community
```

Includes patterns, real-world examples, workflow patterns, and integration
guides. **Contributions welcome** -- submit your own patterns via PR using
the [TEMPLATE.yaml](https://github.com/Equilateral-AI/EquilateralAgents-Community-Standards/blob/main/TEMPLATE.yaml).

### Three-Tier System

| Tier | Location | Scope |
|------|----------|-------|
| Open Standards | `.standards/` | Universal principles for all projects |
| Community Standards | `.standards-community/` | Proven patterns for many projects |
| Local Standards | `.standards-local/` | Team/company-specific conventions |
