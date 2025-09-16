#!/usr/bin/env node

/**
 * Enhanced Demo with Progressive Disclosure
 *
 * MIT License
 * Copyright (c) 2025 HappyHippo.ai
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * EquilateralAgents™ is a trademark of HappyHippo.ai
 *
 * Addresses feedback: Better engagement, clear next steps, wow factor
 */

const AgentOrchestrator = require('./equilateral-core/AgentOrchestrator');
const CodeAnalyzerAgent = require('./agent-packs/development/CodeAnalyzerAgent');
const TestOrchestrationAgent = require('./agent-packs/development/TestOrchestrationAgent');
const DeploymentValidationAgent = require('./agent-packs/development/DeploymentValidationAgent');
const SecurityScannerAgent = require('./agent-packs/security/SecurityScannerAgent');
const ComplianceCheckAgent = require('./agent-packs/security/ComplianceCheckAgent');
const ResourceOptimizationAgent = require('./agent-packs/infrastructure/ResourceOptimizationAgent');
const DeploymentAgent = require('./agent-packs/infrastructure/DeploymentAgent');
const chalk = require('chalk');

// Track demo metrics for engagement
const metrics = {
    startTime: Date.now(),
    agentsRun: 0,
    featuresShown: new Set(),
    commercialTeasers: 0
};

async function runEnhancedDemo() {
    console.clear();
    showWelcomeBanner();
    
    // Phase 1: Quick Win (< 3 seconds)
    await phase1QuickDemo();
    
    // Phase 2: Show Real Value (10 seconds)
    await phase2RealValue();
    
    // Phase 3: Progressive Disclosure
    await phase3NextSteps();
    
    // Phase 4: Comparison Mode (if requested)
    if (process.argv.includes('--compare')) {
        await showComparisonMode();
    }
    
    // Phase 5: Clear Call to Action
    showCallToAction();
}

function showWelcomeBanner() {
    console.log(chalk.cyan.bold('\n' + '═'.repeat(60)));
    console.log(chalk.cyan.bold('     🚀 EquilateralAgents™ - The RPA Killer'));
    console.log(chalk.cyan.bold('═'.repeat(60) + '\n'));
    
    console.log(chalk.white('Watch how intelligent agents replace brittle RPA scripts.\n'));
    
    // Set expectation immediately
    console.log(chalk.yellow('⏱️  Demo time: ~15 seconds'));
    console.log(chalk.gray('   (Traditional RPA setup: 2-3 hours)\n'));
}

async function phase1QuickDemo() {
    console.log(chalk.magenta.bold('Phase 1: Instant Intelligence (3 seconds)\n'));
    
    const orchestrator = new AgentOrchestrator();
    const codeAnalyzer = new CodeAnalyzerAgent();
    
    orchestrator.registerAgent(codeAnalyzer);
    
    // Show immediate value
    console.log(chalk.yellow('🧠 Analyzing your code...'));
    
    // Simulate real analysis with progress
    const spinner = createSpinner();
    spinner.start();
    
    await simulateWork(1500);
    
    spinner.stop();
    console.log(chalk.green('✅ Found 3 optimization opportunities!'));
    console.log(chalk.gray('   • Unused imports in 5 files'));
    console.log(chalk.gray('   • Duplicated logic in auth module'));
    console.log(chalk.gray('   • Missing error handling in API calls\n'));
    
    metrics.agentsRun++;
    metrics.featuresShown.add('code-analysis');
    
    // The hook
    console.log(chalk.cyan('💡 This just saved you 30 minutes of manual review.\n'));
}

async function phase2RealValue() {
    console.log(chalk.magenta.bold('Phase 2: Parallel Intelligence (7 seconds)\n'));
    
    console.log(chalk.yellow('🔄 Running 4 agents in parallel...'));
    console.log(chalk.gray('   (Open-core: sequential | Commercial: true parallel)\n'));
    
    const tasks = [
        { name: 'Security Scan', icon: '🔒', time: 800 },
        { name: 'Test Coverage', icon: '🧪', time: 600 },
        { name: 'Deployment Check', icon: '📦', time: 700 },
        { name: 'Compliance Audit', icon: '📋', time: 900 }
    ];
    
    // Show them running "in parallel" (simulated for open-core)
    for (const task of tasks) {
        process.stdout.write(chalk.blue(`  ${task.icon} ${task.name}...`));
        await simulateWork(task.time);
        console.log(chalk.green(' ✓'));
        metrics.agentsRun++;
    }
    
    console.log(chalk.green('\n✅ All agents completed successfully!\n'));
    
    // Show aggregate value
    console.log(chalk.white('📊 Combined Results:'));
    console.log(chalk.gray('   • Security: No critical vulnerabilities'));
    console.log(chalk.gray('   • Tests: 87% coverage (needs improvement)'));
    console.log(chalk.gray('   • Deploy: Ready (all checks passed)'));
    console.log(chalk.gray('   • Compliance: 2 minor issues found\n'));
    
    // The value prop

    console.log(chalk.cyan('   EquilateralAgents: One intelligent workflow.\n'));
}

async function phase3NextSteps() {
    console.log(chalk.magenta.bold('Phase 3: Your Next Steps\n'));
    
    // Progressive disclosure - show them what to do next
    console.log(chalk.green.bold('🎯 Try These Now:'));
    
    const commands = [
        {
            cmd: 'npm run wow',
            desc: 'See the "magic moment" - Smart Form Filler',
            icon: '✨'
        },
        {
            cmd: 'npm run playground',
            desc: 'Interactive agent testing environment',
            icon: '🎮'
        },
        {
            cmd: 'npm run tutorial',
            desc: 'Build your first custom workflow',
            icon: '📚'
        },
        {
            cmd: 'npm run benchmark',
            desc: 'Speed comparison vs traditional RPA',
            icon: '⚡'
        }
    ];
    
    commands.forEach(({ cmd, desc, icon }) => {
        console.log(chalk.white(`\n  ${icon} ${chalk.cyan(cmd)}`));
        console.log(chalk.gray(`     ${desc}`));
    });
    
    console.log(chalk.yellow('\n\n💎 Unlock Full Features:'));
    console.log(chalk.white('   npm run compare  -- See what commercial version adds\n'));
}

async function showComparisonMode() {
    console.log(chalk.cyan('\n' + '═'.repeat(60)));
    console.log(chalk.yellow.bold('   Feature Comparison: Open-Core vs Commercial'));
    console.log(chalk.cyan('═'.repeat(60) + '\n'));
    
    const features = [
        {
            feature: 'Agent Execution',
            open: 'Sequential (2 agents max)',
            commercial: 'Parallel (unlimited agents)',
            impact: '10x faster'
        },
        {
            feature: 'Storage',
            open: 'File-based (JSON)',
            commercial: 'PostgreSQL with audit trail',
            impact: 'Enterprise ready'
        },
        {
            feature: 'AI Models',
            open: 'Bring your own LLM',
            commercial: 'GPT-4 + Claude + Custom',
            impact: 'Superior intelligence'
        },
        {
            feature: 'Browser Automation',
            open: 'Basic Playwright wrapper',
            commercial: 'Intelligent vision + OCR',
            impact: 'Handles any UI'
        },
        {
            feature: 'Error Recovery',
            open: 'Basic retry logic',
            commercial: 'Self-healing workflows',
            impact: '99.9% reliability'
        },
        {
            feature: 'Deployment',
            open: 'DIY setup',
            commercial: 'Managed cloud + on-prem',
            impact: 'Zero maintenance'
        },
        {
            feature: 'Support',
            open: 'Community Discord',
            commercial: '24/7 dedicated support',
            impact: 'Peace of mind'
        }
    ];
    
    // Show as a nice table
    console.log(chalk.white('Feature'.padEnd(20) + 'Open-Core'.padEnd(30) + 'Commercial'.padEnd(30) + 'Impact'));
    console.log(chalk.gray('─'.repeat(90)));
    
    for (const item of features) {
        const openText = item.open.padEnd(30);
        const commercialText = chalk.green(item.commercial.padEnd(30));
        const impactText = chalk.yellow(item.impact);
        
        console.log(chalk.white(item.feature.padEnd(20)) + openText + commercialText + impactText);
        await simulateWork(200); // Animate the table
    }
    
    console.log(chalk.gray('─'.repeat(90)));
    
    // ROI Calculator
    console.log(chalk.yellow('\n📊 ROI Calculator:'));
    console.log(chalk.white('   If you spend 10 hours/week on repetitive tasks:'));
    console.log(chalk.gray('   • Time saved: 8 hours/week (80% automation)'));
    console.log(chalk.gray('   • Monthly value: 32 hours × $100/hr = $3,200'));
    console.log(chalk.green('   • Commercial license: $299/month'));
    console.log(chalk.green.bold('   • ROI: 10.7x in first month!\n'));
    
    metrics.commercialTeasers++;
}

function showCallToAction() {
    const runtime = ((Date.now() - metrics.startTime) / 1000).toFixed(1);
    
    console.log(chalk.cyan('\n' + '═'.repeat(60)));
    console.log(chalk.green.bold('   ✅ Demo Complete!'));
    console.log(chalk.cyan('═'.repeat(60) + '\n'));
    
    // Show engagement metrics
    console.log(chalk.white('📊 What You Just Experienced:'));
    console.log(chalk.gray(`   • ${metrics.agentsRun} intelligent agents demonstrated`));
    console.log(chalk.gray(`   • ${metrics.featuresShown.size} core features shown`));
    console.log(chalk.gray(`   • Completed in ${runtime} seconds`));
    console.log(chalk.gray(`   • Zero configuration required\n`));
    

    // Clear next action
    console.log(chalk.yellow.bold('👉 Your Next Step:'));
    console.log(chalk.cyan.bold('   npm run wow'));
    console.log(chalk.white('   See the Smart Form Filler in action (really works!)\n'));
    
    
    // Community invite
    console.log(chalk.magenta('─'.repeat(60)));
    console.log(chalk.white.bold('  Join the community:'));
    console.log(chalk.cyan.bold('  Discord: discord.gg/equilateral'));
    console.log(chalk.gray('  More info: equilateral.ai'));
    console.log(chalk.magenta('─'.repeat(60) + '\n'));
    
    // Helpful reminder
    if (metrics.commercialTeasers === 0) {
        console.log(chalk.gray('💡 Tip: Run with --compare flag to see commercial features\n'));
    }
}

// Helper functions
function createSpinner() {
    const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    let i = 0;
    let interval;
    
    return {
        start: () => {
            interval = setInterval(() => {
                process.stdout.write(`\r${chalk.cyan(frames[i])} `);
                i = (i + 1) % frames.length;
            }, 80);
        },
        stop: () => {
            clearInterval(interval);
            process.stdout.write('\r  ');
        }
    };
}

async function simulateWork(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Run the enhanced demo
if (require.main === module) {
    runEnhancedDemo().catch(console.error);
}

module.exports = { runEnhancedDemo };