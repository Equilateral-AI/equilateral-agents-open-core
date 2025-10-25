# Agent Memory Statistics

View learning patterns and execution history across all EquilateralAgents.

## What This Shows

Displays self-learning statistics for agents:
- Execution history (last 100 runs per agent)
- Success/failure patterns
- Performance metrics and trends
- Workflow optimization suggestions
- Community standards contributions

## Implementation

Show agent memory statistics for all agents that have execution history:

```javascript
const { SimpleAgentMemory } = require('equilateral-agents-open-core');
const fs = require('fs');
const path = require('path');

const memoryDir = path.join(process.cwd(), '.agent-memory');

if (!fs.existsSync(memoryDir)) {
    console.log('📊 No agent memory found yet.');
    console.log('💡 Agents will start learning after their first execution.');
    console.log('\nTry running a workflow first:');
    console.log('  /ea:security-review');
    console.log('  /ea:code-quality');
    process.exit(0);
}

const agentDirs = fs.readdirSync(memoryDir);

if (agentDirs.length === 0) {
    console.log('📊 No agents have execution history yet.');
    process.exit(0);
}

console.log('🧠 EquilateralAgents Memory Statistics\n');
console.log('═'.repeat(70));

for (const agentId of agentDirs) {
    const memory = new SimpleAgentMemory(agentId, { memoryDir });
    const stats = memory.getStats();

    console.log(`\n📦 ${agentId}`);
    console.log('─'.repeat(70));
    console.log(`Total Executions: ${stats.totalExecutions}`);
    console.log(`Success Rate: ${(stats.overallSuccessRate * 100).toFixed(1)}%`);
    console.log(`Avg Duration: ${stats.avgDuration}ms`);

    if (stats.taskTypes && stats.taskTypes.size > 0) {
        console.log(`Task Types: ${Array.from(stats.taskTypes).join(', ')}`);
    }

    // Show success patterns for each task type
    if (stats.totalExecutions > 0) {
        console.log('\n📊 Task Performance:');

        const executions = memory.getExecutions();
        const taskStats = new Map();

        for (const [_, exec] of executions) {
            if (!taskStats.has(exec.taskType)) {
                taskStats.set(exec.taskType, { total: 0, success: 0, totalDuration: 0 });
            }
            const stat = taskStats.get(exec.taskType);
            stat.total++;
            if (exec.success) stat.success++;
            stat.totalDuration += exec.duration || 0;
        }

        for (const [taskType, stat] of taskStats) {
            const successRate = (stat.success / stat.total * 100).toFixed(1);
            const avgDuration = Math.round(stat.totalDuration / stat.total);
            console.log(`  • ${taskType}: ${stat.success}/${stat.total} (${successRate}%) - avg ${avgDuration}ms`);
        }
    }

    console.log('');
}

console.log('═'.repeat(70));
console.log('\n💡 Tips:');
console.log('  • Agents learn automatically from each execution');
console.log('  • Memory is stored in .agent-memory/ (excluded from git)');
console.log('  • Last 100 executions are kept per agent');
console.log('  • Use executeTaskWithMemory() for optimization suggestions');
console.log('\n📚 Learn more: AGENT_MEMORY_GUIDE.md');
```

## Expected Output

```
🧠 EquilateralAgents Memory Statistics

══════════════════════════════════════════════════════════════════════

📦 security-scanner
──────────────────────────────────────────────────────────────────────
Total Executions: 47
Success Rate: 95.7%
Avg Duration: 1450ms
Task Types: security-scan, vulnerability-check

📊 Task Performance:
  • security-scan: 42/44 (95.5%) - avg 1420ms
  • vulnerability-check: 3/3 (100.0%) - avg 1680ms


📦 code-review
──────────────────────────────────────────────────────────────────────
Total Executions: 89
Success Rate: 92.1%
Avg Duration: 2340ms
Task Types: review, quality-check

📊 Task Performance:
  • review: 78/85 (91.8%) - avg 2380ms
  • quality-check: 4/4 (100.0%) - avg 1850ms

══════════════════════════════════════════════════════════════════════

💡 Tips:
  • Agents learn automatically from each execution
  • Memory is stored in .agent-memory/ (excluded from git)
  • Last 100 executions are kept per agent
  • Use executeTaskWithMemory() for optimization suggestions

📚 Learn more: AGENT_MEMORY_GUIDE.md
```

## When to Use

- After running several workflows to see learning progress
- To understand which agents are most reliable
- To identify optimization opportunities
- Before important deployments to verify agent performance
- To demonstrate agent learning to stakeholders

## Quick Access

```bash
# Via npm script
npm run memory:stats

# Or directly via this command
/ea:memory
```

## Related Commands

- `/ea:list` - See all available workflows
- `/ea:security-review` - Run security review (agents will learn)
- `/ea:code-quality` - Run quality analysis (agents will learn)

## New in v2.1.0

Agent memory is a new feature in v2.1.0 that enables:
- Self-learning agents that improve over time
- Pattern recognition and workflow optimization
- Community standards contribution from learned patterns
- Performance metrics and trend analysis

See AGENT_MEMORY_GUIDE.md for complete documentation.
