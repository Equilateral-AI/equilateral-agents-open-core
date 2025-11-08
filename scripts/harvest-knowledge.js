#!/usr/bin/env node

/**
 * Knowledge Harvest Script
 *
 * Scans agent memory files, identifies patterns, and generates recommendations
 * for new standards to create.
 *
 * Usage:
 *   node scripts/harvest-knowledge.js [--since=7d] [--min-occurrences=3]
 */

const fs = require('fs');
const path = require('path');

// Configuration
const config = {
    memoryDir: '.equilateral/agent-memory',
    workflowHistoryFile: '.equilateral/workflow-history.json',
    minOccurrences: parseInt(process.env.MIN_OCCURRENCES || '3'),
    successThreshold: parseFloat(process.env.SUCCESS_THRESHOLD || '0.85'),
    sinceDays: parseInt(process.env.SINCE_DAYS || '7')
};

// Parse command line args
process.argv.forEach(arg => {
    if (arg.startsWith('--since=')) {
        const value = arg.split('=')[1];
        config.sinceDays = parseInt(value.replace(/d$/, ''));
    }
    if (arg.startsWith('--min-occurrences=')) {
        config.minOccurrences = parseInt(arg.split('=')[1]);
    }
});

/**
 * Load and parse all agent memory files
 */
function loadAgentMemories() {
    const memories = {};

    if (!fs.existsSync(config.memoryDir)) {
        console.log(`⚠️  No agent memory directory found at ${config.memoryDir}`);
        return memories;
    }

    const files = fs.readdirSync(config.memoryDir)
        .filter(f => f.endsWith('.json'));

    for (const file of files) {
        const agentName = file.replace('-memory.json', '');
        const filePath = path.join(config.memoryDir, file);

        try {
            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            memories[agentName] = data;
        } catch (err) {
            console.log(`⚠️  Could not parse ${file}: ${err.message}`);
        }
    }

    return memories;
}

/**
 * Filter executions by time window
 */
function filterByTimeWindow(executions, sinceDays) {
    const cutoff = Date.now() - (sinceDays * 24 * 60 * 60 * 1000);

    return executions.filter(exec => {
        const timestamp = new Date(exec.timestamp || exec.startTime).getTime();
        return timestamp >= cutoff;
    });
}

/**
 * Analyze error patterns across agent executions
 */
function analyzeErrorPatterns(memories) {
    const errorPatterns = new Map();

    for (const [agentName, memory] of Object.entries(memories)) {
        const executions = memory.history || memory.executions || [];
        const recentExecutions = filterByTimeWindow(executions, config.sinceDays);

        for (const exec of recentExecutions) {
            if (exec.status === 'error' || exec.status === 'failed') {
                const errorType = exec.error?.type || exec.error?.name || 'UnknownError';
                const errorMessage = exec.error?.message || exec.error || 'Unknown error';

                // Create pattern key (type + first 50 chars of message)
                const patternKey = `${errorType}:${errorMessage.substring(0, 50)}`;

                if (!errorPatterns.has(patternKey)) {
                    errorPatterns.set(patternKey, {
                        type: errorType,
                        message: errorMessage,
                        count: 0,
                        agents: new Set(),
                        firstSeen: exec.timestamp,
                        lastSeen: exec.timestamp,
                        examples: []
                    });
                }

                const pattern = errorPatterns.get(patternKey);
                pattern.count++;
                pattern.agents.add(agentName);
                pattern.lastSeen = exec.timestamp;

                if (pattern.examples.length < 3) {
                    pattern.examples.push({
                        agent: agentName,
                        timestamp: exec.timestamp,
                        context: exec.taskData || exec.context
                    });
                }
            }
        }
    }

    return Array.from(errorPatterns.values())
        .sort((a, b) => b.count - a.count);
}

/**
 * Analyze successful patterns (optimizations that worked)
 */
function analyzeSuccessPatterns(memories) {
    const successPatterns = new Map();

    for (const [agentName, memory] of Object.entries(memories)) {
        const executions = memory.history || memory.executions || [];
        const recentExecutions = filterByTimeWindow(executions, config.sinceDays);

        for (const exec of recentExecutions) {
            if (exec.status === 'success' && exec.optimizationApplied) {
                const optimization = exec.optimizationApplied;
                const patternKey = typeof optimization === 'string'
                    ? optimization
                    : optimization.type || 'unknown';

                if (!successPatterns.has(patternKey)) {
                    successPatterns.set(patternKey, {
                        optimization: patternKey,
                        count: 0,
                        agents: new Set(),
                        avgTimeSaved: 0,
                        timeSavedSamples: [],
                        examples: []
                    });
                }

                const pattern = successPatterns.get(patternKey);
                pattern.count++;
                pattern.agents.add(agentName);

                if (exec.timeSaved) {
                    pattern.timeSavedSamples.push(exec.timeSaved);
                }

                if (pattern.examples.length < 3) {
                    pattern.examples.push({
                        agent: agentName,
                        timestamp: exec.timestamp,
                        result: exec.result
                    });
                }
            }
        }
    }

    // Calculate average time saved
    for (const pattern of successPatterns.values()) {
        if (pattern.timeSavedSamples.length > 0) {
            pattern.avgTimeSaved = pattern.timeSavedSamples.reduce((a, b) => a + b, 0)
                / pattern.timeSavedSamples.length;
        }
        pattern.agents = Array.from(pattern.agents);
    }

    return Array.from(successPatterns.values())
        .sort((a, b) => b.count - a.count);
}

/**
 * Calculate success rate for each agent
 */
function calculateSuccessRates(memories) {
    const rates = {};

    for (const [agentName, memory] of Object.entries(memories)) {
        const executions = memory.history || memory.executions || [];
        const recentExecutions = filterByTimeWindow(executions, config.sinceDays);

        if (recentExecutions.length === 0) continue;

        const successful = recentExecutions.filter(e =>
            e.status === 'success' || e.status === 'completed'
        ).length;

        rates[agentName] = {
            total: recentExecutions.length,
            successful,
            failed: recentExecutions.length - successful,
            successRate: successful / recentExecutions.length,
            trend: calculateTrend(recentExecutions)
        };
    }

    return rates;
}

/**
 * Calculate trend (improving, declining, stable)
 */
function calculateTrend(executions) {
    if (executions.length < 10) return 'insufficient-data';

    const firstHalf = executions.slice(0, Math.floor(executions.length / 2));
    const secondHalf = executions.slice(Math.floor(executions.length / 2));

    const firstRate = firstHalf.filter(e => e.status === 'success').length / firstHalf.length;
    const secondRate = secondHalf.filter(e => e.status === 'success').length / secondHalf.length;

    const delta = secondRate - firstRate;

    if (delta > 0.1) return 'improving';
    if (delta < -0.1) return 'declining';
    return 'stable';
}

/**
 * Identify knowledge gaps (areas with low success rates)
 */
function identifyKnowledgeGaps(successRates) {
    return Object.entries(successRates)
        .filter(([_, rate]) => rate.successRate < config.successThreshold)
        .map(([agent, rate]) => ({
            agent,
            successRate: rate.successRate,
            failureCount: rate.failed,
            total: rate.total,
            trend: rate.trend
        }))
        .sort((a, b) => a.successRate - b.successRate);
}

/**
 * Generate standard recommendations
 */
function generateRecommendations(errorPatterns, successPatterns, knowledgeGaps) {
    const recommendations = [];

    // Recommend standards for recurring errors
    for (const pattern of errorPatterns) {
        if (pattern.count >= config.minOccurrences) {
            recommendations.push({
                priority: pattern.count >= 5 ? 'HIGH' : 'MEDIUM',
                type: 'error-prevention',
                title: `Prevent ${pattern.type}`,
                reason: `Occurred ${pattern.count} times across ${pattern.agents.size} agent(s)`,
                suggestedCategory: categorizeError(pattern.type),
                suggestedFile: suggestFileName(pattern.type),
                pattern,
                actionItems: [
                    'Document "What Happened" using examples from pattern',
                    `Estimate cost: ${pattern.count} occurrences × avg debug time`,
                    'Define rule to prevent this error type',
                    'Add detection to relevant agent(s)',
                    'Create test cases for this pattern'
                ]
            });
        }
    }

    // Recommend standards for successful optimizations
    for (const pattern of successPatterns) {
        if (pattern.count >= config.minOccurrences) {
            const avgTimeSavedHours = pattern.avgTimeSaved / 3600000; // ms to hours

            recommendations.push({
                priority: avgTimeSavedHours > 1 ? 'HIGH' : 'MEDIUM',
                type: 'optimization',
                title: `Codify ${pattern.optimization}`,
                reason: `Worked ${pattern.count} times, avg ${avgTimeSavedHours.toFixed(1)}h saved`,
                suggestedCategory: 'performance',
                suggestedFile: suggestFileName(pattern.optimization),
                pattern,
                actionItems: [
                    'Document successful pattern as standard',
                    'Create before/after examples',
                    'Measure ROI (time saved × occurrences)',
                    'Add to CLAUDE.md for AI reference',
                    'Consider automating detection'
                ]
            });
        }
    }

    // Recommend standards for knowledge gaps
    for (const gap of knowledgeGaps) {
        recommendations.push({
            priority: gap.successRate < 0.5 ? 'HIGH' : 'LOW',
            type: 'knowledge-gap',
            title: `Improve ${gap.agent} Success Rate`,
            reason: `Only ${(gap.successRate * 100).toFixed(1)}% success rate (${gap.failureCount} failures)`,
            suggestedCategory: 'architecture',
            suggestedFile: `${gap.agent}-patterns.md`,
            gap,
            actionItems: [
                'Review failure patterns for this agent',
                'Identify common root causes',
                'Document what works vs what doesn't',
                'Create checklist for this agent type',
                'Update agent configuration if needed'
            ]
        });
    }

    return recommendations.sort((a, b) => {
        const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
}

/**
 * Categorize error type into standard category
 */
function categorizeError(errorType) {
    const categories = {
        security: ['auth', 'credential', 'permission', 'security', 'vulnerability'],
        performance: ['timeout', 'slow', 'memory', 'performance', 'n+1'],
        architecture: ['null', 'undefined', 'type', 'validation', 'error'],
        testing: ['test', 'assertion', 'mock', 'fixture'],
        deployment: ['deploy', 'build', 'configuration', 'environment']
    };

    const lowerType = errorType.toLowerCase();

    for (const [category, keywords] of Object.entries(categories)) {
        if (keywords.some(keyword => lowerType.includes(keyword))) {
            return category;
        }
    }

    return 'architecture'; // default
}

/**
 * Suggest filename for standard
 */
function suggestFileName(patternName) {
    return patternName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        + '.md';
}

/**
 * Generate markdown report
 */
function generateReport(errorPatterns, successPatterns, successRates, recommendations) {
    const report = [];

    report.push('# Knowledge Harvest Report');
    report.push('');
    report.push(`**Generated:** ${new Date().toISOString()}`);
    report.push(`**Period:** Last ${config.sinceDays} days`);
    report.push(`**Min Occurrences:** ${config.minOccurrences}`);
    report.push('');

    // Executive Summary
    report.push('## Executive Summary');
    report.push('');
    report.push(`- **Recurring Errors:** ${errorPatterns.filter(p => p.count >= config.minOccurrences).length}`);
    report.push(`- **Successful Patterns:** ${successPatterns.filter(p => p.count >= config.minOccurrences).length}`);
    report.push(`- **Recommended Standards:** ${recommendations.length}`);
    report.push('');

    // Recommendations
    report.push('## Recommended Standards to Create');
    report.push('');

    if (recommendations.length === 0) {
        report.push('*No new standards recommended at this time.*');
        report.push('');
        report.push('Continue executing workflows and check back in a week.');
    } else {
        for (const rec of recommendations) {
            report.push(`### ${rec.priority === 'HIGH' ? '🔴' : rec.priority === 'MEDIUM' ? '🟡' : '🟢'} ${rec.title}`);
            report.push('');
            report.push(`**Priority:** ${rec.priority}`);
            report.push(`**Type:** ${rec.type}`);
            report.push(`**Reason:** ${rec.reason}`);
            report.push('');
            report.push(`**Suggested Location:** \`.standards-local/${rec.suggestedCategory}/${rec.suggestedFile}\``);
            report.push('');
            report.push('**Action Items:**');
            for (const item of rec.actionItems) {
                report.push(`- [ ] ${item}`);
            }
            report.push('');
        }
    }

    // Detailed Patterns
    report.push('## Detailed Analysis');
    report.push('');

    report.push('### Recurring Errors (3+ occurrences)');
    report.push('');

    const significantErrors = errorPatterns.filter(p => p.count >= config.minOccurrences);
    if (significantErrors.length === 0) {
        report.push('*No recurring errors found.*');
    } else {
        for (const pattern of significantErrors) {
            report.push(`#### ${pattern.type}`);
            report.push(`- **Count:** ${pattern.count} occurrences`);
            report.push(`- **Agents:** ${Array.from(pattern.agents).join(', ')}`);
            report.push(`- **Message:** ${pattern.message.substring(0, 100)}`);
            report.push('');
        }
    }
    report.push('');

    report.push('### Successful Patterns (3+ occurrences)');
    report.push('');

    const significantSuccesses = successPatterns.filter(p => p.count >= config.minOccurrences);
    if (significantSuccesses.length === 0) {
        report.push('*No recurring success patterns found.*');
    } else {
        for (const pattern of significantSuccesses) {
            report.push(`#### ${pattern.optimization}`);
            report.push(`- **Count:** ${pattern.count} times`);
            report.push(`- **Agents:** ${pattern.agents.join(', ')}`);
            if (pattern.avgTimeSaved > 0) {
                report.push(`- **Avg Time Saved:** ${(pattern.avgTimeSaved / 1000).toFixed(1)}s`);
            }
            report.push('');
        }
    }
    report.push('');

    report.push('### Agent Success Rates');
    report.push('');
    for (const [agent, rate] of Object.entries(successRates).sort((a, b) => a[1].successRate - b[1].successRate)) {
        const emoji = rate.successRate >= 0.85 ? '✅' : rate.successRate >= 0.5 ? '⚠️' : '❌';
        const trend = rate.trend === 'improving' ? '📈' : rate.trend === 'declining' ? '📉' : '➡️';

        report.push(`${emoji} **${agent}**: ${(rate.successRate * 100).toFixed(1)}% (${rate.successful}/${rate.total}) ${trend}`);
    }
    report.push('');

    return report.join('\n');
}

/**
 * Main execution
 */
async function main() {
    console.log('🔍 Knowledge Harvest - Scanning agent memories...\n');

    // Load data
    const memories = loadAgentMemories();

    if (Object.keys(memories).length === 0) {
        console.log('❌ No agent memory files found.');
        console.log('   Run some workflows first: npm run workflow:security\n');
        return;
    }

    console.log(`✅ Loaded ${Object.keys(memories).length} agent memories\n`);

    // Analyze patterns
    console.log('🔎 Analyzing error patterns...');
    const errorPatterns = analyzeErrorPatterns(memories);

    console.log('🔎 Analyzing success patterns...');
    const successPatterns = analyzeSuccessPatterns(memories);

    console.log('🔎 Calculating success rates...');
    const successRates = calculateSuccessRates(memories);

    console.log('🔎 Identifying knowledge gaps...');
    const knowledgeGaps = identifyKnowledgeGaps(successRates);

    console.log('🔎 Generating recommendations...\n');
    const recommendations = generateRecommendations(errorPatterns, successPatterns, knowledgeGaps);

    // Generate report
    const report = generateReport(errorPatterns, successPatterns, successRates, recommendations);

    // Save report
    const reportPath = '.equilateral/knowledge-harvest-report.md';
    fs.writeFileSync(reportPath, report);

    console.log(`✅ Report saved to ${reportPath}\n`);

    // Console summary
    console.log('=== SUMMARY ===\n');
    console.log(`📊 Analyzed last ${config.sinceDays} days of agent activity`);
    console.log(`🔴 Found ${errorPatterns.filter(p => p.count >= config.minOccurrences).length} recurring error patterns`);
    console.log(`🟢 Found ${successPatterns.filter(p => p.count >= config.minOccurrences).length} successful optimization patterns`);
    console.log(`📝 Recommended ${recommendations.filter(r => r.priority === 'HIGH').length} HIGH priority standards`);
    console.log(`📝 Recommended ${recommendations.filter(r => r.priority === 'MEDIUM').length} MEDIUM priority standards\n`);

    if (recommendations.length > 0) {
        console.log('🎯 Top Recommendations:\n');
        for (const rec of recommendations.slice(0, 5)) {
            const emoji = rec.priority === 'HIGH' ? '🔴' : rec.priority === 'MEDIUM' ? '🟡' : '🟢';
            console.log(`   ${emoji} ${rec.title}`);
            console.log(`      → ${rec.reason}`);
            console.log(`      → Create: .standards-local/${rec.suggestedCategory}/${rec.suggestedFile}\n`);
        }

        console.log(`📄 See full report: ${reportPath}\n`);
    } else {
        console.log('✨ No new standards recommended at this time.');
        console.log('   Continue executing workflows and check back in a week.\n');
    }
}

// Run
main().catch(err => {
    console.error('❌ Error during knowledge harvest:', err);
    process.exit(1);
});
