#!/usr/bin/env node

/**
 * Background Analysis Dispatcher
 * Runs code quality and security analysis while we make fixes
 */

const AgentOrchestrator = require('./equilateral-core/AgentOrchestrator');
const CodeAnalyzerAgent = require('./agent-packs/development/CodeAnalyzerAgent');

async function dispatchBackgroundAnalysis() {
    console.log('🚀 Dispatching background analysis teams...\n');

    const orchestrator = new AgentOrchestrator({ enableBackground: true });
    orchestrator.registerAgent(new CodeAnalyzerAgent());

    await orchestrator.start();

    // Dispatch code quality analysis in background
    const qualityAnalysis = await orchestrator.executeWorkflowBackground('code-quality-check', {
        projectPath: process.cwd()
    });

    console.log(`✅ Quality analysis team dispatched: ${qualityAnalysis.workflowId}`);
    console.log('💼 Continuing with fixes while analysis runs...\n');

    return qualityAnalysis;
}

if (require.main === module) {
    dispatchBackgroundAnalysis()
        .then(handle => {
            console.log('Background teams running. Exit when ready.');
            // Keep process alive to monitor
            setInterval(() => {
                console.log('Status:', handle.getStatus().status);
            }, 5000);
        })
        .catch(console.error);
}

module.exports = { dispatchBackgroundAnalysis };
