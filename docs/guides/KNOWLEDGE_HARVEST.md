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

---

## Advanced Automation

While many knowledge harvest approaches exist (like Claude's flow memory or other automated systems), most suffer from two problems:
1. **Not human readable** - Binary formats, embeddings, or dense JSON that humans can't easily review
2. **Not curated** - Automated collection without human synthesis and judgment

**This approach is different:** Human-readable markdown standards that are actively curated. You get the best of both worlds:
- Automation finds the patterns
- Humans synthesize the learnings
- Standards are readable by both AI assistants and team members
- Knowledge is actively maintained, not just accumulated

Here's an elegant implementation you can customize for your needs.

### Automated Knowledge Harvest

The included `scripts/harvest-knowledge.js` script analyzes agent memory and recommends new standards:

```bash
# Run knowledge harvest
node scripts/harvest-knowledge.js

# With options
node scripts/harvest-knowledge.js --since=14d --min-occurrences=5
```

**What it does:**
- Scans all agent memory files in `.equilateral/agent-memory/`
- Identifies error patterns that occurred 3+ times
- Finds successful optimizations that worked consistently (85%+ success rate)
- Calculates agent success rates and trends
- Generates prioritized recommendations for new standards
- Creates detailed report in `.equilateral/knowledge-harvest-report.md`

**Output example:**
```
🎯 Top Recommendations:

   🔴 Prevent ValidationError
      → Occurred 5 times across 2 agent(s)
      → Create: .standards-local/architecture/validation-error.md

   🟡 Codify eager-loading-optimization
      → Worked 4 times, avg 2.3h saved
      → Create: .standards-local/performance/eager-loading-optimization.md
```

### Pattern Recognition Algorithms

The harvest script uses several pattern recognition techniques:

#### 1. Error Pattern Matching

Groups errors by type and message similarity:

```javascript
// Creates pattern key from error type + message
const patternKey = `${errorType}:${errorMessage.substring(0, 50)}`;

// Tracks:
// - Occurrence count
// - Affected agents
// - First/last seen timestamps
// - Example contexts
```

#### 2. Success Pattern Analysis

Identifies optimizations that consistently work:

```javascript
// Filters for successful executions with optimizations
const successfulOptimizations = executions.filter(exec =>
    exec.status === 'success' &&
    exec.optimizationApplied &&
    exec.timeSaved > 0
);

// Calculates:
// - Success rate (percentage that worked)
// - Average time saved
// - Agents where it worked
```

#### 3. Trend Detection

Determines if agents are improving, declining, or stable:

```javascript
// Compare first half vs second half of execution history
const firstHalfSuccessRate = calculateSuccessRate(firstHalf);
const secondHalfSuccessRate = calculateSuccessRate(secondHalf);

const delta = secondHalfSuccessRate - firstHalfSuccessRate;

if (delta > 0.1) return 'improving';   // Success rate up >10%
if (delta < -0.1) return 'declining';  // Success rate down >10%
return 'stable';
```

#### 4. Knowledge Gap Identification

Finds areas with low success rates needing attention:

```javascript
// Agents with success rate < 85% are knowledge gaps
const gaps = Object.entries(successRates)
    .filter(([_, rate]) => rate.successRate < 0.85)
    .sort((a, b) => a.successRate - b.successRate);

// These become targets for new standards
```

### Automated Standards Organization

**DIY Approach:**

You can build your own librarian agent to maintain your standards library. It should:
- Scan all `.md` files in `.standards-local/`
- Parse content to extract title, sections, keywords
- Auto-classify into categories (security, architecture, performance, etc.)
- Validate standard format (check for required sections)
- Generate category READMEs and master INDEX

**Classification approach:**
```javascript
// Basic keyword-based classification
const categories = {
    security: ['auth', 'credential', 'password', 'token', 'vulnerability'],
    performance: ['n+1', 'query', 'cache', 'timeout', 'optimization'],
    architecture: ['error', 'validation', 'null', 'async', 'state'],
    // ...
};

// Count keyword matches in title and content
// Classify to highest-scoring category
```

**Commercial Librarian Agent:**

The commercial version includes a production-ready librarian agent with:
- ML-based classification (learns from your patterns)
- Automated cross-referencing (finds related standards)
- Conflict detection (identifies overlapping or contradicting standards)
- Automated archival (detects deprecated patterns)
- Integration with 138+ existing standards
- Real-time organization (as standards are created)

### Weekly Automation with Cron

Set up weekly knowledge harvest:

```bash
# Add to crontab (edit with: crontab -e)

# Run knowledge harvest every Monday at 9 AM
0 9 * * MON cd /path/to/project && node scripts/harvest-knowledge.js

# Email results (optional)
0 10 * * MON cd /path/to/project && node scripts/harvest-knowledge.js | mail -s "Knowledge Harvest Report" you@example.com
```

### Integration with CI/CD

Run harvest automatically on successful deployments:

```yaml
# .github/workflows/knowledge-harvest.yml
name: Knowledge Harvest
on:
  workflow_dispatch:  # Manual trigger
  schedule:
    - cron: '0 9 * * 1'  # Every Monday at 9 AM

jobs:
  harvest:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Install dependencies
        run: npm install

      - name: Run knowledge harvest
        run: node scripts/harvest-knowledge.js --since=7d

      - name: Upload report
        uses: actions/upload-artifact@v2
        with:
          name: knowledge-harvest-report
          path: .equilateral/knowledge-harvest-report.md
```

### Slack/Teams Integration

Send harvest reports to team channels:

```javascript
// scripts/post-harvest-to-slack.js
const fs = require('fs');
const https = require('https');

const report = fs.readFileSync('.equilateral/knowledge-harvest-report.md', 'utf8');
const webhookUrl = process.env.SLACK_WEBHOOK_URL;

// Extract summary
const summaryMatch = report.match(/## Executive Summary([\s\S]*?)##/);
const summary = summaryMatch ? summaryMatch[1].trim() : 'No summary available';

// Post to Slack
const payload = {
    text: '📊 Weekly Knowledge Harvest Report',
    blocks: [
        {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: summary
            }
        },
        {
            type: 'actions',
            elements: [
                {
                    type: 'button',
                    text: {
                        type: 'plain_text',
                        text: 'View Full Report'
                    },
                    url: 'https://github.com/yourorg/project/blob/main/.equilateral/knowledge-harvest-report.md'
                }
            ]
        }
    ]
};

// Send via webhook
// (implementation details omitted for brevity)
```

### Visualization Dashboard (Optional)

Create a simple dashboard to track knowledge growth:

```javascript
// scripts/generate-dashboard.js
const fs = require('fs');

// Load standards over time
const standards = loadAllStandards();

// Group by creation date
const standardsByMonth = groupByMonth(standards);

// Generate chart data
const chartData = {
    labels: Object.keys(standardsByMonth),
    datasets: [{
        label: 'Standards Created',
        data: Object.values(standardsByMonth).map(s => s.length)
    }]
};

// Generate HTML dashboard
const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Knowledge Growth Dashboard</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
    <h1>Standards Library Growth</h1>
    <canvas id="chart"></canvas>
    <script>
        new Chart(document.getElementById('chart'), {
            type: 'line',
            data: ${JSON.stringify(chartData)}
        });
    </script>
</body>
</html>
`;

fs.writeFileSync('.equilateral/dashboard.html', html);
console.log('✅ Dashboard generated: .equilateral/dashboard.html');
```

### Advanced Pattern Recognition

For more sophisticated analysis, consider these approaches:

#### Temporal Pattern Analysis

Track how patterns evolve over time:

```javascript
// Group executions by week
const executionsByWeek = groupByWeek(executions);

// Identify emerging patterns (increasing frequency)
const emergingPatterns = findPatternsWithIncreasingFrequency(executionsByWeek);

// Identify declining patterns (decreasing frequency = standard working!)
const decliningPatterns = findPatternsWithDecreasingFrequency(executionsByWeek);
```

#### Cross-Agent Pattern Detection

Find patterns that span multiple agents:

```javascript
// Example: Authentication errors across 3 different agents
// suggests systemic issue worth documenting
const crossAgentPatterns = findPatternsAcrossAgents(memories, minAgents = 2);
```

#### Cost-Based Prioritization

Prioritize standards by estimated cost avoidance:

```javascript
// Calculate cost of each pattern
const patternCosts = errorPatterns.map(pattern => ({
    pattern,
    estimatedCost: pattern.count * averageDebugTime * hourlyRate
}));

// Sort by highest cost first
patternCosts.sort((a, b) => b.estimatedCost - a.estimatedCost);
```

#### Similarity Clustering

Group similar errors even with different messages:

```javascript
// Use Levenshtein distance or cosine similarity
// to cluster error messages that are semantically similar

function calculateSimilarity(message1, message2) {
    // Simple word overlap
    const words1 = new Set(message1.toLowerCase().split(/\s+/));
    const words2 = new Set(message2.toLowerCase().split(/\s+/));

    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);

    return intersection.size / union.size; // Jaccard similarity
}

// Cluster errors with >70% similarity
const clusters = clusterBySimilarity(errorMessages, threshold = 0.7);
```

### Customizing for Your Needs

The scripts are designed to be customized:

**Adjust thresholds:**
```javascript
// In harvest-knowledge.js
const config = {
    minOccurrences: 3,        // Lower for earlier detection
    successThreshold: 0.85,   // Raise for stricter standards
    sinceDays: 7              // Extend for longer history
};
```

**Add custom categorization:**
```javascript
// In librarian-agent.js
const categories = {
    security: ['auth', 'credential', ...],
    'your-custom-category': ['keyword1', 'keyword2', ...],
    // ...
};
```

**Integrate with your tools:**
- Jira: Create tickets for recommended standards
- GitHub: Open issues/PRs with standard templates
- DataDog/NewRelic: Correlate with production incidents
- Your internal tools: POST harvest results to APIs

### Commercial vs DIY

**What these scripts provide (DIY):**
- ✅ Pattern recognition from agent memory
- ✅ Standard recommendations
- ✅ Auto-classification and organization
- ✅ Trend detection
- ✅ Cross-reference generation

**What commercial adds:**
- ⭐ ML-based pattern recognition (learns from cross-enterprise data)
- ⭐ Automated standard generation (drafts "What Happened, The Cost, The Rule")
- ⭐ Real-time detection (as patterns emerge, not weekly)
- ⭐ Integration with 138+ existing standards (conflict detection)
- ⭐ Multi-project correlation (patterns across your organization)
- ⭐ Predictive analytics (what will fail before it does)

**The Difference:**
- DIY scripts: Analyze YOUR data, find YOUR patterns, recommend YOUR standards
- Commercial: Cross-enterprise learning, 138+ standards built-in, production-grade ML

Both are valuable. Start with DIY scripts. Upgrade to commercial when you need cross-project learning or want to skip building 138+ standards yourself.

---

## Summary

**Manual approach:** Good for week 1-2, learning the process
- Review agent memory files manually
- Identify patterns yourself
- Create standards as you notice them

**Script automation:** Good for month 1+, scaling the process
- `harvest-knowledge.js` - Automated pattern analysis and recommendations
- DIY librarian - Build your own organization scripts (or do manually)

**Commercial automation:** Good for enterprises with multiple projects
- Production-ready librarian agent (ML-based classification)
- Real-time pattern detection (not just weekly)
- Cross-enterprise learning
- 138+ pre-built standards
- Automated standard generation

**Start simple. Add harvest automation as you scale. Upgrade to commercial when you need the librarian agent or want to skip building 138+ standards.**
