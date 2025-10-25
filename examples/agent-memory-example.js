/**
 * EquilateralAgents™ - Agent Memory Example
 *
 * Demonstrates self-learning agent capabilities:
 * - Recording executions
 * - Pattern recognition
 * - Performance optimization
 * - Workflow suggestions
 *
 * Run: node examples/agent-memory-example.js
 */

const BaseAgent = require('../equilateral-core/BaseAgent');

/**
 * Example: Security Scanner Agent with Memory
 */
class SecurityScannerAgent extends BaseAgent {
    constructor(config = {}) {
        super({
            ...config,
            agentId: 'security-scanner',
            agentType: 'security',
            capabilities: ['code-scanning', 'vulnerability-detection', 'compliance-check'],
            enableMemory: true  // Memory enabled (default)
        });
    }

    /**
     * Scan files for security issues
     */
    async executeTask(task) {
        this.log('info', `Scanning ${task.files.length} files...`);

        await this.sleep(Math.random() * 2000 + 1000); // Simulate work

        // Simulate findings (random for demo)
        const findings = [];
        const issueTypes = ['sql-injection', 'xss', 'hardcoded-secrets', 'weak-crypto'];

        task.files.forEach(file => {
            if (Math.random() > 0.6) {
                findings.push({
                    file,
                    issue: issueTypes[Math.floor(Math.random() * issueTypes.length)],
                    severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)]
                });
            }
        });

        return {
            filesScanned: task.files.length,
            findings: findings.length,
            issues: findings
        };
    }
}

/**
 * Main demonstration
 */
async function main() {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║  Agent Memory Demonstration           ║');
    console.log('╚════════════════════════════════════════╝\n');

    const agent = new SecurityScannerAgent();

    // Check if memory is enabled
    console.log(`✓ Memory enabled: ${agent.hasMemory()}\n`);

    // ======================
    // Phase 1: Initial Learning
    // ======================
    console.log('📚 Phase 1: Agent Learning (15 executions)\n');

    const files = [
        'src/handlers/auth.js',
        'src/handlers/payment.js',
        'src/handlers/user.js',
        'src/utils/crypto.js',
        'src/database/query.js'
    ];

    for (let i = 0; i < 15; i++) {
        const task = {
            taskType: 'security-scan',
            description: `Scan iteration ${i + 1}`,
            files: files.slice(0, Math.floor(Math.random() * 4) + 1)
        };

        try {
            const result = await agent.executeTaskWithMemory(task);
            console.log(`  [${i + 1}/15] Scanned ${result.filesScanned} files, found ${result.findings} issues`);
        } catch (error) {
            console.log(`  [${i + 1}/15] ❌ Failed: ${error.message}`);
        }
    }

    // ======================
    // Phase 2: View Learned Patterns
    // ======================
    console.log('\n\n📊 Phase 2: Learned Patterns\n');

    const patterns = agent.getSuccessPatterns('security-scan');
    if (patterns) {
        console.log(`  Task Type: ${patterns.taskType}`);
        console.log(`  Success Rate: ${(patterns.successRate * 100).toFixed(1)}%`);
        console.log(`  Average Duration: ${patterns.avgDuration.toFixed(0)}ms`);
        console.log(`  Based on: ${patterns.successCount} successful executions\n`);
    }

    // ======================
    // Phase 3: Workflow Suggestions
    // ======================
    console.log('💡 Phase 3: Optimal Workflow Suggestion\n');

    const suggestion = agent.suggestOptimalWorkflow({ taskType: 'security-scan' });

    if (suggestion.hasExperience) {
        console.log(`  Has Experience: ✓ Yes`);
        console.log(`  Success Rate: ${(suggestion.successRate * 100).toFixed(1)}%`);
        console.log(`  Estimated Duration: ${suggestion.estimatedDuration.toFixed(0)}ms`);
        console.log(`  Confidence: ${(suggestion.confidence * 100).toFixed(0)}%`);
        console.log(`  Recommendation: ${suggestion.recommendation}`);
        console.log(`  Based on: ${suggestion.basedOn} prior executions\n`);
    } else {
        console.log(`  Has Experience: ✗ No`);
        console.log(`  Message: ${suggestion.message}\n`);
    }

    // ======================
    // Phase 4: Performance Metrics
    // ======================
    console.log('📈 Phase 4: Performance Metrics\n');

    const metrics = agent.getMemoryMetrics();

    console.log(`  Total Executions: ${metrics.totalExecutions}`);
    console.log(`  Success Rate: ${(metrics.successRate * 100).toFixed(1)}%`);
    console.log(`  Average Duration: ${metrics.avgDuration.toFixed(0)}ms\n`);

    if (metrics.commonPatterns && Object.keys(metrics.commonPatterns).length > 0) {
        console.log('  Common Success Patterns:');
        Object.entries(metrics.commonPatterns).forEach(([taskType, data]) => {
            console.log(`    - ${taskType}: ${data.count} times, avg ${data.avgDuration.toFixed(0)}ms`);
        });
        console.log();
    }

    // ======================
    // Phase 5: Memory Stats
    // ======================
    console.log('🗂️  Phase 5: Memory Statistics\n');

    const stats = agent.getMemoryStats();

    console.log(`  Agent ID: ${stats.agentId}`);
    console.log(`  Executions Tracked: ${stats.executionCount}/${stats.maxExecutions}`);
    console.log(`  Memory Size: ${(stats.memorySize / 1024).toFixed(2)} KB`);
    console.log(`  Last Updated: ${stats.lastUpdated}\n`);

    // ======================
    // Phase 6: Continued Learning
    // ======================
    console.log('🔄 Phase 6: Continued Learning (10 more executions)\n');

    for (let i = 0; i < 10; i++) {
        const task = {
            taskType: 'security-scan',
            description: `Continued learning ${i + 1}`,
            files: files.slice(0, Math.floor(Math.random() * 4) + 1)
        };

        const result = await agent.executeTaskWithMemory(task);
        console.log(`  [${i + 1}/10] Scanned ${result.filesScanned} files`);
    }

    // ======================
    // Phase 7: Improvement Analysis
    // ======================
    console.log('\n\n📊 Phase 7: Improvement Analysis\n');

    const finalMetrics = agent.getMemoryMetrics();

    if (finalMetrics.improvement) {
        console.log(`  Performance Trend: ${finalMetrics.improvement.trend}`);
        console.log(`  Success Rate Change: ${(finalMetrics.improvement.successRateDelta * 100).toFixed(1)}%`);
        console.log(`  Duration Improvement: ${finalMetrics.improvement.durationImprovement.toFixed(1)}%`);

        if (finalMetrics.improvement.trend === 'improving') {
            console.log(`  ✓ Agent is learning and improving over time!\n`);
        } else {
            console.log(`  ⚠️  Consider reviewing failure patterns\n`);
        }
    } else {
        console.log(`  Not enough data yet (need 20+ executions for trend analysis)\n`);
    }

    // ======================
    // Phase 8: Export/Backup
    // ======================
    console.log('💾 Phase 8: Memory Export\n');

    const backup = agent.memory.export();
    console.log(`  Exported ${backup.executions.length} executions`);
    console.log(`  Export timestamp: ${backup.exportedAt}\n`);

    // Could save to file:
    // const fs = require('fs');
    // fs.writeFileSync('agent-memory-backup.json', JSON.stringify(backup, null, 2));

    // ======================
    // Summary
    // ======================
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║  Summary                               ║');
    console.log('╚════════════════════════════════════════╝\n');

    console.log('✓ Agent Memory Features Demonstrated:');
    console.log('  - Automatic execution recording');
    console.log('  - Pattern recognition');
    console.log('  - Success rate tracking');
    console.log('  - Workflow optimization suggestions');
    console.log('  - Performance improvement analysis');
    console.log('  - Memory export/backup\n');

    console.log('🚀 Open-Core Capabilities:');
    console.log('  ✓ Single-agent memory');
    console.log('  ✓ Last 100 executions');
    console.log('  ✓ File-based persistence');
    console.log('  ✓ Pattern recognition');
    console.log('  ✓ Performance metrics\n');

    console.log('🔒 Enterprise Upgrade Adds:');
    console.log('  • Multi-agent coordination');
    console.log('  • Unlimited history (database-backed)');
    console.log('  • Cross-project learning');
    console.log('  • Patent-protected isolation');
    console.log('  • Semantic search (150x faster)');
    console.log('  • 24/7 continuous optimization\n');

    console.log('Next Steps:');
    console.log('  1. Try with your own agents');
    console.log('  2. Review .standards/agent_memory_standards.md');
    console.log('  3. Check .agent-memory/ directory');
    console.log('  4. Consider Enterprise for multi-agent workflows\n');
}

// Run demonstration
if (require.main === module) {
    main().catch(error => {
        console.error('Error:', error);
        process.exit(1);
    });
}

module.exports = { SecurityScannerAgent };
