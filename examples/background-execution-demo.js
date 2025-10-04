/**
 * Background Execution Demo
 *
 * Demonstrates how to run workflows in the background while continuing
 * with other tasks.
 *
 * Teaching Value:
 * - Non-blocking workflow execution
 * - Progress monitoring
 * - Multiple concurrent workflows
 */

const AgentOrchestrator = require('../equilateral-core/AgentOrchestrator');

async function demonstrateBackgroundExecution() {
    console.log('🎬 Background Execution Demo\n');

    // Create orchestrator with background execution enabled
    const orchestrator = new AgentOrchestrator({
        enableBackground: true,
        projectPath: process.cwd()
    });

    await orchestrator.start();

    try {
        // Start a long-running workflow in the background
        console.log('Starting workflow in background...');
        const handle = await orchestrator.executeWorkflowBackground('code-review', {
            projectPath: './my-project'
        });

        console.log(`✅ Workflow started: ${handle.workflowId}`);
        console.log('   You can continue working while it runs...\n');

        // Simulate doing other work
        console.log('💼 Doing other work while workflow runs in background...');
        await simulateWork(2000);

        // Check status
        const status = handle.getStatus();
        console.log(`\n📊 Workflow Status:`, status);

        // Do more work
        console.log('\n💼 Continuing with other tasks...');
        await simulateWork(2000);

        // Get result (will wait if not complete)
        console.log('\n⏳ Waiting for workflow to complete...');
        const result = await handle.getResult();

        console.log(`\n✅ Workflow completed!`);
        console.log(`   Status: ${result.status}`);
        console.log(`   Duration: ${(result.endTime - result.startTime) / 1000}s`);

        // Example: Running multiple workflows in parallel
        console.log('\n\n🔄 Running multiple workflows in parallel...\n');

        const workflows = [
            orchestrator.executeWorkflowBackground('code-review'),
            orchestrator.executeWorkflowBackground('deployment-check'),
            orchestrator.executeWorkflowBackground('quality-gate')
        ];

        console.log(`Started ${workflows.length} workflows in background`);

        // List all running workflows
        const runningWorkflows = orchestrator.listBackgroundWorkflows();
        console.log(`\nRunning workflows:`);
        runningWorkflows.forEach(wf => {
            console.log(`  - ${wf.workflowId}: ${wf.workflowType} (${wf.status})`);
        });

        // Wait for all to complete
        console.log('\n⏳ Waiting for all workflows to complete...');
        const results = await Promise.all(
            workflows.map(async (handle) => {
                const h = await handle;
                return h.getResult();
            })
        );

        console.log(`\n✅ All workflows completed!`);
        results.forEach((result, i) => {
            console.log(`  ${i + 1}. ${result.workflowId}: ${result.status}`);
        });

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
