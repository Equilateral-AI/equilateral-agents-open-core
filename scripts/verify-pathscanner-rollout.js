/**
 * Verify PathScanningHelper rollout to all agents
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying PathScanningHelper rollout...\n');

const agentFiles = [
    // Development agents
    { path: 'agent-packs/development/CodeAnalyzerAgent.js', name: 'CodeAnalyzerAgent' },
    { path: 'agent-packs/development/CodeGeneratorAgent.js', name: 'CodeGeneratorAgent' },
    { path: 'agent-packs/development/TestOrchestrationAgent.js', name: 'TestOrchestrationAgent' },
    { path: 'agent-packs/development/DeploymentValidationAgent.js', name: 'DeploymentValidationAgent' },
    { path: 'agent-packs/development/TestAgent.js', name: 'TestAgent' },
    { path: 'agent-packs/development/UIUXSpecialistAgent.js', name: 'UIUXSpecialistAgent' },

    // Quality agents
    { path: 'agent-packs/quality/CodeReviewAgent.js', name: 'CodeReviewAgent' },
    { path: 'agent-packs/quality/AuditorAgent.js', name: 'AuditorAgent' },
    { path: 'agent-packs/quality/BackendAuditorAgent.js', name: 'BackendAuditorAgent' },
    { path: 'agent-packs/quality/FrontendAuditorAgent.js', name: 'FrontendAuditorAgent' },
    { path: 'agent-packs/quality/TemplateValidationAgent.js', name: 'TemplateValidationAgent' },

    // Security agents
    { path: 'agent-packs/security/SecurityScannerAgent.js', name: 'SecurityScannerAgent' },
    { path: 'agent-packs/security/ComplianceCheckAgent.js', name: 'ComplianceCheckAgent' },
    { path: 'agent-packs/security/SecurityReviewerAgent.js', name: 'SecurityReviewerAgent' },
    { path: 'agent-packs/security/SecurityVulnerabilityAgent.js', name: 'SecurityVulnerabilityAgent' },

    // Infrastructure agents
    { path: 'agent-packs/infrastructure/DeploymentAgent.js', name: 'DeploymentAgent' },
    { path: 'agent-packs/infrastructure/ResourceOptimizationAgent.js', name: 'ResourceOptimizationAgent' },
    { path: 'agent-packs/infrastructure/ConfigurationManagementAgent.js', name: 'ConfigurationManagementAgent' },
    { path: 'agent-packs/infrastructure/MonitoringOrchestrationAgent.js', name: 'MonitoringOrchestrationAgent' }
];

let passed = 0;
let failed = 0;
const failedAgents = [];

agentFiles.forEach(({ path: relPath, name }) => {
    const fullPath = path.join(__dirname, '..', relPath);

    if (!fs.existsSync(fullPath)) {
        console.log(`❌ ${name} - File not found: ${relPath}`);
        failed++;
        failedAgents.push({ name, reason: 'File not found' });
        return;
    }

    const content = fs.readFileSync(fullPath, 'utf8');

    // Check for import
    const hasImport = content.includes("require('../../equilateral-core/PathScanningHelper')");

    // Check for initialization
    const hasInit = content.includes('this.pathScanner = new PathScanningHelper');

    if (hasImport && hasInit) {
        console.log(`✅ ${name} - Fully updated`);
        passed++;
    } else {
        const missing = [];
        if (!hasImport) missing.push('import');
        if (!hasInit) missing.push('initialization');
        console.log(`❌ ${name} - Missing: ${missing.join(', ')}`);
        failed++;
        failedAgents.push({
            name,
            reason: `Missing ${missing.join(', ')}`
        });
    }
});

console.log('\n' + '='.repeat(70));
console.log('📊 PathScanningHelper Rollout Verification');
console.log('='.repeat(70));
console.log(`Total agents: ${agentFiles.length}`);
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log('='.repeat(70));

if (failed > 0) {
    console.log('\n❌ Failed agents:');
    failedAgents.forEach(({ name, reason }) => {
        console.log(`  - ${name}: ${reason}`);
    });
} else {
    console.log('\n🎉 All agents successfully updated with PathScanningHelper!');
}

process.exit(failed > 0 ? 1 : 0);
