# .standards-local/ Template

This directory contains example standards you can copy to your `.standards-local/` directory as starting points.

## Quick Start

```bash
# Copy entire template to start building your standards
cp -r .standards-local-template .standards-local

# Or copy individual examples
cp .standards-local-template/security/credential-scanning.yaml .standards-local/security/
```

## What to Put Here

`.standards-local/` should contain:
- **Team conventions** - Your specific naming, structure, patterns
- **Lessons learned** - Patterns discovered through agent executions
- **Project-specific rules** - Constraints unique to your codebase
- **Battle-tested patterns** - Solutions that work consistently (85%+ success)

## What NOT to Put Here

- Generic best practices → Contribute to `.standards-community/`
- Universal principles → Already in `.standards/`
- One-off solutions → Wait for 3+ occurrences before documenting

## Directory Structure

```
.standards-local/
├── README.md                              # Overview of your team's standards
├── security/                              # Security patterns and rules
│   ├── credential-scanning.yaml
│   ├── auth-and-access-control.yaml
│   └── input-validation-security.yaml
├── architecture/                          # System design patterns
│   ├── error-first-design.yaml
│   ├── service-boundaries.yaml
│   └── database-patterns.yaml
├── performance/                           # Performance standards
│   ├── database-query-patterns.yaml
│   ├── caching-strategy.yaml
│   └── bundle-size.yaml
├── testing/                               # Testing patterns
│   ├── integration-tests-no-mocks.yaml
│   ├── test-coverage.yaml
│   └── test-data-management.yaml
└── deployment/                            # Deployment procedures
    ├── rollback-procedures.yaml
    ├── health-checks.yaml
    └── deployment-checklist.yaml
```

## Standard Format (YAML Schema)

Every standard should follow this YAML schema:

```yaml
id: standard-id
category: category-name
priority: 10|20|30
updated: 2026-02-01
rules:
  - action: ALWAYS|NEVER|USE|PREFER|AVOID
    rule: "Description"
anti_patterns:
  - "Anti-pattern description"
examples:
  example_name: |
    // code example
context: |
  Why this standard exists
tags:
  - tag1
```

### Field Reference

- **id** - Unique identifier for the standard (kebab-case)
- **category** - Grouping category (security, architecture, performance, testing, deployment)
- **priority** - Severity level: `10` (critical), `20` (high), `30` (medium)
- **updated** - Date of last update (YYYY-MM-DD)
- **rules** - List of rules with action keywords (ALWAYS, NEVER, USE, PREFER, AVOID)
- **anti_patterns** - Common mistakes this standard prevents
- **examples** - Named code examples showing wrong and correct patterns
- **context** - Paragraph explaining why this standard exists and its origin
- **tags** - List of tags for searchability and cross-referencing

## Severity Levels

Use these priority levels consistently:

- **10 (CRITICAL)** - Security vulnerability, data loss risk, production outage potential
- **20 (HIGH)** - Significant cost impact, major technical debt, compliance violation
- **30 (MEDIUM)** - Performance issues, maintainability problems, anti-patterns

## Version Control

**Important:**
- `.standards-local/` should be in `.gitignore` (team-specific, not shared)
- OR use a separate private git repo for team standards
- OR sanitize and contribute to `.standards-community/` (shared with world)

Choose based on your needs:
1. **Private team repo**: Best for company-specific patterns
2. **Ignored**: Best for learning/experimentation
3. **Community contribution**: Best for patterns others can use

## Knowledge Harvest

Standards come from real pain. Build them by:

1. **Execute workflows** - Run agents, build features, deploy code
2. **Track patterns** - Review `.equilateral/agent-memory/` weekly
3. **Identify lessons** - What failed 3+ times? What worked consistently?
4. **Document** - Use the YAML schema with context explaining origin
5. **Enforce** - Reference in `.claude/CLAUDE.md`, agent configs
6. **Iterate** - Update standards as you learn more

## Examples Included

This template includes examples for:

- **Security**: Credential scanning (`credential-scanning.yaml`), auth and access control (`auth-and-access-control.yaml`), input validation (`input-validation-security.yaml`)
- **Architecture**: Error-first design (`error-first-design.yaml`)
- **Performance**: Database query patterns (`database-query-patterns.yaml`)
- **Testing**: Integration test patterns (`integration-tests-no-mocks.yaml`)

These are examples only. Your actual standards should come from your real experiences.

## Contributing to Community

After 3+ months of successful use:

1. Sanitize (remove company-specific details)
2. Generalize (make framework-agnostic if possible)
3. Submit PR to [EquilateralAgents Community Standards](https://github.com/Equilateral-AI/EquilateralAgents-Community-Standards)

Your battle-tested patterns can help thousands of developers avoid the same mistakes.

---

**Start small. Document what hurts. Build from there.**
