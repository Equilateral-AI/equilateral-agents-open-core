#!/usr/bin/env node

/**
 * Executable Code Quality Workflow
 *
 * Run with: npm run workflow:quality
 * Or: node workflows/run-code-quality.js
 */

const AgentOrchestrator = require('../equilateral-core/AgentOrchestrator');
const CodeQualityWorkflow = require('./code-quality-workflow');
const CodeAnalyzerAgent = require('../agent-packs/development/CodeAnalyzerAgent');
const CodeReviewAgent = require('../agent-packs/quality/CodeReviewAgent');
const BackendAuditorAgent = require('../agent-packs/quality/BackendAuditorAgent');
const FrontendAuditorAgent = require('../agent-packs/quality/FrontendAuditorAgent');
const AuditorAgent = require('../agent-packs/quality/AuditorAgent');

async function runCodeQuality() {
    // Parse command line arguments
    const args = process.argv.slice(2);
    const projectPath = args[0] || process.cwd();

    console.log('📊 EquilateralAgents Code Quality Analysis');
    console.log(`   Project: ${projectPath}\n`);

    // Create and configure orchestrator
    const orchestrator = new AgentOrchestrator({ projectPath });

    // Register all required agents
    orchestrator.registerAgent(new CodeAnalyzerAgent());
    orchestrator.registerAgent(new CodeReviewAgent());
    orchestrator.registerAgent(new BackendAuditorAgent());
    orchestrator.registerAgent(new FrontendAuditorAgent());
    orchestrator.registerAgent(new AuditorAgent());

    await orchestrator.start();

    try {
        // Execute workflow
        const workflow = new CodeQualityWorkflow(orchestrator);
        const results = await workflow.execute({
            projectPath,
            failOnQualityScore: 70,
            checkBackend: true,
            checkFrontend: true,
            generateReport: true
        });

        // Display results
        console.log('\n📋 RESULTS SUMMARY');
        console.log('='.repeat(60));
        console.log(`Quality Score: ${results.qualityScore}/100`);
        console.log(`Total issues: ${results.issues.length}`);
        console.log(`Status: ${results.passed ? '✅ PASSED' : '❌ FAILED'}`);
        console.log(`Duration: ${results.duration}ms`);

        if (!results.passed) {
            console.log('\n⚠️  Quality score below threshold');
            process.exit(1);
        } else {
            console.log('\n✅ Code quality meets standards');
            process.exit(0);
        }

    } catch (error) {
        console.error('\n❌ Code quality analysis failed:', error.message);
        process.exit(1);
    } finally {
        await orchestrator.stop();
    }
}

// Run if executed directly
if (require.main === module) {
    runCodeQuality().catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}

module.exports = { runCodeQuality };
