#!/usr/bin/env node

/**
 * DIY Librarian Agent
 *
 * Automatically organizes, classifies, and maintains your .standards-local/ library.
 * Inspired by the commercial Equilateral AI librarian agent.
 *
 * Features:
 * - Auto-classify new standards into correct categories
 * - Generate cross-references between related standards
 * - Create indexes and TOCs
 * - Archive deprecated standards
 * - Validate standard format
 *
 * Usage:
 *   node scripts/librarian-agent.js [--dry-run] [--verbose]
 */

const fs = require('fs');
const path = require('path');

// Configuration
const config = {
    standardsDir: '.standards-local',
    archiveDir: '.standards-local/.archive',
    dryRun: process.argv.includes('--dry-run'),
    verbose: process.argv.includes('--verbose')
};

/**
 * Load all markdown files from standards directory
 */
function loadStandardsFiles() {
    const standards = [];

    if (!fs.existsSync(config.standardsDir)) {
        log('⚠️  No .standards-local/ directory found');
        return standards;
    }

    function scanDirectory(dir, category = '') {
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);

            if (entry.isDirectory() && entry.name !== '.archive') {
                scanDirectory(fullPath, entry.name);
            } else if (entry.isFile() && entry.name.endsWith('.md') && entry.name !== 'README.md') {
                standards.push({
                    filename: entry.name,
                    path: fullPath,
                    category: category || 'uncategorized',
                    content: fs.readFileSync(fullPath, 'utf8')
                });
            }
        }
    }

    scanDirectory(config.standardsDir);
    return standards;
}

/**
 * Parse markdown frontmatter and content
 */
function parseStandard(standard) {
    const content = standard.content;

    // Extract title (first # heading)
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : standard.filename.replace('.md', '');

    // Extract sections
    const sections = {
        problem: extractSection(content, 'Problem'),
        cost: extractSection(content, 'Cost of Violation'),
        rule: extractSection(content, 'Rule'),
        examples: extractSection(content, 'Examples'),
        detection: extractSection(content, 'Detection'),
        related: extractSection(content, 'Related Standards')
    };

    // Extract keywords from content
    const keywords = extractKeywords(content);

    // Determine suggested category from content
    const suggestedCategory = suggestCategory(title, content, keywords);

    return {
        ...standard,
        title,
        sections,
        keywords,
        suggestedCategory,
        isComplete: validateStandardFormat(sections),
        isDeprecated: content.toLowerCase().includes('deprecated') || content.toLowerCase().includes('archived')
    };
}

/**
 * Extract a section from markdown
 */
function extractSection(content, sectionName) {
    const regex = new RegExp(`##\\s+${sectionName}\\s*\\n([\\s\\S]*?)(?=\\n##|$)`, 'i');
    const match = content.match(regex);
    return match ? match[1].trim() : null;
}

/**
 * Extract keywords from content
 */
function extractKeywords(content) {
    const keywords = new Set();

    // Common programming/security terms
    const importantTerms = [
        // Security
        'authentication', 'authorization', 'credential', 'password', 'token', 'secret',
        'encryption', 'hash', 'sql injection', 'xss', 'csrf', 'vulnerability',

        // Architecture
        'error handling', 'validation', 'null pointer', 'type error', 'async',
        'promise', 'callback', 'event', 'state', 'immutable',

        // Performance
        'n+1', 'query', 'database', 'cache', 'memory', 'timeout', 'optimization',
        'index', 'join', 'eager loading',

        // Testing
        'mock', 'stub', 'fixture', 'integration test', 'unit test', 'test coverage',

        // Deployment
        'environment', 'configuration', 'deployment', 'rollback', 'migration'
    ];

    const lowerContent = content.toLowerCase();

    for (const term of importantTerms) {
        if (lowerContent.includes(term)) {
            keywords.add(term);
        }
    }

    return Array.from(keywords);
}

/**
 * Suggest category based on content analysis
 */
function suggestCategory(title, content, keywords) {
    const categories = {
        security: ['auth', 'credential', 'password', 'token', 'secret', 'encryption', 'vulnerability', 'injection', 'xss', 'csrf'],
        architecture: ['error', 'validation', 'null', 'type', 'async', 'promise', 'state', 'design'],
        performance: ['n+1', 'query', 'database', 'cache', 'memory', 'timeout', 'optimization', 'slow', 'index'],
        testing: ['mock', 'test', 'fixture', 'coverage', 'assertion'],
        deployment: ['environment', 'configuration', 'deployment', 'rollback', 'migration', 'build']
    };

    const scores = {};
    const lowerTitle = title.toLowerCase();
    const lowerContent = content.toLowerCase();

    for (const [category, terms] of Object.entries(categories)) {
        scores[category] = 0;

        for (const term of terms) {
            // Title matches are worth more
            if (lowerTitle.includes(term)) {
                scores[category] += 3;
            }

            // Content matches
            const contentMatches = (lowerContent.match(new RegExp(term, 'g')) || []).length;
            scores[category] += contentMatches;
        }
    }

    // Find highest scoring category
    let maxScore = 0;
    let bestCategory = 'architecture'; // default

    for (const [category, score] of Object.entries(scores)) {
        if (score > maxScore) {
            maxScore = score;
            bestCategory = category;
        }
    }

    return maxScore > 0 ? bestCategory : 'architecture';
}

/**
 * Validate standard has required sections
 */
function validateStandardFormat(sections) {
    const requiredSections = ['problem', 'rule', 'examples'];

    for (const section of requiredSections) {
        if (!sections[section]) {
            return false;
        }
    }

    return true;
}

/**
 * Find cross-references between standards
 */
function findCrossReferences(standards) {
    const references = [];

    for (let i = 0; i < standards.length; i++) {
        for (let j = i + 1; j < standards.length; j++) {
            const standardA = standards[i];
            const standardB = standards[j];

            // Check for keyword overlap
            const sharedKeywords = standardA.keywords.filter(k =>
                standardB.keywords.includes(k)
            );

            if (sharedKeywords.length >= 2) {
                references.push({
                    from: standardA.filename,
                    to: standardB.filename,
                    sharedKeywords,
                    strength: sharedKeywords.length
                });

                references.push({
                    from: standardB.filename,
                    to: standardA.filename,
                    sharedKeywords,
                    strength: sharedKeywords.length
                });
            }
        }
    }

    return references;
}

/**
 * Move standard to suggested category
 */
function organizeStandard(standard) {
    if (standard.category === standard.suggestedCategory) {
        log(`✅ ${standard.filename} already in correct category (${standard.category})`, 'verbose');
        return null;
    }

    const targetDir = path.join(config.standardsDir, standard.suggestedCategory);
    const targetPath = path.join(targetDir, standard.filename);

    if (!fs.existsSync(targetDir)) {
        log(`📁 Creating directory: ${standard.suggestedCategory}`, 'verbose');
        if (!config.dryRun) {
            fs.mkdirSync(targetDir, { recursive: true });
        }
    }

    log(`📦 Moving ${standard.filename}: ${standard.category} → ${standard.suggestedCategory}`);

    if (!config.dryRun) {
        fs.renameSync(standard.path, targetPath);
    }

    return {
        from: standard.path,
        to: targetPath,
        fromCategory: standard.category,
        toCategory: standard.suggestedCategory
    };
}

/**
 * Archive deprecated standard
 */
function archiveStandard(standard) {
    const archiveDir = config.archiveDir;
    const archivePath = path.join(archiveDir, standard.filename);

    if (!fs.existsSync(archiveDir)) {
        if (!config.dryRun) {
            fs.mkdirSync(archiveDir, { recursive: true });
        }
    }

    log(`📚 Archiving deprecated standard: ${standard.filename}`);

    if (!config.dryRun) {
        fs.renameSync(standard.path, archivePath);
    }

    return { from: standard.path, to: archivePath };
}

/**
 * Generate README for category
 */
function generateCategoryREADME(category, standards) {
    const categoryStandards = standards.filter(s => s.suggestedCategory === category);

    if (categoryStandards.length === 0) return null;

    const lines = [];

    lines.push(`# ${category.charAt(0).toUpperCase() + category.slice(1)} Standards`);
    lines.push('');
    lines.push(`**Total Standards:** ${categoryStandards.length}`);
    lines.push('');

    lines.push('## Standards in this Category');
    lines.push('');

    // Group by completeness
    const complete = categoryStandards.filter(s => s.isComplete);
    const incomplete = categoryStandards.filter(s => !s.isComplete);

    if (complete.length > 0) {
        lines.push('### Complete Standards');
        lines.push('');

        for (const standard of complete.sort((a, b) => a.title.localeCompare(b.title))) {
            lines.push(`- [${standard.title}](./${standard.filename})`);

            if (standard.keywords.length > 0) {
                lines.push(`  - Keywords: ${standard.keywords.slice(0, 5).join(', ')}`);
            }
        }

        lines.push('');
    }

    if (incomplete.length > 0) {
        lines.push('### Incomplete Standards (Missing Required Sections)');
        lines.push('');

        for (const standard of incomplete) {
            lines.push(`- [${standard.title}](./${standard.filename}) ⚠️`);

            const missingSections = [];
            if (!standard.sections.problem) missingSections.push('Problem');
            if (!standard.sections.rule) missingSections.push('Rule');
            if (!standard.sections.examples) missingSections.push('Examples');

            if (missingSections.length > 0) {
                lines.push(`  - Missing: ${missingSections.join(', ')}`);
            }
        }

        lines.push('');
    }

    return lines.join('\n');
}

/**
 * Generate master index
 */
function generateMasterIndex(standards, crossReferences) {
    const lines = [];

    lines.push('# Standards Library Index');
    lines.push('');
    lines.push(`**Last Updated:** ${new Date().toISOString()}`);
    lines.push(`**Total Standards:** ${standards.length}`);
    lines.push('');

    // By category
    lines.push('## By Category');
    lines.push('');

    const categories = [...new Set(standards.map(s => s.suggestedCategory))].sort();

    for (const category of categories) {
        const categoryStandards = standards.filter(s => s.suggestedCategory === category);
        lines.push(`### ${category.charAt(0).toUpperCase() + category.slice(1)} (${categoryStandards.length})`);
        lines.push('');

        for (const standard of categoryStandards.sort((a, b) => a.title.localeCompare(b.title))) {
            lines.push(`- [${standard.title}](./${category}/${standard.filename})`);
        }

        lines.push('');
    }

    // By keyword
    lines.push('## By Keyword');
    lines.push('');

    const keywordMap = new Map();

    for (const standard of standards) {
        for (const keyword of standard.keywords) {
            if (!keywordMap.has(keyword)) {
                keywordMap.set(keyword, []);
            }
            keywordMap.get(keyword).push(standard);
        }
    }

    const sortedKeywords = Array.from(keywordMap.keys()).sort();

    for (const keyword of sortedKeywords) {
        const keywordStandards = keywordMap.get(keyword);
        lines.push(`### ${keyword} (${keywordStandards.length})`);

        for (const standard of keywordStandards.slice(0, 10)) { // Top 10 per keyword
            lines.push(`- [${standard.title}](./${standard.suggestedCategory}/${standard.filename})`);
        }

        if (keywordStandards.length > 10) {
            lines.push(`- *(${keywordStandards.length - 10} more...)*`);
        }

        lines.push('');
    }

    // Highly connected standards
    lines.push('## Highly Connected Standards');
    lines.push('');
    lines.push('Standards with many cross-references to other standards:');
    lines.push('');

    const connectionCounts = new Map();

    for (const ref of crossReferences) {
        connectionCounts.set(
            ref.from,
            (connectionCounts.get(ref.from) || 0) + 1
        );
    }

    const topConnected = Array.from(connectionCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

    for (const [filename, count] of topConnected) {
        const standard = standards.find(s => s.filename === filename);
        if (standard) {
            lines.push(`- [${standard.title}](./${standard.suggestedCategory}/${filename}) - ${count} connections`);
        }
    }

    lines.push('');

    return lines.join('\n');
}

/**
 * Logging utility
 */
function log(message, level = 'info') {
    if (level === 'verbose' && !config.verbose) return;

    console.log(message);
}

/**
 * Main execution
 */
async function main() {
    console.log('📚 Librarian Agent - Organizing standards library...\n');

    if (config.dryRun) {
        console.log('🏃 DRY RUN MODE - No files will be modified\n');
    }

    // Load all standards
    log('📖 Loading standards files...');
    let standards = loadStandardsFiles();

    if (standards.length === 0) {
        console.log('❌ No standards found in .standards-local/');
        console.log('   Create your first standard: cp .standards-local-template/security/credential-scanning.md .standards-local/\n');
        return;
    }

    log(`✅ Loaded ${standards.length} standards\n`);

    // Parse and analyze
    log('🔍 Parsing and analyzing standards...');
    standards = standards.map(parseStandard);

    // Validate completeness
    const incomplete = standards.filter(s => !s.isComplete);
    if (incomplete.length > 0) {
        log(`\n⚠️  Found ${incomplete.length} incomplete standards (missing required sections):`);
        for (const standard of incomplete) {
            log(`   - ${standard.filename}`);
        }
        log('');
    }

    // Find deprecated
    const deprecated = standards.filter(s => s.isDeprecated);

    // Organize standards
    log('📦 Organizing standards by category...');
    const moves = [];

    for (const standard of standards.filter(s => !s.isDeprecated)) {
        const move = organizeStandard(standard);
        if (move) {
            moves.push(move);
        }
    }

    if (moves.length === 0) {
        log('✅ All standards already in correct categories\n');
    } else {
        log(`✅ Organized ${moves.length} standards\n`);
    }

    // Archive deprecated
    if (deprecated.length > 0) {
        log('📚 Archiving deprecated standards...');

        for (const standard of deprecated) {
            archiveStandard(standard);
        }

        log(`✅ Archived ${deprecated.length} standards\n`);
    }

    // Find cross-references
    log('🔗 Finding cross-references...');
    const crossReferences = findCrossReferences(standards.filter(s => !s.isDeprecated));
    log(`✅ Found ${crossReferences.length} cross-references\n`);

    // Generate category READMEs
    log('📝 Generating category READMEs...');
    const categories = [...new Set(standards.map(s => s.suggestedCategory))];

    for (const category of categories) {
        const readme = generateCategoryREADME(category, standards);
        if (readme) {
            const readmePath = path.join(config.standardsDir, category, 'README.md');

            if (!config.dryRun) {
                fs.writeFileSync(readmePath, readme);
            }

            log(`✅ Generated ${category}/README.md`, 'verbose');
        }
    }

    log(`✅ Generated ${categories.length} category READMEs\n`);

    // Generate master index
    log('📇 Generating master index...');
    const masterIndex = generateMasterIndex(standards.filter(s => !s.isDeprecated), crossReferences);

    const indexPath = path.join(config.standardsDir, 'INDEX.md');
    if (!config.dryRun) {
        fs.writeFileSync(indexPath, masterIndex);
    }

    log(`✅ Generated INDEX.md\n`);

    // Summary
    console.log('=== SUMMARY ===\n');
    console.log(`📊 Total Standards: ${standards.length}`);
    console.log(`✅ Complete: ${standards.filter(s => s.isComplete).length}`);
    console.log(`⚠️  Incomplete: ${incomplete.length}`);
    console.log(`📚 Archived: ${deprecated.length}`);
    console.log(`📦 Reorganized: ${moves.length}`);
    console.log(`🔗 Cross-references: ${crossReferences.length / 2}`); // Divide by 2 (bidirectional)
    console.log('');

    console.log('📁 Categories:');
    for (const category of categories.sort()) {
        const count = standards.filter(s => s.suggestedCategory === category && !s.isDeprecated).length;
        console.log(`   - ${category}: ${count}`);
    }
    console.log('');

    if (!config.dryRun) {
        console.log('✨ Organization complete! Check .standards-local/INDEX.md for overview.\n');
    } else {
        console.log('🏃 DRY RUN complete. Run without --dry-run to apply changes.\n');
    }
}

// Run
main().catch(err => {
    console.error('❌ Error during organization:', err);
    process.exit(1);
});
