/**
 * Test Orchestration Agent - Open Core Edition
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
 * Basic test orchestration and reporting capabilities.
 * Commercial tiers include intelligent test generation and ML-based optimization.
 */

const BaseAgent = require('../../equilateral-core/BaseAgent');
const PathScanningHelper = require('../../equilateral-core/PathScanningHelper');
const fs = require('fs').promises;
const path = require('path');
const { spawn } = require('child_process');

class TestOrchestrationAgent extends BaseAgent {
    constructor(config = {}) {
        super('test-orchestration', {
            agentType: 'quality',
            capabilities: ['basic_test_execution', 'test_reporting', 'coverage_analysis'],
            ...config
        });
        // Initialize path scanner for test orchestration
        this.pathScanner = new PathScanningHelper({
            verbose: config.verbose !== false,
            extensions: {
                all: ['.js', '.ts', '.py', '.java']
            },
            maxDepth: config.maxDepth || 10
        });

        this.supportedFrameworks = ['jest', 'mocha', 'pytest', 'junit'];
        this.testResults = new Map();
    }

    /**
     * Perform test orchestration task
     */
    async performTask(taskType, taskData, taskContext) {
        switch (taskType) {
            case 'run_tests':
                return await this.runTestSuite(taskData);
            case 'run_quality_tests':
                return await this.runQualityTests(taskData);
            case 'analyze_coverage':
                return await this.analyzeCoverage(taskData);
            case 'generate_report':
                return await this.generateTestReport(taskData);
            default:
                throw new Error(`Unknown test task: ${taskType}`);
        }
    }

    /**
     * Run basic test suite
     */
    async runTestSuite(taskData) {
        const { projectPath, framework = 'auto', testPattern } = taskData;
        
        try {
            const detectedFramework = await this.detectTestFramework(projectPath, framework);
            const testCommand = this.buildTestCommand(detectedFramework, testPattern);
            
            console.log(`Running ${detectedFramework} tests...`);
            const result = await this.executeTestCommand(testCommand, projectPath);
            
            // Check if should suggest commercial upgrade
            if (result.totalTests > 50) {
                console.log('\n🚀 Upgrade to Professional for intelligent test optimization:');
                console.log('   → AI-powered test generation and maintenance');
                console.log('   → Intelligent test optimization');
                console.log('   → Predictive test failure analysis');
                console.log('   → 60% faster test execution + better coverage\n');
            }

            await this.logActivity('test_suite_executed', {
                framework: detectedFramework,
                total_tests: result.totalTests,
                passed: result.passed,
                failed: result.failed,
                execution_time: result.executionTime
            });

            return {
                framework: detectedFramework,
                test_results: result,
                upgrade_recommended: result.totalTests > 50,
                commercial_features: this.getCommercialTestFeatures()
            };

        } catch (error) {
            throw new Error(`Test execution failed: ${error.message}`);
        }
    }

    /**
     * Run quality-focused tests
     */
    async runQualityTests(taskData) {
        const { code, language = 'javascript' } = taskData;
        const issues = [];

        // Basic quality checks (no intelligence)
        if (language === 'javascript') {
            if (!code.includes('test(') && !code.includes('it(') && !code.includes('describe(')) {
                issues.push({
                    type: 'missing_tests',
                    severity: 'HIGH',
                    message: 'No test functions detected',
                    commercial_solution: 'Professional tier includes AI-powered test generation'
                });
            }

            if (!code.includes('expect') && !code.includes('assert')) {
                issues.push({
                    type: 'missing_assertions',
                    severity: 'MEDIUM',
                    message: 'No assertions detected in test code',
                    commercial_solution: 'Advanced assertion analysis available in commercial tiers'
                });
            }
        }

        return {
            language: language,
            quality_issues: issues,
            test_coverage_estimate: this.estimateBasicCoverage(code),
            upgrade_note: 'Commercial tiers include comprehensive test quality analysis',
            commercial_features: {
                ai_test_generation: 'Professional tier',
                intelligent_coverage_analysis: 'Professional tier',
                predictive_failure_detection: 'Enterprise tier'
            }
        };
    }

    /**
     * Basic coverage analysis
     */
    async analyzeCoverage(taskData) {
        const { projectPath, coverageFile } = taskData;

        try {
            let coverage = { lines: 0, functions: 0, branches: 0, statements: 0 };

            // Try to find coverage files
            const coverageFiles = await this.findCoverageFiles(projectPath);
            
            if (coverageFiles.length > 0) {
                coverage = await this.parseCoverageFile(coverageFiles[0]);
            } else {
                console.log('💡 No coverage files found. Commercial tiers include automated coverage generation.');
            }

            // Suggest upgrade for low coverage
            if (coverage.lines < 80) {
                console.log('\n🚀 Improve test coverage with Professional tier:');
                console.log('   → AI-powered test gap analysis');
                console.log('   → Automatic test case generation for untested paths');
                console.log('   → Intelligent coverage targeting (focus on critical paths)\n');
            }

            return {
                coverage: coverage,
                coverage_files_found: coverageFiles.length,
                recommendations: this.getCoverageRecommendations(coverage),
                upgrade_available: coverage.lines < 80
            };

        } catch (error) {
            return {
                error: error.message,
                coverage: { lines: 0, functions: 0, branches: 0, statements: 0 },
                upgrade_note: 'Commercial tiers include robust coverage analysis with error handling'
            };
        }
    }

    /**
     * Generate basic test report
     */
    async generateTestReport(taskData) {
        const { workflowId, format = 'json' } = taskData;

        // Get test results from workflow coordination
        const testResults = await this.queryAgentResults(workflowId, 'test-orchestration');
        
        const report = {
            workflow_id: workflowId,
            generated_at: new Date().toISOString(),
            summary: this.summarizeTestResults(testResults),
            details: testResults,
            format: format,
            limitations: [
                'Open core provides basic reporting only',
                'Commercial tiers include advanced analytics and trends',
                'Enterprise tier includes compliance-ready audit reports'
            ]
        };

        if (format === 'html') {
            report.html_content = this.generateBasicHTMLReport(report);
        }

        return report;
    }

    /**
     * Detect test framework in project
     */
    async detectTestFramework(projectPath, preferredFramework) {
        if (preferredFramework !== 'auto') {
            return preferredFramework;
        }

        try {
            // Check package.json dependencies
            const packageJsonPath = path.join(projectPath, 'package.json');
            try {
                const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
                const deps = { 
                    ...packageJson.dependencies || {}, 
                    ...packageJson.devDependencies || {} 
                };

                if (deps.jest) return 'jest';
                if (deps.mocha) return 'mocha';
                if (deps['@testing-library/jest-dom']) return 'jest';
            } catch (err) {
                // package.json not found or invalid
            }

            // Check for test files
            const files = await fs.readdir(projectPath);
            if (files.some(f => f.includes('.test.js') || f.includes('.spec.js'))) {
                return 'jest'; // Default assumption
            }

            // Check for Python tests
            if (files.some(f => f.startsWith('test_') && f.endsWith('.py'))) {
                return 'pytest';
            }

            return 'jest'; // Default fallback

        } catch (error) {
            console.warn(`Framework detection failed: ${error.message}`);
            return 'jest';
        }
    }

    /**
     * Build test command based on framework
     */
    buildTestCommand(framework, testPattern) {
        const commands = {
            'jest': testPattern ? `npx jest ${testPattern}` : 'npx jest',
            'mocha': testPattern ? `npx mocha ${testPattern}` : 'npx mocha',
            'pytest': testPattern ? `python -m pytest ${testPattern}` : 'python -m pytest'
        };

        return commands[framework] || commands['jest'];
    }

    /**
     * Execute test command
     */
    async executeTestCommand(command, cwd) {
        return new Promise((resolve, reject) => {
            const [cmd, ...args] = command.split(' ');
            const process = spawn(cmd, args, { cwd, shell: true });
            
            let stdout = '';
            let stderr = '';

            process.stdout.on('data', (data) => {
                stdout += data.toString();
            });

            process.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            process.on('close', (code) => {
                const result = this.parseTestOutput(stdout, stderr, code);
                resolve(result);
            });

            process.on('error', (error) => {
                reject(error);
            });

            // Timeout after 5 minutes
            setTimeout(() => {
                process.kill();
                reject(new Error('Test execution timeout'));
            }, 300000);
        });
    }

    /**
     * Parse test output (basic parsing)
     */
    parseTestOutput(stdout, stderr, exitCode) {
        // Basic parsing - commercial tiers have intelligent parsing
        const output = stdout + stderr;
        
        // Simple pattern matching
        const passedMatch = output.match(/(\d+)\s+passing/i) || output.match(/(\d+)\s+passed/i);
        const failedMatch = output.match(/(\d+)\s+failing/i) || output.match(/(\d+)\s+failed/i);
        
        const passed = passedMatch ? parseInt(passedMatch[1]) : 0;
        const failed = failedMatch ? parseInt(failedMatch[1]) : 0;
        const totalTests = passed + failed;

        return {
            exitCode: exitCode,
            passed: passed,
            failed: failed,
            totalTests: totalTests,
            executionTime: null, // Would need more sophisticated parsing
            output: output,
            success: exitCode === 0 && failed === 0
        };
    }

    /**
     * Helper methods
     */
    estimateBasicCoverage(code) {
        // Very basic coverage estimation
        const lines = code.split('\n').filter(line => line.trim().length > 0);
        const testLines = lines.filter(line => 
            line.includes('test(') || line.includes('it(') || line.includes('expect')
        );
        
        const estimatedCoverage = Math.min(90, (testLines.length / lines.length) * 100);
        return Math.round(estimatedCoverage);
    }

    async findCoverageFiles(projectPath) {
        const coverageFiles = [];
        const possibleFiles = [
            'coverage/lcov.info',
            'coverage/coverage-final.json',
            'coverage.xml',
            'coverage/clover.xml'
        ];

        for (const file of possibleFiles) {
            try {
                const fullPath = path.join(projectPath, file);
                await fs.access(fullPath);
                coverageFiles.push(fullPath);
            } catch (err) {
                // File doesn't exist
            }
        }

        return coverageFiles;
    }

    async parseCoverageFile(filePath) {
        // Basic coverage parsing - commercial tiers have sophisticated parsing
        try {
            const content = await fs.readFile(filePath, 'utf8');
            
            if (filePath.endsWith('.json')) {
                const coverage = JSON.parse(content);
                return this.extractCoverageFromJSON(coverage);
            }
            
            // Basic LCOV parsing
            const lines = content.split('\n');
            let linesCovered = 0, linesTotal = 0;
            
            for (const line of lines) {
                if (line.startsWith('LH:')) linesCovered = parseInt(line.split(':')[1]);
                if (line.startsWith('LF:')) linesTotal = parseInt(line.split(':')[1]);
            }
            
            return {
                lines: linesTotal > 0 ? Math.round((linesCovered / linesTotal) * 100) : 0,
                functions: 0,
                branches: 0,
                statements: 0
            };
            
        } catch (error) {
            console.warn(`Coverage parsing failed: ${error.message}`);
            return { lines: 0, functions: 0, branches: 0, statements: 0 };
        }
    }

    extractCoverageFromJSON(coverage) {
        // Basic JSON coverage extraction
        let totalLines = 0, coveredLines = 0;
        
        for (const file in coverage) {
            if (coverage[file].s) {
                const statements = coverage[file].s;
                totalLines += Object.keys(statements).length;
                coveredLines += Object.values(statements).filter(v => v > 0).length;
            }
        }
        
        return {
            lines: totalLines > 0 ? Math.round((coveredLines / totalLines) * 100) : 0,
            functions: 0,
            branches: 0,
            statements: 0
        };
    }

    getCoverageRecommendations(coverage) {
        const recommendations = [];
        
        if (coverage.lines < 80) {
            recommendations.push('Increase line coverage to at least 80%');
            recommendations.push('Focus on testing critical business logic');
        }
        
        recommendations.push('Commercial tiers provide intelligent coverage targeting');
        return recommendations;
    }

    summarizeTestResults(testResults) {
        if (!testResults || testResults.length === 0) {
            return { total_tests: 0, passed: 0, failed: 0, success_rate: 0 };
        }
        
        // Basic summarization
        const latest = testResults[testResults.length - 1];
        return {
            total_tests: latest.result_data?.totalTests || 0,
            passed: latest.result_data?.passed || 0,
            failed: latest.result_data?.failed || 0,
            success_rate: latest.result_data ? 
                Math.round((latest.result_data.passed / latest.result_data.totalTests) * 100) : 0
        };
    }

    generateBasicHTMLReport(report) {
        return `
<!DOCTYPE html>
<html>
<head>
    <title>Test Report - ${report.workflow_id}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .summary { background: #f5f5f5; padding: 15px; border-radius: 5px; }
        .upgrade { background: #e3f2fd; padding: 10px; border-left: 4px solid #2196f3; margin: 10px 0; }
    </style>
</head>
<body>
    <h1>Test Execution Report</h1>
    <div class="summary">
        <h2>Summary</h2>
        <p>Total Tests: ${report.summary.total_tests}</p>
        <p>Passed: ${report.summary.passed}</p>
        <p>Failed: ${report.summary.failed}</p>
        <p>Success Rate: ${report.summary.success_rate}%</p>
    </div>
    
    <div class="upgrade">
        <h3>🚀 Upgrade to Professional</h3>
        <p>Get advanced test analytics, trends, and AI-powered optimization!</p>
    </div>
</body>
</html>`;
    }

    getCommercialTestFeatures() {
        return {
            professional: [
                'AI-powered test generation',
                'Intelligent test optimization', 
                'Predictive failure analysis',
                'Advanced coverage analytics'
            ],
            enterprise: [
                'ML-based test optimization',
                'Compliance-ready test reports',
                'Cross-team test coordination',
                'Custom test framework integration'
            ]
        };
    }
}

module.exports = TestOrchestrationAgent;