# .standards-local/ Template

This directory contains example standards you can copy to your `.standards-local/` directory as starting points.

## Quick Start

```bash
# Copy entire template to start building your standards
cp -r .standards-local-template .standards-local

# Or copy individual examples
cp .standards-local-template/security/credential-scanning.md .standards-local/security/
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
├── README.md                    # Overview of your team's standards
├── security/                    # Security patterns and rules
│   ├── credential-scanning.md
│   ├── auth-patterns.md
│   └── api-security.md
├── architecture/                # System design patterns
│   ├── error-handling.md
│   ├── service-boundaries.md
│   └── database-patterns.md
├── performance/                 # Performance standards
│   ├── query-optimization.md
│   ├── caching-strategy.md
│   └── bundle-size.md
├── testing/                     # Testing patterns
│   ├── integration-tests.md
│   ├── test-coverage.md
│   └── test-data-management.md
└── deployment/                  # Deployment procedures
    ├── rollback-procedures.md
    ├── health-checks.md
    └── deployment-checklist.md
```

## Standard Format

Every standard should follow this format:

```markdown
# [Standard Name]

## Problem
[What problem does this solve? What mistake does it prevent?]

## Cost of Violation
[What happens when ignored? Quantify if possible.]

## Rule
[Clear, actionable, testable rule]

## Examples

### ❌ Wrong
\`\`\`[language]
// Bad example with explanation
\`\`\`

### ✅ Correct
\`\`\`[language]
// Good example with explanation
\`\`\`

## Detection
[How to detect violations - agents, linters, code review]

## Related Standards
- [Links to related standards]

## History
[Optional: When learned, what incident drove creation]
```

## Severity Levels

Use these severity levels consistently:

- **CRITICAL** - Security vulnerability, data loss risk, production outage potential
- **HIGH** - Significant cost impact, major technical debt, compliance violation
- **MEDIUM** - Performance issues, maintainability problems, anti-patterns
- **LOW** - Style inconsistencies, minor optimizations, documentation gaps
- **INFO** - Suggestions, best practices, learning opportunities

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
4. **Document** - Use "What Happened, The Cost, The Rule" format
5. **Enforce** - Reference in `.claude/CLAUDE.md`, agent configs
6. **Iterate** - Update standards as you learn more

## Examples Included

This template includes examples for:

- **Security**: Credential scanning (because everyone makes this mistake)
- **Architecture**: Error-first design (fail fast, fail loud)
- **Performance**: Database query patterns (N+1 queries are common)
- **Testing**: Integration test patterns (no mocks in production code)
- **Deployment**: Health check validation (prevent bad deploys)

These are examples only. Your actual standards should come from your real experiences.

## Contributing to Community

After 3+ months of successful use:

1. Sanitize (remove company-specific details)
2. Generalize (make framework-agnostic if possible)
3. Submit PR to [EquilateralAgents Community Standards](https://github.com/JamesFord-HappyHippo/EquilateralAgents-Community-Standards)

Your battle-tested patterns can help thousands of developers avoid the same mistakes.

---

**Start small. Document what hurts. Build from there.**
