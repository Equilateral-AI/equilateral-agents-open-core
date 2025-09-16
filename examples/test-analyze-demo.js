#!/usr/bin/env node

/**
 * Test Analysis Demo - Example
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
 * Shows automated test execution and failure analysis.
 * Fix suggestions are provided but not automated.
 *
 * Note: Commercial version includes automatic fix generation
 */

const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
const chalk = require('chalk');
const readline = require('readline');

const AgentOrchestrator = require('../equilateral-core/AgentOrchestrator');
const BaseAgent = require('../equilateral-core/BaseAgent');

/**
 * TestRunnerAgent - Executes tests and captures results
 */
class TestRunnerAgent extends BaseAgent {
    constructor() {
        super('test-runner', 'Test Execution Agent');
    }

    async execute(task) {
        const { projectPath, testCommand = 'npm test' } = task;
        
        console.log(chalk.yellow('🧪 Running tests...'));
        
        try {
            const { stdout, stderr } = await execAsync(testCommand, { cwd: projectPath });
            const results = this.parseTestOutput(stdout + stderr);
            
            console.log(chalk.green(`   ✅ ${results.passed} tests passing`));
            if (results.failed > 0) {
                console.log(chalk.red(`   ❌ ${results.failed} tests failing`));
            }
            
            return { success: results.failed === 0, results };
        } catch (error) {
            // Test failure expected - parse the output
            const results = this.parseTestOutput(error.stdout + error.stderr);
            console.log(chalk.red(`   ❌ ${results.failed} test(s) failing`));
            return { success: false, results };
        }
    }

    parseTestOutput(output) {
        const results = {
            total: 0,
            passed: 0,
            failed: 0,
            failures: []
        };

        // Basic parsing for common test formats
        const failMatch = output.match(/(\d+)\s+fail/i);
        const passMatch = output.match(/(\d+)\s+pass/i);
        
        if (failMatch) results.failed = parseInt(failMatch[1]);
        if (passMatch) results.passed = parseInt(passMatch[1]);
        results.total = results.passed + results.failed;

        return results;
    }
}

/**
 * TestAnalyzerAgent - Analyzes test failures and suggests fixes
 * 
 * Note: This is simplified. Commercial version uses AI for deeper analysis.
 */
class TestAnalyzerAgent extends BaseAgent {
    constructor() {
        super('test-analyzer', 'Test Analysis Agent');
    }

    async execute(task) {
        const { testResults } = task;
        
        console.log(chalk.yellow('\n🔍 Analyzing test failures...'));
        
        const analysis = {
            patterns: [],
            suggestions: []
        };

        // Simple pattern matching (commercial version uses AI)
        if (testResults.failed > 0) {
            analysis.patterns.push({
                type: 'test-failures',
                count: testResults.failed,
                severity: testResults.failed > 5 ? 'high' : 'medium'
            });

            // Basic suggestions (commercial version generates actual fixes)
            analysis.suggestions.push({
                title: 'Review Test Failures',
                description: `Found ${testResults.failed} failing tests that need attention`,
                action: 'Run tests with --verbose flag for details'
            });

            if (testResults.failed > testResults.passed) {
                analysis.suggestions.push({
                    title: 'Critical Test Health',
                    description: 'More tests failing than passing',
                    action: 'Consider reverting recent changes'
                });
            }
        }

        console.log(chalk.cyan('   📊 Analysis complete'));
        analysis.patterns.forEach(pattern => {
            console.log(chalk.gray(`   • ${pattern.type}: ${pattern.count} issues`));
        });

        return { success: true, analysis };
    }
}

/**
 * Main Demo Runner
 */
async function runTestAnalysisDemo() {
    console.log(chalk.cyan.bold('\n🚀 Test Analysis Demo'));
    console.log(chalk.cyan('━'.repeat(60) + '\n'));
    
    console.log(chalk.white('This demo shows automated test analysis in action.'));
    console.log(chalk.gray('  • Run your test suite'));
    console.log(chalk.gray('  • Analyze failure patterns'));
    console.log(chalk.gray('  • Get actionable insights\n'));
    
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    const question = (query) => new Promise((resolve) => rl.question(query, resolve));
    
    // Demo options
    console.log(chalk.yellow('Choose demo:'));
    console.log('1. Simulate test failures');
    console.log('2. Analyze current directory');
    console.log('3. View commercial features\n');
    
    const choice = await question(chalk.cyan('Select (1-3): '));
    rl.close();
    
    // Initialize orchestrator and agents
    const orchestrator = new AgentOrchestrator();
    const testRunner = new TestRunnerAgent();
    const analyzer = new TestAnalyzerAgent();
    
    orchestrator.registerAgent(testRunner);
    orchestrator.registerAgent(analyzer);
    
    if (choice === '1') {
        // Simulate test execution
        console.log(chalk.magenta.bold('\n═══ Running Test Suite ═══\n'));
        
        const mockResults = {
            success: false,
            results: {
                total: 50,
                passed: 42,
                failed: 8,
                failures: []
            }
        };
        
        console.log(chalk.yellow('🧪 Running tests...'));
        await new Promise(r => setTimeout(r, 1500));
        console.log(chalk.green(`   ✅ ${mockResults.results.passed} tests passing`));
        console.log(chalk.red(`   ❌ ${mockResults.results.failed} tests failing`));
        
        // Analyze results
        console.log(chalk.magenta.bold('\n═══ Analyzing Failures ═══\n'));
        
        const analysis = await analyzer.execute({
            testResults: mockResults.results
        });
        
        // Show suggestions
        console.log(chalk.magenta.bold('\n═══ Suggested Actions ═══\n'));
        
        analysis.analysis.suggestions.forEach(suggestion => {
            console.log(chalk.yellow(`📌 ${suggestion.title}`));
            console.log(chalk.white(`   ${suggestion.description}`));
            console.log(chalk.gray(`   → ${suggestion.action}\n`));
        });
        
    } else if (choice === '2') {
        console.log(chalk.yellow('\n⚠️  Running against current directory...\n'));
        
        const result = await testRunner.execute({
            projectPath: process.cwd(),
            testCommand: 'echo "No test command configured"'
        });
        
        if (!result.success) {
            await analyzer.execute({ testResults: result.results });
        }
        
    } else if (choice === '3') {
        showCommercialFeatures();
    }
    
    showValueProp();
}

function showCommercialFeatures() {
    console.log(chalk.cyan.bold('\n📊 Feature Comparison\n'));
    
    console.log(chalk.white('Different versions for different needs:\n'));
    
    console.log(chalk.green('Open Source (You are here!)'));
    console.log(chalk.gray('  • Sequential agent execution'));
    console.log(chalk.gray('  • File-based persistence'));
    console.log(chalk.gray('  • Community support'));
    console.log(chalk.gray('  • Perfect for: Personal projects, learning\n'));
    
    console.log(chalk.yellow('Professional'));
    console.log(chalk.gray('  • Parallel execution'));
    console.log(chalk.gray('  • Database persistence'));
    console.log(chalk.gray('  • Advanced analysis'));
    console.log(chalk.gray('  • Perfect for: Teams, startups\n'));
    
    console.log(chalk.magenta('Enterprise'));
    console.log(chalk.gray('  • Distributed orchestration'));
    console.log(chalk.gray('  • Compliance features'));
    console.log(chalk.gray('  • SLA support'));
    console.log(chalk.gray('  • Perfect for: Large organizations\n'));
}

function showValueProp() {
    console.log(chalk.cyan('━'.repeat(60)));
    console.log(chalk.green.bold('\n✅ Test Analysis Complete\n'));
    
    console.log(chalk.white('You can extend this with your own agents:'));
    console.log(chalk.gray('  • Add custom analysis patterns'));
    console.log(chalk.gray('  • Integrate with your CI/CD'));
    console.log(chalk.gray('  • Build workflow automation'));
    console.log(chalk.gray('  • Create team-specific tools\n'));
    
    console.log(chalk.gray('Questions? Join our Discord community!'));
    console.log(chalk.cyan('━'.repeat(60) + '\n'));
}

// Run the demo
if (require.main === module) {
    runTestAnalysisDemo().catch(console.error);
}

module.exports = { TestRunnerAgent, TestAnalyzerAgent };