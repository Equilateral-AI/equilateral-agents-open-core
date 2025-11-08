/**
 * Background Execution Demo
 *
 * Demonstrates how to run multiple agent tasks in parallel while continuing
 * with other tasks.
 *
 * Teaching Value:
 * - Non-blocking agent task execution
 * - Parallel processing
 * - Progress monitoring
 */

const AgentOrchestrator = require('../equilateral-core/AgentOrchestrator');
const CodeAnalyzerAgent = require('../agent-packs/development/CodeAnalyzerAgent');

async function demonstrateBackgroundExecution() {
    console.log('🎬 Background Execution Demo\n');
    console.log('Demonstrates running multiple agent tasks in parallel');
    console.log('while continuing with other work.\n');

    // Create orchestrator
    const orchestrator = new AgentOrchestrator({
        projectPath: process.cwd()
    });

    // Register agents
    orchestrator.registerAgent(new CodeAnalyzerAgent());

    await orchestrator.start();

    try {
        console.log('Starting background agent tasks...\n');

        // Start multiple tasks in parallel
        const tasks = [];

        console.log('📊 Starting code analysis...');
        tasks.push(
            (async () => {
                const result = await orchestrator.executeAgentTask('code-analyzer', 'analyze', {
                    filePath: __filename
                });
                return { task: 'code-analysis', result };
            })()
        );

        console.log('🔍 Starting complexity check...');
        tasks.push(
            (async () => {
                const result = await orchestrator.executeAgentTask('code-analyzer', 'complexity', {
                    filePath: __filename
                });
                return { task: 'complexity-check', result };
            })()
        );

        console.log('📝 Starting lint check...');
        tasks.push(
            (async () => {
                const result = await orchestrator.executeAgentTask('code-analyzer', 'lint', {
                    filePath: __filename
                });
                return { task: 'lint-check', result };
            })()
        );

        console.log('\n✅ Tasks started in background!');
        console.log('   You can continue working while they run...\n');

        // Simulate doing other work
        console.log('💼 Doing other work while tasks run in background...');
        await simulateWork(500);
        console.log('   Working on documentation...');
        await simulateWork(500);
        console.log('   Reviewing code changes...');
        await simulateWork(500);

        // Wait for all background tasks to complete
        console.log('\n⏳ Waiting for background tasks to complete...');
        const results = await Promise.all(tasks);

        console.log(`\n✅ All background tasks completed!`);
        results.forEach((taskResult, i) => {
            console.log(`  ${i + 1}. ${taskResult.task}: ✓`);
        });

        // Show summary
        console.log('\n📋 Summary:');
        console.log(`   Total tasks: ${results.length}`);
        console.log(`   All successful: Yes`);
        console.log('\n💡 This demonstrates the power of parallel execution!');
        console.log('   While agents analyzed code, you continued working.');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await orchestrator.stop();
    }
}

async function simulateWork(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Run demo if executed directly
if (require.main === module) {
    demonstrateBackgroundExecution()
        .then(() => {
            console.log('\n✅ Demo completed!');
            process.exit(0);
        })
        .catch(error => {
            console.error('\n❌ Demo failed:', error);
            process.exit(1);
        });
}

module.exports = { demonstrateBackgroundExecution };
