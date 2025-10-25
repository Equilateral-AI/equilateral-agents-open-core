/**
 * Add pathScanner initialization to all agent constructors
 */

const fs = require('fs');
const path = require('path');

const constructorCode = {
    'CodeGeneratorAgent': `
        // Initialize path scanner for code generation
        this.pathScanner = new PathScanningHelper({
            verbose: config.verbose !== false,
            extensions: {
                javascript: ['.js', '.jsx', '.mjs', '.cjs'],
                typescript: ['.ts', '.tsx']
            },
            maxDepth: config.maxDepth || 10
        });`,

    'TestOrchestrationAgent': `
        // Initialize path scanner for test orchestration
        this.pathScanner = new PathScanningHelper({
            verbose: config.verbose !== false,
            extensions: {
                all: ['.js', '.ts', '.py', '.java']
            },
            maxDepth: config.maxDepth || 10
        });`,

    'DeploymentValidationAgent': `
        // Initialize path scanner for deployment validation
        this.pathScanner = new PathScanningHelper({
            verbose: config.verbose !== false,
            extensions: {
                all: ['.js', '.ts', '.json', '.yaml', '.yml']
            },
            maxDepth: config.maxDepth || 10
        });`,

    'TestAgent': `
        // Initialize path scanner for UI testing
        this.pathScanner = new PathScanningHelper({
            verbose: config.verbose !== false,
            extensions: {
                javascript: ['.js', '.jsx', '.ts', '.tsx']
            },
            maxDepth: config.maxDepth || 10
        });`,

    'UIUXSpecialistAgent': `
        // Initialize path scanner for UI/UX validation
        this.pathScanner = new PathScanningHelper({
            verbose: config.verbose !== false,
            extensions: {
                all: ['.js', '.jsx', '.ts', '.tsx', '.css', '.scss', '.html']
            },
            maxDepth: config.maxDepth || 10
        });`,

    'AuditorAgent': `
        // Initialize path scanner for code auditing
        this.pathScanner = new PathScanningHelper({
            verbose: config.verbose !== false,
            extensions: {
                all: ['.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.go', '.rs']
            },
            maxDepth: config.maxDepth || 10
        });`,

    'BackendAuditorAgent': `
        // Initialize path scanner for backend auditing
        this.pathScanner = new PathScanningHelper({
            verbose: config.verbose !== false,
            extensions: {
                all: ['.js', '.ts', '.py', '.java', '.go']
            },
            maxDepth: config.maxDepth || 10
        });`,

    'FrontendAuditorAgent': `
        // Initialize path scanner for frontend auditing
        this.pathScanner = new PathScanningHelper({
            verbose: config.verbose !== false,
            extensions: {
                javascript: ['.js', '.jsx', '.ts', '.tsx']
            },
            maxDepth: config.maxDepth || 10
        });`,

    'TemplateValidationAgent': `
        // Initialize path scanner for template validation
        this.pathScanner = new PathScanningHelper({
            verbose: config.verbose !== false,
            extensions: {
                all: ['.json', '.yaml', '.yml', '.tf', '.template']
            },
            maxDepth: config.maxDepth || 10
        });`,

    'ComplianceCheckAgent': `
        // Initialize path scanner for compliance checking
        this.pathScanner = new PathScanningHelper({
            verbose: config.verbose !== false,
            extensions: {
                all: ['.js', '.ts', '.py', '.java']
            },
            maxDepth: config.maxDepth || 10
        });`,

    'SecurityReviewerAgent': `
        // Initialize path scanner for security review
        this.pathScanner = new PathScanningHelper({
            verbose: config.verbose !== false,
            extensions: {
                all: ['.js', '.ts', '.py', '.java', '.go', '.rs']
            },
            maxDepth: config.maxDepth || 10
        });`,

    'SecurityVulnerabilityAgent': `
        // Initialize path scanner for vulnerability scanning
        this.pathScanner = new PathScanningHelper({
            verbose: config.verbose !== false,
            extensions: {
                all: ['.js', '.ts', '.py', '.java', '.go', '.rs']
            },
            maxDepth: config.maxDepth || 10
        });`,

    'DeploymentAgent': `
        // Initialize path scanner for deployment
        this.pathScanner = new PathScanningHelper({
            verbose: config.verbose !== false,
            extensions: {
                all: ['.js', '.ts', '.json', '.yaml', '.yml']
            },
            maxDepth: config.maxDepth || 10
        });`,

    'ResourceOptimizationAgent': `
        // Initialize path scanner for resource optimization
        this.pathScanner = new PathScanningHelper({
            verbose: config.verbose !== false,
            extensions: {
                all: ['.js', '.ts', '.json', '.yaml', '.yml', '.tf']
            },
            maxDepth: config.maxDepth || 10
        });`,

    'ConfigurationManagementAgent': `
        // Initialize path scanner for configuration management
        this.pathScanner = new PathScanningHelper({
            verbose: config.verbose !== false,
            extensions: {
                all: ['.json', '.yaml', '.yml', '.env', '.config']
            },
            maxDepth: config.maxDepth || 10
        });`,

    'MonitoringOrchestrationAgent': `
        // Initialize path scanner for monitoring orchestration
        this.pathScanner = new PathScanningHelper({
            verbose: config.verbose !== false,
            extensions: {
                all: ['.json', '.yaml', '.yml', '.js', '.ts']
            },
            maxDepth: config.maxDepth || 10
        });`
};

function addPathScannerToConstructor(filePath, agentName) {
    if (!constructorCode[agentName]) {
        console.log(`⏭️  No constructor code for ${agentName}`);
        return false;
    }

    let content = fs.readFileSync(filePath, 'utf8');

    // Check if already has pathScanner
    if (content.includes('this.pathScanner')) {
        console.log(`✅ ${agentName} already has pathScanner`);
        return false;
    }

    // Find constructor and add pathScanner after super() call
    // Look for common patterns
    const patterns = [
        // Pattern 1: super({ ... });
        /(super\(\{[\s\S]*?\}\);)/,
        // Pattern 2: super('agent-id', { ... });
        /(super\(['"][^'"]+['"],\s*\{[\s\S]*?\}\);)/,
        // Pattern 3: Just super();
        /(super\(\);)/
    ];

    let modified = false;
    for (const pattern of patterns) {
        if (pattern.test(content)) {
            content = content.replace(pattern, `$1${constructorCode[agentName]}`);
            modified = true;
            break;
        }
    }

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ ${agentName} - Added pathScanner to constructor`);
        return true;
    } else {
        console.log(`⚠️  ${agentName} - Could not find constructor pattern`);
        return false;
    }
}

function main() {
    console.log('🚀 Adding pathScanner to agent constructors...\n');

    const agentFiles = [
        { path: 'agent-packs/development/CodeGeneratorAgent.js', name: 'CodeGeneratorAgent' },
        { path: 'agent-packs/development/TestOrchestrationAgent.js', name: 'TestOrchestrationAgent' },
        { path: 'agent-packs/development/DeploymentValidationAgent.js', name: 'DeploymentValidationAgent' },
        { path: 'agent-packs/development/TestAgent.js', name: 'TestAgent' },
        { path: 'agent-packs/development/UIUXSpecialistAgent.js', name: 'UIUXSpecialistAgent' },
        { path: 'agent-packs/quality/AuditorAgent.js', name: 'AuditorAgent' },
        { path: 'agent-packs/quality/BackendAuditorAgent.js', name: 'BackendAuditorAgent' },
        { path: 'agent-packs/quality/FrontendAuditorAgent.js', name: 'FrontendAuditorAgent' },
        { path: 'agent-packs/quality/TemplateValidationAgent.js', name: 'TemplateValidationAgent' },
        { path: 'agent-packs/security/ComplianceCheckAgent.js', name: 'ComplianceCheckAgent' },
        { path: 'agent-packs/security/SecurityReviewerAgent.js', name: 'SecurityReviewerAgent' },
        { path: 'agent-packs/security/SecurityVulnerabilityAgent.js', name: 'SecurityVulnerabilityAgent' },
        { path: 'agent-packs/infrastructure/DeploymentAgent.js', name: 'DeploymentAgent' },
        { path: 'agent-packs/infrastructure/ResourceOptimizationAgent.js', name: 'ResourceOptimizationAgent' },
        { path: 'agent-packs/infrastructure/ConfigurationManagementAgent.js', name: 'ConfigurationManagementAgent' },
        { path: 'agent-packs/infrastructure/MonitoringOrchestrationAgent.js', name: 'MonitoringOrchestrationAgent' }
    ];

    let updated = 0;
    let alreadyUpdated = 0;
    let failed = 0;

    agentFiles.forEach(({ path: relPath, name }) => {
        const fullPath = path.join(__dirname, '..', relPath);

        if (!fs.existsSync(fullPath)) {
            console.log(`❌ File not found: ${relPath}`);
            failed++;
            return;
        }

        const result = addPathScannerToConstructor(fullPath, name);
        if (result) {
            updated++;
        } else if (fs.readFileSync(fullPath, 'utf8').includes('this.pathScanner')) {
            alreadyUpdated++;
        } else {
            failed++;
        }
    });

    console.log('\n' + '='.repeat(70));
    console.log('📊 Constructor Update Summary');
    console.log('='.repeat(70));
    console.log(`Total agents: ${agentFiles.length}`);
    console.log(`Updated: ${updated}`);
    console.log(`Already had pathScanner: ${alreadyUpdated}`);
    console.log(`Failed/Manual review needed: ${failed}`);
    console.log('='.repeat(70));
}

if (require.main === module) {
    main();
}

module.exports = { addPathScannerToConstructor, constructorCode };
