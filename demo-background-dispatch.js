#!/usr/bin/env node

/**
 * Demo: Dispatch Teams in Background Pattern
 *
 * This demonstrates the workflow pattern:
 * 1. Dispatch multiple agent teams in background
 * 2. Continue working on other tasks
 * 3. Check progress and collect results
 */

const AgentOrchestrator = require('./equilateral-core/AgentOrchestrator');
const CodeAnalyzerAgent = require('./agent-packs/development/CodeAnalyzerAgent');
const SecurityScannerAgent = require('./agent-packs/security/SecurityScannerAgent');
const TestOrchestrationAgent = require('./agent-packs/development/TestOrchestrationAgent');

async function dispatchTeamsInBackground() {
    console.log('🚀 Dispatching agent teams in background...\n');

    const orchestrator = new AgentOrchestrator({
        enableBackground: true
    });

    // Register agents
    orchestrator.registerAgent(new CodeAnalyzerAgent());
    orchestrator.registerAgent(new SecurityScannerAgent());
    orchestrator.registerAgent(new TestOrchestrationAgent());

    await orchestrator.start();

    // Dispatch teams in background (non-blocking)
    const teams = {
        security: orchestrator.executeWorkflowBackground('security-scan', {
            projectPath: process.cwd()
        }),
        quality: orchestrator.executeWorkflowBackground('code-analysis', {
            projectPath: process.cwd()
        }),
        testing: orchestrator.executeWorkflowBackground('test-execution', {
            projectPath: process.cwd()
        })
    };

    console.log('✅ Teams dispatched:');
    console.log(`   - Security team: ${(await teams.security).workflowId}`);
    console.log(`   - Quality team: ${(await teams.quality).workflowId}`);
    console.log(`   - Testing team: ${(await teams.testing).workflowId}`);
    console.log('\n💡 Teams are running in background...\n');

    // Simulate working on other tasks
    console.log('📋 Executing todo list while teams work:');
    const todos = [
        'Review recent code changes',
        'Update documentation',
        'Prepare deployment checklist'
    ];

    for (const todo of todos) {
        console.log(`   ⏳ ${todo}...`);
        await sleep(1000); // Simulate work
        console.log(`   ✓ ${todo} complete`);
    }

    console.log('\n🔍 Checking background team status:\n');

    const securityTeam = await teams.security;
    const qualityTeam = await teams.quality;
    const testingTeam = await teams.testing;

    console.log(`   Security: ${securityTeam.getStatus().status}`);
    console.log(`   Quality: ${qualityTeam.getStatus().status}`);
    console.log(`   Testing: ${testingTeam.getStatus().status}`);

    console.log('\n✨ Pattern complete! All teams executed in parallel while todo list progressed.\n');

    await orchestrator.stop();
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

if (require.main === module) {
    dispatchTeamsInBackground().catch(console.error);
}

module.exports = { dispatchTeamsInBackground };
