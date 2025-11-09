# Agent Memory in EquilateralAgents

**For**: Open-Core Users
**Version**: 1.0.0
**Date**: 2025-10-25

## What is Agent Memory?

EquilateralAgents includes **self-learning capabilities** that allow each agent to remember past executions, learn from successes and failures, and optimize performance over time.

Unlike stateless orchestrators that treat every task as brand new, EquilateralAgents agents maintain execution history and pattern recognition to get smarter with every use.

---

## Open-Core: Simple Agent Memory

### What You Get (Free)

**Single-Agent Memory System**:
- Each agent maintains its own execution history (last 100 executions)
- Learns from successes and failures
- Tracks performance patterns
- Suggests optimizations based on past experience
- File-based persistence (survives restarts)

### How It Works

```javascript
// Example: Security review agent learning from executions

const SecurityAgent = require('./agents/SecurityReviewer');
const agent = new SecurityAgent();

// First execution (no memory)
await agent.reviewCode({
  files: ['src/handlers/auth.js'],
  checks: ['sql-injection', 'xss', 'secrets']
});
// Result: Runs all checks, takes 45 seconds

// After 10 executions, the agent learns:
// - auth.js never has XSS issues (React/JSX patterns)
// - Always has secrets in env vars (good pattern)
// - Focus on SQL injection in database queries

// 11th execution (with memory)
await agent.reviewCode({
  files: ['src/handlers/auth.js'],
  checks: ['sql-injection', 'xss', 'secrets']
});
// Result: Focuses on SQL patterns, completes in 12 seconds
// 73% faster due to learned priorities
```

### Memory Structure

Each agent stores:

```json
{
  "agent_id": "security-reviewer",
  "executions": [
    {
      "task_id": "task_1729875600000",
      "description": "Review auth handler",
      "outcome": "success",
      "duration_ms": 45000,
      "findings": 3,
      "timestamp": "2025-10-25T10:00:00Z"
    },
    {
      "task_id": "task_1729876200000",
      "description": "Review payment handler",
      "outcome": "success",
      "duration_ms": 52000,
      "findings": 7,
      "timestamp": "2025-10-25T11:00:00Z"
    }
    // ... up to 100 recent executions
  ],
  "patterns": {
    "avg_duration_ms": 38500,
    "success_rate": 0.95,
    "common_findings": ["hardcoded-secrets", "sql-injection"],
    "optimal_check_order": ["secrets", "sql-injection", "xss"]
  }
}
```

### What You Can Do

**1. View Agent Learning**:
```bash
# See what an agent has learned
node -e "
const agent = require('./agents/SecurityReviewer');
const memory = agent.getMemory();
console.log('Success Rate:', memory.patterns.success_rate);
console.log('Avg Duration:', memory.patterns.avg_duration_ms, 'ms');
console.log('Common Issues:', memory.patterns.common_findings);
"
```

**2. Pattern Recognition**:
```javascript
// Agent suggests optimal approach based on history
const suggestions = await agent.suggestOptimalWorkflow({
  taskType: 'security-review',
  context: { fileType: 'handler' }
});

console.log(suggestions);
// {
//   recommendedChecks: ['secrets', 'sql-injection'],
//   estimatedDuration: 12000,
//   confidence: 0.85,
//   basedOn: 15 // similar past executions
// }
```

**3. Performance Tracking**:
```javascript
// See how agent performance improves over time
const metrics = await agent.getPerformanceMetrics();

console.log(metrics);
// {
//   first_10_executions: { avg_duration: 45000, success_rate: 0.80 },
//   last_10_executions: { avg_duration: 12000, success_rate: 0.95 },
//   improvement: { duration: '73% faster', success: '19% more reliable' }
// }
```

### Limitations (Open-Core)

❌ **No Cross-Agent Learning**: Each agent learns independently. SecurityReviewer can't share insights with DeploymentAgent.

❌ **Short-Term Memory Only**: Limited to last 100 executions. Older patterns are forgotten.

❌ **File-Based Storage**: Less reliable than database. Risk of corruption or loss.

❌ **No Privacy Isolation**: If multiple agents access same files, potential for memory contamination.

❌ **No Persistent Long-Term Patterns**: System doesn't build cumulative knowledge over months/years.

---

## Enterprise: Full-Stack Memory

### What Changes with Enterprise

**Three-Tier Memory Architecture**:

1. **Short-Term Memory** (Same as Open-Core)
   - Last 100 executions per agent
   - Quick pattern recognition
   - Immediate optimizations

2. **Working Memory** (NEW - Enterprise Only)
   - Cross-agent coordination
   - Shared insights without privacy violation
   - Real-time knowledge synthesis

3. **Long-Term Memory** (NEW - Enterprise Only)
   - Unlimited execution history
   - Database-backed persistence
   - Cumulative learning over months/years
   - Pattern evolution tracking

### Patent-Protected Memory Isolation

**The Problem**: When multiple agents work on the same project, their memories can interfere:

```javascript
// Open-Core Problem Example:
// Agent A learns "always check auth.js for secrets"
// Agent B learns "auth.js is always clean"
// Conflicting patterns → confusion

// Agent C sees both patterns, doesn't know which to trust
```

**Enterprise Solution**: PrivateMemoryManager with knowledge synthesis

```javascript
// Each agent maintains PRIVATE memory
// System synthesizes insights WITHOUT contamination

const PrivateMemoryManager = require('./core/PrivateMemoryManager');
const manager = new PrivateMemoryManager();

// Agent A's private memory
await manager.storePrivate('agent-a', {
  pattern: 'auth.js often has secrets in dev',
  confidence: 0.85,
  context: 'development environment'
});

// Agent B's private memory
await manager.storePrivate('agent-b', {
  pattern: 'auth.js clean in production',
  confidence: 0.92,
  context: 'production environment'
});

// Synthesis (without contamination)
const synthesis = await manager.synthesize(['agent-a', 'agent-b'], {
  query: 'auth.js security patterns'
});

console.log(synthesis);
// {
//   insight: 'Environment-dependent patterns detected',
//   recommendation: 'Check secrets in dev, validate config in prod',
//   confidence: 0.88,
//   sources: ['agent-a', 'agent-b'],
//   privacyPreserved: true
// }
```

### Database-Backed Reliability

**Open-Core** (File-Based):
```
.agent-memory/
├── security-reviewer/
│   └── memory.json  ← Risk of corruption, no ACID guarantees
└── deployment-agent/
    └── memory.json
```

**Enterprise** (PostgreSQL):
```sql
-- Full ACID guarantees, concurrent access, backup/recovery
CREATE TABLE agent_memory (
  agent_id VARCHAR(255),
  execution_id UUID PRIMARY KEY,
  task_data JSONB,
  outcome VARCHAR(50),
  duration_ms INTEGER,
  timestamp TIMESTAMPTZ,
  patterns JSONB,
  -- Indexed for fast semantic queries
  CONSTRAINT fk_agent FOREIGN KEY (agent_id) REFERENCES agents(id)
);

CREATE INDEX idx_semantic_patterns ON agent_memory
  USING GIN (patterns jsonb_path_ops);
```

**Benefits**:
- ✅ Concurrent access (multiple agents reading/writing safely)
- ✅ Transactional integrity (no partial writes)
- ✅ Point-in-time recovery (restore to any moment)
- ✅ Fast semantic queries (150x faster with proper indexing)
- ✅ Audit trails (who learned what, when)

### Multi-Agent Workflows

**Open-Core Limitation**:
```javascript
// Each agent works independently
const securityResult = await securityAgent.review(code);
const deploymentResult = await deploymentAgent.deploy(code);
const complianceResult = await complianceAgent.check(code);

// No coordination, no shared learning
```

**Enterprise Multi-Agent Coordination**:
```javascript
const TeamOrchestrator = require('./core/TeamOrchestrator');
const orchestrator = new TeamOrchestrator();

// Create coordinated team
const team = await orchestrator.createTeam({
  name: 'Production Deploy Team',
  agents: ['security-reviewer', 'deployment-agent', 'compliance-checker']
});

// Execute with shared context
const result = await orchestrator.executeWorkflow('production-deploy', {
  teamId: team.id,
  context: { app: 'payment-service', environment: 'prod' }
});

// Agents share insights during execution:
// - Security finds hardcoded secret → alerts Deployment
// - Deployment detects cost spike → alerts Compliance
// - Compliance identifies GDPR gap → alerts Security
// All coordinated in real-time with memory synthesis
```

### Continuous Learning (Not Session-Based)

**Open-Core**: Learning happens per-execution

**Enterprise**: Learning happens continuously

```javascript
// Enterprise Learning Loop
const AgentLearningOrchestrator = require('./core/AgentLearningOrchestrator');
const learner = new AgentLearningOrchestrator();

// Starts continuous optimization cycles
await learner.startLearningCycles({
  interval: 3600000,  // Every hour
  agents: ['security-reviewer', 'deployment-agent', 'compliance-checker']
});

// System automatically:
// - Identifies bottlenecks
// - Optimizes routing decisions
// - Updates success patterns
// - Predicts failure modes
// - Adjusts resource allocation

// No manual intervention required
```

**Result**: Agents get smarter 24/7, even when idle

---

## Concrete Comparison

### Example: Security Review Workflow

**Scenario**: Review 50 Lambda handlers for security issues

#### Open-Core (Simple Memory)

```javascript
const SecurityAgent = require('./agents/SecurityReviewer');
const agent = new SecurityAgent();

const results = [];
for (const handler of handlers) {
  const result = await agent.review(handler);
  results.push(result);
}

// What agent learns (per-agent only):
// - Common patterns in YOUR codebase
// - Which checks usually fail
// - Estimated time per handler

// Limitations:
// - Can't learn from DeploymentAgent's experiences
// - Forgets patterns after 100 executions
// - Doesn't coordinate with ComplianceAgent
```

**Performance**:
- First 10 handlers: 45 sec each = 7.5 min
- After learning: 12 sec each = 10 min total for all 50
- **Total Time**: ~17.5 minutes
- **Findings**: 120 issues (no prioritization)

#### Enterprise (Full-Stack Memory)

```javascript
const TeamOrchestrator = require('./core/TeamOrchestrator');
const orchestrator = new TeamOrchestrator();

// Multi-agent team with shared memory
const result = await orchestrator.executeWorkflow('security-review', {
  handlers: handlers,
  agents: ['security-reviewer', 'compliance-checker', 'deployment-agent']
});

// What agents learn (team coordination):
// - Security learns from Compliance's GDPR patterns
// - Deployment shares cost implications of findings
// - Compliance alerts on regulatory requirements
// - All insights stored in long-term database

// Capabilities:
// ✅ Cross-agent pattern sharing
// ✅ Remembers all historical reviews (not just last 100)
// ✅ Predicts which handlers are high-risk (run first)
// ✅ Coordinates fixes across teams
```

**Performance**:
- Parallel execution: 3 agents work simultaneously
- Pattern prediction: High-risk handlers identified upfront
- Shared learning: Knows common issue patterns across all codebases
- **Total Time**: ~6 minutes (66% faster)
- **Findings**: 120 issues (prioritized by risk, GDPR impact, cost)

### Example: Multi-Project Learning

**Scenario**: You maintain 5 different projects

#### Open-Core

```javascript
// Project A learns independently
// Project B learns independently
// Project C learns independently
// Project D learns independently
// Project E learns independently

// Each project "rediscovers" the same patterns
// No knowledge transfer between projects
```

**Result**: Slow learning curve for each new project

#### Enterprise

```javascript
const PrivateMemoryManager = require('./core/PrivateMemoryManager');
const manager = new PrivateMemoryManager();

// Synthesize patterns across projects (privacy-preserved)
const crossProjectInsights = await manager.synthesizeAcrossProjects({
  projects: ['project-a', 'project-b', 'project-c', 'project-d', 'project-e'],
  domain: 'security-patterns'
});

console.log(crossProjectInsights);
// {
//   insights: [
//     'All projects have hardcoded secrets in .env files',
//     'Projects A, C, E use weak JWT validation',
//     'Projects B, D have SQL injection vulnerabilities in /api/search'
//   ],
//   recommendations: [
//     'Implement SSM parameter store pattern (saved Projects A,C)',
//     'Upgrade JWT library to v9.0+ (fixing 60% of auth issues)',
//     'Use parameterized queries (preventing 100% of SQL injection)'
//   ],
//   confidence: 0.94,
//   basedOnExecutions: 1247
// }
```

**Result**: New projects benefit from all previous learning

---

## When to Upgrade to Enterprise

### Keep Open-Core If:

✅ You have 1-3 projects
✅ Security/compliance is not mission-critical
✅ You're okay with manual optimization
✅ Single-agent workflows are sufficient
✅ Learning from last 100 executions is enough

### Upgrade to Enterprise If:

🚀 You manage 5+ projects (cross-project learning pays off)
🚀 Security/compliance is regulated (GDPR, HIPAA, SOC 2)
🚀 You need multi-agent coordination (security + deployment + compliance working together)
🚀 You want 24/7 continuous learning (not just per-execution)
🚀 You need audit trails (who learned what, when)
🚀 You want patent-protected memory isolation (prevent contamination)
🚀 You need database reliability (no file corruption risk)

### ROI Calculation

**Scenario**: 10 deployments/month, 5 projects

**Open-Core**:
- Time per deployment: 30 min (manual checks, no coordination)
- Learning curve per project: ~20 deployments to optimize
- Total time/month: 300 min = 5 hours
- Developer cost (@$150/hr): **$750/month**

**Enterprise**:
- Time per deployment: 8 min (automated, coordinated, learned patterns)
- Learning curve per project: ~3 deployments (cross-project synthesis)
- Total time/month: 80 min = 1.3 hours
- Developer cost (@$150/hr): **$195/month**
- **Savings**: $555/month = **$6,660/year**

**Enterprise Cost**: ~$500/month (estimated)

**Net Savings**: $55/month + risk reduction + faster time-to-market

### Real-World Example

**Open-Core User** (Startup, 2 projects):
> "Open-core is perfect for us. We deploy twice a month, and the simple memory helps agents learn our codebase patterns. We save ~30 minutes per deployment compared to manual reviews."

**Enterprise User** (SaaS Company, 12 projects):
> "We upgraded after hitting memory limits with open-core. Now our agents coordinate across all 12 projects, sharing GDPR patterns and cost optimizations. We cut deployment time from 90 minutes to 15 minutes, and caught 3 compliance gaps before our SOC 2 audit. Paid for itself in the first month."

---

## Getting Started with Memory

### Open-Core Setup

**1. Enable Memory** (Already enabled by default):
```javascript
const agent = require('./agents/SecurityReviewer');

// Memory is automatic - just use the agent
const result = await agent.review(code);

// View learned patterns
const patterns = agent.getMemoryPatterns();
console.log(patterns);
```

**2. Monitor Learning**:
```bash
# See how agents are learning
npm run agents:memory-status

# Output:
# SecurityReviewer: 45 executions, 89% success rate
# DeploymentAgent: 32 executions, 94% success rate
# ComplianceChecker: 28 executions, 76% success rate
```

**3. Reset Memory** (if needed):
```bash
# Clear learned patterns and start fresh
npm run agents:reset-memory security-reviewer

# Useful when codebase changes significantly
```

### Enterprise Upgrade

**What's Included**:
- 68 specialized agents (vs 22 in open-core)
- Patent-protected memory isolation
- Database-backed persistence (PostgreSQL)
- Multi-agent team orchestration
- Continuous learning (24/7 optimization)
- Long-term memory (unlimited history)
- Cross-project knowledge synthesis
- Production SLA & support

**Migration Path**:
```bash
# Export open-core memory (preserve learning)
npm run agents:export-memory

# Upgrade to enterprise
npm install @equilateral/agents-enterprise

# Import open-core patterns (keep what you learned)
npm run agents:import-memory ./memory-export.json

# Enterprise features now active
npm run agents:status
# All agents now have access to shared knowledge base
```

---

## Technical Details

### Open-Core Memory API

```javascript
class SimpleAgentMemory {
  constructor(agentId) {
    this.agentId = agentId;
    this.shortTerm = new Map();  // Last 100 executions
    this.memoryFile = `.agent-memory/${agentId}/memory.json`;
  }

  // Record execution
  recordExecution(task, outcome) {
    this.shortTerm.set(task.id, {
      task: task.description,
      outcome: outcome.success,
      duration: outcome.duration,
      timestamp: Date.now()
    });

    // Keep only last 100
    if (this.shortTerm.size > 100) {
      const oldest = Array.from(this.shortTerm.keys())[0];
      this.shortTerm.delete(oldest);
    }

    this.save();  // Persist to file
  }

  // Get success patterns
  getSuccessPatterns(taskType) {
    const relevant = Array.from(this.shortTerm.values())
      .filter(e => e.task.includes(taskType) && e.outcome === true);

    return {
      successRate: relevant.length / this.shortTerm.size,
      avgDuration: relevant.reduce((sum, e) => sum + e.duration, 0) / relevant.length,
      patterns: relevant.slice(-10)
    };
  }

  // Suggest optimal approach
  suggestOptimalWorkflow(context) {
    const similar = this.findSimilarExecutions(context);
    const successful = similar.filter(e => e.outcome === true);

    return {
      recommendedApproach: this.extractCommonPatterns(successful),
      estimatedDuration: this.averageDuration(successful),
      confidence: successful.length / similar.length,
      basedOn: similar.length
    };
  }

  // Persistence
  save() {
    fs.writeFileSync(
      this.memoryFile,
      JSON.stringify(Array.from(this.shortTerm.entries()))
    );
  }

  load() {
    if (fs.existsSync(this.memoryFile)) {
      const data = JSON.parse(fs.readFileSync(this.memoryFile));
      this.shortTerm = new Map(data);
    }
  }
}
```

### Enterprise Memory API

```javascript
class EnterpriseMemoryManager {
  constructor(config) {
    this.db = config.database;  // PostgreSQL
    this.privateManager = new PrivateMemoryManager();
    this.learningOrchestrator = new AgentLearningOrchestrator();
  }

  // Store with privacy isolation
  async storeExecution(agentId, execution) {
    // Private memory (agent-specific)
    await this.privateManager.storePrivate(agentId, execution);

    // Long-term database (unlimited history)
    await this.db.query(`
      INSERT INTO agent_executions (agent_id, task_data, outcome, duration_ms, patterns)
      VALUES ($1, $2, $3, $4, $5)
    `, [agentId, execution.task, execution.outcome, execution.duration, execution.patterns]);

    // Trigger learning cycle
    this.learningOrchestrator.processNewExecution(agentId, execution);
  }

  // Cross-agent synthesis (privacy-preserved)
  async synthesizeKnowledge(agentIds, context) {
    return await this.privateManager.synthesize(agentIds, {
      query: context.query,
      preservePrivacy: true,
      confidenceThreshold: 0.8
    });
  }

  // Semantic search across all memory
  async queryPatterns(query, options = {}) {
    const results = await this.db.query(`
      SELECT agent_id, task_data, patterns,
             similarity(patterns, $1) AS confidence
      FROM agent_executions
      WHERE similarity(patterns, $1) > $2
      ORDER BY confidence DESC
      LIMIT $3
    `, [query, options.minConfidence || 0.7, options.limit || 10]);

    return results.rows;
  }

  // Team coordination
  async coordinateTeam(teamId, task) {
    const team = await this.getTeam(teamId);

    // Each agent shares relevant insights
    const insights = await Promise.all(
      team.agents.map(agentId =>
        this.privateManager.getRelevantInsights(agentId, task)
      )
    );

    // Synthesize without privacy violation
    return await this.privateManager.synthesize(
      team.agents,
      { context: task, insights }
    );
  }
}
```

---

## FAQ

### Q: How much memory does the open-core system use?

**A**: Minimal. Each agent stores last 100 executions:
- ~50 KB per agent
- 22 agents = ~1.1 MB total
- File-based, no database overhead

### Q: Can I increase the 100-execution limit in open-core?

**A**: Yes, but not recommended. File-based storage becomes slow/unreliable beyond 100 entries. For unlimited history, upgrade to Enterprise (database-backed).

### Q: Does memory work offline?

**A**: Yes. Open-core memory is file-based and works completely offline. Enterprise memory requires database connection.

### Q: How do I backup my agent memory?

**A**:
```bash
# Open-core (copy files)
cp -r .agent-memory ./backup/

# Enterprise (database export)
npm run agents:export-memory --output backup.json
```

### Q: Can I share memory between developers?

**A**:
- **Open-Core**: Yes, commit `.agent-memory/` to git (but watch for conflicts)
- **Enterprise**: Yes, shared database means team-wide learning automatically

### Q: What happens if I downgrade from Enterprise to Open-Core?

**A**: You can export your long-term patterns to open-core format, but:
- ❌ Lose cross-agent synthesis
- ❌ Lose unlimited history (kept to last 100)
- ❌ Lose database reliability
- ✅ Keep learned patterns (converted to simple format)

### Q: How does this compare to Claude Flow's memory?

**A**:
- **Open-Core**: Similar to Claude Flow's session-based learning
- **Enterprise**: Superior - continuous learning, multi-agent synthesis, patent-protected isolation

---

## Summary

### Open-Core (Free)
✅ Single-agent memory (last 100 executions)
✅ Pattern recognition
✅ Performance optimization
✅ File-based persistence
✅ Perfect for: Startups, 1-3 projects, non-critical workflows

### Enterprise (Paid)
✅ Multi-agent coordination
✅ Unlimited long-term memory
✅ Database-backed reliability
✅ Patent-protected isolation
✅ Cross-project learning
✅ 24/7 continuous optimization
✅ Perfect for: Scale-ups, 5+ projects, regulated industries

**Try Open-Core First**: Experience the value of agent memory with our free tier. Upgrade when you need multi-agent coordination or hit the 100-execution limit.

---

**Questions?** support@equilateral.ai
**Documentation**: https://docs.equilateral.ai/memory
**Enterprise Demo**: https://equilateral.ai/demo
