/**
 * Simple Workflow Example - Example
 *
 * MIT License
 * Copyright (c) 2025 HappyHippo.ai
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * EquilateralAgents™ is a trademark of HappyHippo.ai
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