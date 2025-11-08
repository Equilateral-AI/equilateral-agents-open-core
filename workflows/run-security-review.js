#!/usr/bin/env node

/**
 * Executable Security Review Workflow
 *
 * Run with: npm run workflow:security
 * Or: node workflows/run-security-review.js
 */

const AgentOrchestrator = require('../equilateral-core/AgentOrchestrator');
const SecurityReviewWorkflow = require('./security-review-workflow');
const SecurityScannerAgent = require('../agent-packs/security/SecurityScannerAgent');
const SecurityReviewerAgent = require('../agent-packs/security/SecurityReviewerAgent');
const SecurityVulnerabilityAgent = require('../agent-packs/security/SecurityVulnerabilityAgent');
const ComplianceCheckAgent = require('../agent-packs/security/ComplianceCheckAgent');

async function runSecurityReview() {
    // Parse command line arguments
    const args = process.argv.slice(2);
    const projectPath = args[0] || process.cwd();

    console.log('🔐 EquilateralAgents Security Review');
    console.log(`   Project: ${projectPath}\n`);

    // Create and configure orchestrator
    const orchestrator = new AgentOrchestrator({ projectPath });

    // Register all required agents
    orchestrator.registerAgent(new SecurityScannerAgent());
    orchestrator.registerAgent(new SecurityReviewerAgent());
    orchestrator.registerAgent(new SecurityVulnerabilityAgent());
    orchestrator.registerAgent(new ComplianceCheckAgent());

    await orchestrator.start();

    try {
        // Execute workflow
        const workflow = new SecurityReviewWorkflow(orchestrator);
        const results = await workflow.execute({
            projectPath,
            severity: 'medium',
            includeCompliance: true,
            parallelExecution: true
        });

        // Display results
        console.log('\n📋 RESULTS SUMMARY');
        console.log('='.repeat(60));
        console.log(`Total findings: ${results.findings.length}`);
        console.log(`Status: ${results.success ? '✅ PASSED' : '❌ FAILED'}`);
        console.log(`Duration: ${results.duration}ms`);

        if (results.summary.actionRequired) {
            console.log('\n⚠️  ACTION REQUIRED: Review findings and address issues');
            process.exit(1);
        } else {
            console.log('\n✅ No critical security issues found');
            process.exit(0);
        }

    } catch (error) {
        console.error('\n❌ Security review failed:', error.message);
        process.exit(1);
    } finally {
        await orchestrator.stop();
    }
}

// Run if executed directly
if (require.main === module) {
    runSecurityReview().catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}

module.exports = { runSecurityReview };
