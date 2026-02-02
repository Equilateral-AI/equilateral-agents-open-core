#!/usr/bin/env node
/**
 * Standards Loader
 *
 * Scans .standards/ (or .equilateral-standards/) for YAML rule files
 * and outputs formatted enforcement directives to stdout.
 *
 * YAML standards use the Equilateral schema:
 *   id, category, priority, rules[{action, rule}], anti_patterns[], ...
 *
 * Usage: node standards-loader.js [project-root]
 * Exit 0 with empty output if no standards found (non-breaking).
 */

const fs = require('fs');
const path = require('path');

const MAX_RULES = 30;
const projectRoot = process.argv[2] || process.cwd();

// Action mapping: YAML action values -> output format
const ACTION_MAP = {
    'ALWAYS': 'REQUIRE',
    'NEVER': 'AVOID',
    'USE': 'REQUIRE',
    'PREFER': 'PREFER',
    'AVOID': 'AVOID'
};

function findStandardsDir() {
    const candidates = [
        path.join(projectRoot, '.standards'),
        path.join(projectRoot, '.equilateral-standards')
    ];
    for (const dir of candidates) {
        if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) {
            return dir;
        }
    }
    return null;
}

/**
 * Line-by-line YAML parser for standards files.
 * Handles the Equilateral schema: id, category, priority, rules[{action, rule}], anti_patterns[]
 * No external dependencies required.
 */
function parseStandardsYaml(content) {
    const result = { rules: [], priority: 30 };

    // Extract top-level scalars
    const priorityMatch = content.match(/^priority:\s*(\d+)/m);
    if (priorityMatch) {
        result.priority = parseInt(priorityMatch[1], 10);
    }

    const idMatch = content.match(/^id:\s*(.+)/m);
    if (idMatch) {
        result.id = idMatch[1].trim();
    }

    // Parse rules[] block line by line
    const lines = content.split('\n');
    let section = null; // 'rules' | 'anti_patterns' | null
    let currentRule = null;

    for (const line of lines) {
        // Detect top-level section starts
        if (line.match(/^rules:\s*$/)) {
            section = 'rules';
            continue;
        }
        if (line.match(/^anti_patterns:\s*$/)) {
            if (currentRule) { result.rules.push(currentRule); currentRule = null; }
            section = 'anti_patterns';
            continue;
        }
        // Any other top-level key ends the current section
        if (line.match(/^\w/) && !line.match(/^\s/)) {
            if (currentRule) { result.rules.push(currentRule); currentRule = null; }
            section = null;
            continue;
        }

        if (section === 'rules') {
            const actionLine = line.match(/^\s+-\s+action:\s*(\w+)/);
            if (actionLine) {
                if (currentRule) result.rules.push(currentRule);
                const rawAction = actionLine[1];
                currentRule = { action: ACTION_MAP[rawAction] || 'PREFER' };
                continue;
            }
            if (currentRule) {
                const ruleLine = line.match(/^\s+rule:\s*"(.+)"/);
                if (ruleLine) {
                    currentRule.description = ruleLine[1];
                    currentRule.source = result.id || 'unknown';
                }
            }
        }

        if (section === 'anti_patterns') {
            const antiLine = line.match(/^\s+-\s*"(.+)"/);
            if (antiLine && antiLine[1].length > 10) {
                result.rules.push({
                    action: 'AVOID',
                    description: antiLine[1],
                    source: result.id || 'unknown'
                });
            }
        }
    }

    // Flush last rule
    if (currentRule && currentRule.description) {
        result.rules.push(currentRule);
    }

    return result;
}

function scanForYamlFiles(dir) {
    const files = [];

    function walk(d) {
        try {
            const entries = fs.readdirSync(d, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(d, entry.name);
                if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
                    walk(fullPath);
                } else if (entry.isFile() && (entry.name.endsWith('.yaml') || entry.name.endsWith('.yml'))) {
                    // Skip non-standard YAML (CI configs, templates, etc.)
                    if (entry.name === 'TEMPLATE.yaml') continue;
                    files.push(fullPath);
                }
            }
        } catch (err) {
            // Skip unreadable directories
        }
    }

    // Check for yaml/ subdirectory first (standard location)
    const yamlDir = path.join(dir, 'yaml');
    if (fs.existsSync(yamlDir) && fs.statSync(yamlDir).isDirectory()) {
        walk(yamlDir);
    } else {
        walk(dir);
    }

    return files;
}

function loadRulesFromDir(standardsDir) {
    const yamlFiles = scanForYamlFiles(standardsDir);
    if (yamlFiles.length === 0) return [];

    const allStandards = [];

    for (const file of yamlFiles) {
        try {
            const content = fs.readFileSync(file, 'utf-8');
            // Quick check: does this look like a standards file?
            if (!content.includes('rules:') || !content.includes('action:')) continue;
            const parsed = parseStandardsYaml(content);
            if (parsed.rules.length > 0) {
                allStandards.push(parsed);
            }
        } catch (err) {
            // Skip unreadable files
        }
    }

    // Sort by priority (lower = more important)
    allStandards.sort((a, b) => a.priority - b.priority);

    // Collect rules, respecting priority order
    const rules = [];
    for (const standard of allStandards) {
        for (const rule of standard.rules) {
            rules.push(rule);
            if (rules.length >= MAX_RULES) return rules;
        }
    }

    return rules;
}

function deduplicateRules(rules) {
    const seen = new Set();
    return rules.filter(rule => {
        const key = rule.description.toLowerCase().slice(0, 60);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

function formatRules(rules) {
    // Sort: REQUIRE first, then AVOID, then PREFER
    const priority = { REQUIRE: 0, AVOID: 1, PREFER: 2 };
    rules.sort((a, b) => priority[a.action] - priority[b.action]);

    return rules
        .slice(0, MAX_RULES)
        .map(r => `[${r.action}] ${r.description}`)
        .join('\n');
}

// Main
const standardsDir = findStandardsDir();
if (!standardsDir) {
    process.exit(0);
}

let rules = loadRulesFromDir(standardsDir);
rules = deduplicateRules(rules);
const output = formatRules(rules);

if (output) {
    process.stdout.write(output + '\n');
}
