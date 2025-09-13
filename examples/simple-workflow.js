/**
 * Simple Workflow Example
 * 
 * Demonstrates basic agent orchestration without database complexity.
 * Perfect for understanding the core concepts.
 */

const AgentOrchestrator = require('../equilateral-core/AgentOrchestrator');
const CodeAnalyzerAgent = require('../agent-packs/development/CodeAnalyzerAgent');

async function runExample() {
    console.log('EquilateralAgents Simple Workflow Example\n');
    
    // Create orchestrator
    const orchestrator = new AgentOrchestrator({
        projectPath: process.cwd()
    });

    // Register agents
    const analyzer = new CodeAnalyzerAgent();
    orchestrator.registerAgent(analyzer);

    // Listen to events for monitoring
    orchestrator.on('workflowStarted', (workflow) => {
        console.log(`\n📋 Workflow ${workflow.type} started (ID: ${workflow.id})`);
    });

    orchestrator.on('taskCompleted', (task) => {
        console.log(`✅ Task completed: ${task.agentId} - ${task.taskType}`);
    });

    orchestrator.on('workflowCompleted', (workflow) => {
        console.log(`\n🎉 Workflow completed successfully!`);
        console.log(`   Duration: ${workflow.endTime - workflow.startTime}ms`);
        console.log(`   Tasks executed: ${workflow.results.length}`);
    });

    orchestrator.on('workflowFailed', (workflow) => {
        console.error(`\n❌ Workflow failed: ${workflow.error}`);
    });

    try {
        // Start the orchestrator
        await orchestrator.start();
        console.log('Orchestrator started successfully');

        // Execute a single task
        console.log('\n--- Executing Single Task ---');
        const singleResult = await orchestrator.executeAgentTask(
            'code-analyzer',
            'analyze',
            { filePath: __filename }
        );
        console.log('Analysis result:', singleResult.summary);

        // Define a custom workflow
        orchestrator.getWorkflowDefinition = (type) => {
            if (type === 'quick-check') {
                return {
                    tasks: [
                        { 
                            agentId: 'code-analyzer', 
                            taskType: 'lint',
                            taskData: { filePath: __filename }
                        },
                        { 
                            agentId: 'code-analyzer', 
                            taskType: 'complexity',
                            taskData: { filePath: __filename }
                        }
                    ]
                };
            }
            return { tasks: [] };
        };

        // Execute the custom workflow
        console.log('\n--- Executing Custom Workflow ---');
        const workflowResult = await orchestrator.executeWorkflow('quick-check', {
            description: 'Quick code quality check'
        });

        // Display results
        console.log('\n--- Workflow Results ---');
        workflowResult.results.forEach((result, index) => {
            console.log(`\nTask ${index + 1}: ${result.agentId} - ${result.taskType}`);
            if (result.result.summary) {
                console.log('Summary:', result.result.summary);
            }
            if (result.result.assessment) {
                console.log('Assessment:', result.result.assessment);
            }
        });

        // Show workflow history
        console.log('\n--- Workflow History ---');
        const history = orchestrator.getWorkflowHistory(5);
        history.forEach(w => {
            console.log(`- ${w.type} (${w.status}) - ${new Date(w.startTime).toLocaleString()}`);
        });

        // Stop orchestrator
        await orchestrator.stop();
        console.log('\nOrchestrator stopped');

    } catch (error) {
        console.error('Example failed:', error);
        process.exit(1);
    }
}

// Run the example
if (require.main === module) {
    runExample().catch(console.error);
}

module.exports = { runExample };