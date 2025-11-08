# Knowledge Harvest Process

## Overview

Knowledge harvest is the systematic process of extracting learned patterns from agent executions and synthesizing them into reusable standards. This transforms individual experiences into institutional knowledge.

## Harvest Frequency

- **High activity periods**: Daily harvest recommended
- **Normal development**: Weekly harvest is sufficient
- **Low activity**: Ad-hoc when significant learnings occur

## Data Sources

### 1. Agent Memory Files
Each agent maintains execution history in `.equilateral/agent-memory/`:
```
.equilateral/agent-memory/
├── code-analyzer-memory.json
├── security-scanner-memory.json
├── test-runner-memory.json
└── ...
```

**What to look for:**
- Repeated failures on same patterns
- Consistent successes (85%+ success rate)
- Error patterns that occurred 3+ times
- Solutions that worked across multiple projects

### 2. Agent Todo Lists
Agents may maintain private todo lists tracking:
- Pending improvements
- Discovered edge cases
- Patterns worth documenting
- Refactoring opportunities

### 3. Workflow History
Located in `.equilateral/workflow-history.json`:
- Task execution times
- Success/failure rates
- Common error patterns
- Optimization opportunities

## Harvest Process

### Step 1: Scan Agent Memories
```bash
# Review recent agent executions
ls -lt .equilateral/agent-memory/

# Look for patterns in recent runs
grep -r "error" .equilateral/agent-memory/
grep -r "success" .equilateral/agent-memory/
```

### Step 2: Identify Patterns
Ask yourself:
- What errors occurred 3+ times?
- What solutions worked consistently?
- What patterns led to success?
- What mistakes were repeated?

### Step 3: Document Learnings
For each significant pattern, document:
- **What Happened**: The situation/error/success
- **The Cost**: Time wasted, bugs introduced, or value gained
- **The Rule**: The standard to prevent/replicate this

### Step 4: Create Standards
Add to `.standards-local/` based on pattern type:

```
.standards-local/
├── architecture/
│   └── learned-from-project-x.md
├── security/
│   └── auth-patterns-that-work.md
├── testing/
│   └── test-coverage-minimums.md
└── performance/
    └── optimization-wins.md
```

### Step 5: Classify and Organize

**Manual approach** (starter):
- Review new standards monthly
- Move mature standards to appropriate categories
- Archive outdated patterns
- Update CLAUDE.md with new rules

**Automated approach** (advanced):
Create a librarian agent that:
- Scans `.standards-local/` for new MD files
- Classifies by topic (security, architecture, performance, etc.)
- Moves files to appropriate subdirectories
- Archives standards marked as deprecated
- Updates indexes and cross-references

## Example: Turning Pain into Pattern

### Incident
**Date**: 2024-10-15
**Agent**: security-scanner
**What Happened**: Failed to detect hardcoded API key in environment variable usage because it only scanned string literals

**The Cost**:
- API key exposed to production
- 4 hours emergency rotation
- $200 in unauthorized API usage
- Security incident report required

**The Pattern Learned**:
Security scanning must check:
1. String literals (`const key = "abc123"`)
2. Environment variable defaults (`process.env.API_KEY || "default-key"`)
3. Template strings with embedded secrets
4. Comments containing credentials

**The Rule Created**:
`.standards-local/security/credential-scanning.md`:
```markdown
# Credential Scanning Standards

## Required Checks

1. **String Literals**: All hardcoded strings matching key patterns
2. **Environment Defaults**: Any fallback values in env var access
3. **Template Strings**: Embedded expressions in templates
4. **Comments**: Credential-like strings in comments
5. **Configuration Files**: JSON/YAML files with key-like values

## Critical Alert Pattern

Any match triggers:
- **Severity**: CRITICAL
- **Block**: Deployment halted
- **Notification**: Security team notified
- **Remediation**: Immediate rotation required

## Cost of Violation

- API key rotation: ~4 hours
- Potential unauthorized usage: $$$
- Security incident overhead: 8+ hours
- Compliance implications

## Implementation

SecurityScannerAgent must scan all 5 locations above.
No exceptions for "internal" or "dev" keys.
```

## Knowledge Synthesis Flywheel

```
Execute Agent Tasks
        ↓
    Collect Data
    (memory, todos, workflows)
        ↓
    Identify Patterns
    (errors, successes, trends)
        ↓
    Document Learnings
    ("What Happened, The Cost, The Rule")
        ↓
    Create Standards
    (.standards-local/*.md)
        ↓
    Update CLAUDE.md
    (reference new standards)
        ↓
    Faster Execution
    (AI checks standards first)
        ↓
    Better Results
        ↓
    [Loop back to Execute]
```

## Metrics to Track

- **Standards created**: Count of new .md files in `.standards-local/`
- **Errors prevented**: Times AI cited standards to avoid mistakes
- **Time saved**: Reduction in circular work/debugging
- **Success rate**: Percentage of agent tasks completing successfully
- **Knowledge coverage**: Percentage of common patterns documented

## Graduation Path

As standards mature:

1. **Local → Community**: Share battle-tested patterns
   - Contribute to `.standards-community/`
   - Submit PR with sanitized learnings
   - Help others avoid your mistakes

2. **Community → Universal**: Proven across many teams
   - Most valuable patterns graduate
   - Become part of core standards
   - Maintained by framework team

## Commercial Automation

The commercial Equilateral AI platform includes:
- **Librarian Agent**: Automated classification and organization
- **Pattern Recognition**: ML-based pattern detection across agent memories
- **Cross-Enterprise Learning**: Anonymized pattern sharing across customers
- **250+ Pre-Built Standards**: Skip the learning curve
- **Automatic CLAUDE.md Updates**: Standards automatically referenced

## Getting Started

### Week 1
- Enable agent memory (already enabled in v2.1.0)
- Run 5+ workflows
- Manually review agent memory files

### Week 2
- Identify your first 3 patterns
- Create first standards in `.standards-local/`
- Update CLAUDE.md to reference them

### Month 1
- Weekly knowledge harvest
- 10+ standards documented
- Measurable reduction in repeat errors

### Month 3
- Daily/weekly harvest rhythm established
- Standards library growing
- Consider automating with librarian agent
- Explore contributing to `.standards-community/`

## Questions?

The methodology is simple:
1. Execute tasks
2. Notice patterns
3. Document learnings
4. Create standards
5. Reference in CLAUDE.md
6. Repeat

The value compounds over time. Your 100th standard prevents mistakes you made 99 times before.
