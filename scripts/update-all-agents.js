/**
 * Batch Update Script - Add PathScanningHelper to All Agents
 *
 * This script automatically updates all agent files to use PathScanningHelper
 */

const fs = require('fs');
const path = require('path');

// Agent configurations - what language/extensions each agent should scan
const agentConfigs = {
    // Development agents - JavaScript/TypeScript focus
    'CodeGeneratorAgent': { language: 'all', extensions: 'javascript: [".js", ".jsx", ".mjs", ".cjs"], typescript: [".ts", ".tsx"]' },
    'TestOrchestrationAgent': { language: 'all', extensions: 'all: [".js", ".ts", ".py", ".java"]' },
    'DeploymentValidationAgent': { language: 'all', extensions: 'all: [".js", ".ts", ".json", ".yaml", ".yml"]' },
    'TestAgent': { language: 'javascript', extensions: 'javascript: [".js", ".jsx", ".ts", ".tsx"]' },
    'UIUXSpecialistAgent': { language: 'all', extensions: 'all: [".js", ".jsx", ".ts", ".tsx", ".css", ".scss", ".html"]' },

    // Quality agents - All languages
    'AuditorAgent': { language: 'all', extensions: 'all: [".js", ".jsx", ".ts", ".tsx", ".py", ".java", ".go", ".rs"]' },
    'BackendAuditorAgent': { language: 'all', extensions: 'all: [".js", ".ts", ".py", ".java", ".go"]' },
    'FrontendAuditorAgent': { language: 'javascript', extensions: 'javascript: [".js", ".jsx", ".ts", ".tsx"]' },
    'TemplateValidationAgent': { language: 'all', extensions: 'all: [".json", ".yaml", ".yml", ".tf", ".template"]' },

    // Security agents - All languages
    'SecurityReviewerAgent': { language: 'all', extensions: 'all: [".js", ".ts", ".py", ".java", ".go", ".rs"]' },
    'SecurityVulnerabilityAgent': { language: 'all', extensions: 'all: [".js", ".ts", ".py", ".java", ".go", ".rs"]' },
    'ComplianceCheckAgent': { language: 'all', extensions: 'all: [".js", ".ts", ".py", ".java"]' },

    // Infrastructure agents - Config files + code
    'DeploymentAgent': { language: 'all', extensions: 'all: [".js", ".ts", ".json", ".yaml", ".yml"]' },
    'ResourceOptimizationAgent': { language: 'all', extensions: 'all: [".js", ".ts", ".json", ".yaml", ".yml", ".tf"]' },
    'ConfigurationManagementAgent': { language: 'all', extensions: 'all: [".json", ".yaml", ".yml", ".env", ".config"]' },
    'MonitoringOrchestrationAgent': { language: 'all', extensions: 'all: [".json", ".yaml", ".yml", ".js", ".ts"]' }
};

function updateAgentFile(filePath, agentName) {
    console.log(`\n📝 Updating: ${agentName}`);

    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    let modified = false;

    const config = agentConfigs[agentName] || { language: 'all', extensions: 'all: [".js", ".ts", ".py"]' };

    // Step 1: Add PathScanningHelper import if not present
    if (!content.includes('PathScanningHelper')) {
        console.log('  ✓ Adding PathScanningHelper import');

        // Find the BaseAgent import line
        const baseAgentImport = "const BaseAgent = require('../../equilateral-core/BaseAgent');";

        if (content.includes(baseAgentImport)) {
            content = content.replace(
                baseAgentImport,
                baseAgentImport + "\nconst PathScanningHelper = require('../../equilateral-core/PathScanningHelper');"
            );
            modified = true;
        } else {
            // Try alternative import pattern
            const altPattern = /const BaseAgent = require\(['"]\.\.\/\.\.\/equilateral-core\/BaseAgent['"]\);/;
            if (altPattern.test(content)) {
                content = content.replace(
                    altPattern,
                    "$&\nconst PathScanningHelper = require('../../equilateral-core/PathScanningHelper');"
                );
                modified = true;
            } else {
                console.log('  ⚠️  Could not find BaseAgent import - manual update needed');
            }
        }
    } else {
        console.log('  ✓ PathScanningHelper import already present');
    }

    // Step 2: Add pathScanner initialization in constructor (mark for manual review)
    if (!content.includes('this.pathScanner')) {
        console.log('  ⚠️  Need to add pathScanner initialization in constructor (manual)');
        console.log(`     Add after super() call:`);
        console.log(`     this.pathScanner = new PathScanningHelper({`);
        console.log(`         verbose: config.verbose !== false,`);
        console.log(`         extensions: { ${config.extensions} },`);
        console.log(`         maxDepth: config.maxDepth || 10`);
        console.log(`     });`);
    } else {
        console.log('  ✓ pathScanner already initialized');
    }

    // Step 3: Save if modified
    if (modified && content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('  ✅ File updated successfully');
        return { updated: true, manualReviewNeeded: !content.includes('this.pathScanner') };
    } else if (content.includes('PathScanningHelper') && content.includes('this.pathScanner')) {
        console.log('  ✅ Already fully updated');
        return { updated: false, manualReviewNeeded: false };
    } else {
        console.log('  ⚠️  Manual review needed');
        return { updated: modified, manualReviewNeeded: true };
    }
}

function main() {
    console.log('🚀 Starting batch agent update...\n');

    const agentDirs = [
        'agent-packs/development',
        'agent-packs/quality',
        'agent-packs/security',
        'agent-packs/infrastructure'
    ];

    const results = {
        total: 0,
        updated: 0,
        alreadyUpdated: 0,
        manualReview: 0
    };

    agentDirs.forEach(dir => {
        const fullPath = path.join(__dirname, '..', dir);

        if (!fs.existsSync(fullPath)) {
            console.log(`⚠️  Directory not found: ${dir}`);
            return;
        }

        const files = fs.readdirSync(fullPath).filter(f => f.endsWith('Agent.js'));

        files.forEach(file => {
            const agentName = file.replace('.js', '');

            // Skip already updated agents
            if (['CodeAnalyzerAgent', 'SecurityScannerAgent', 'CodeReviewAgent'].includes(agentName)) {
                console.log(`\n⏭️  Skipping ${agentName} (already updated)`);
                results.alreadyUpdated++;
                results.total++;
                return;
            }

            const filePath = path.join(fullPath, file);
            const result = updateAgentFile(filePath, agentName);

            results.total++;
            if (result.updated) results.updated++;
            if (result.manualReviewNeeded) results.manualReview++;
        });
    });

    console.log('\n' + '='.repeat(70));
    console.log('📊 Update Summary');
    console.log('='.repeat(70));
    console.log(`Total agents processed: ${results.total}`);
    console.log(`Already updated: ${results.alreadyUpdated}`);
    console.log(`Updated in this run: ${results.updated}`);
    console.log(`Require manual review: ${results.manualReview}`);
    console.log('='.repeat(70));

    if (results.manualReview > 0) {
        console.log('\n⚠️  Some agents require manual constructor updates');
        console.log('See output above for specific instructions');
    }

    console.log('\n✅ Batch update complete!');
}

if (require.main === module) {
    main();
}

module.exports = { updateAgentFile, agentConfigs };
