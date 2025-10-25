/**
 * Code Analyzer Agent - Open Core Edition
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
 * Simple code analysis agent for basic quality checks.
 * Demonstrates the agent pattern for code analysis.
 */

const BaseAgent = require('../../equilateral-core/BaseAgent');
const PathScanningHelper = require('../../equilateral-core/PathScanningHelper');
const fs = require('fs').promises;
const path = require('path');

class CodeAnalyzerAgent extends BaseAgent {
    constructor(config = {}) {
        super({
            agentId: 'code-analyzer',
            agentType: 'development',
            capabilities: ['analyze', 'lint', 'complexity'],
            ...config
        });

        // Initialize path scanner with JavaScript-specific configuration
        this.pathScanner = new PathScanningHelper({
            verbose: config.verbose !== false,
            extensions: {
                javascript: ['.js', '.jsx', '.mjs', '.cjs']
            },
            maxDepth: config.maxDepth || 10
        });
    }

    /**
     * Execute analysis task
     */
    async executeTask(task) {
        this.validateTask(task);
        task.startTime = Date.now();

        try {
            let result;
            
            switch (task.taskType) {
                case 'analyze':
                    result = await this.analyzeCode(task.taskData);
                    break;
                case 'lint':
                    result = await this.lintCode(task.taskData);
                    break;
                case 'complexity':
                    result = await this.checkComplexity(task.taskData);
                    break;
                default:
                    throw new Error(`Unknown task type: ${task.taskType}`);
            }

            this.reportTaskComplete(task, result);
            return result;

        } catch (error) {
            this.reportTaskError(task, error);
            throw error;
        }
    }

    /**
     * Analyze code for basic quality metrics
     */
    async analyzeCode(taskData) {
        const { filePath, projectPath } = taskData;
        const targetPath = filePath || projectPath || process.cwd();

        this.log('info', `Analyzing code at: ${targetPath}`);

        const analysis = {
            path: targetPath,
            timestamp: new Date(),
            metrics: {},
            issues: []
        };

        try {
            const stats = await fs.stat(targetPath);

            if (stats.isDirectory()) {
                // Analyze directory using PathScanningHelper
                this.log('info', '🔍 Scanning project for JavaScript files...');
                const files = await this.pathScanner.scanProject(targetPath, {
                    language: 'javascript'
                });

                const scanStats = this.pathScanner.getStats(files, targetPath);
                analysis.fileCount = files.length;
                analysis.scanStats = {
                    hasSrcDirectory: scanStats.hasSrcDirectory,
                    directoriesScanned: Array.from(scanStats.directories),
                    filesByDirectory: Object.fromEntries(scanStats.byDirectory)
                };

                if (!scanStats.hasSrcDirectory) {
                    this.log('warn', '⚠️  No src/ directory found - may not have scanned user code');
                }
                
                for (const file of files.slice(0, 10)) { // Limit to 10 files for demo
                    const fileAnalysis = await this.analyzeFile(file);
                    analysis.metrics[file] = fileAnalysis.metrics;
                    analysis.issues.push(...fileAnalysis.issues);
                }
            } else {
                // Analyze single file
                const fileAnalysis = await this.analyzeFile(targetPath);
                analysis.metrics = fileAnalysis.metrics;
                analysis.issues = fileAnalysis.issues;
            }

            analysis.summary = {
                totalIssues: analysis.issues.length,
                criticalIssues: analysis.issues.filter(i => i.severity === 'critical').length,
                warnings: analysis.issues.filter(i => i.severity === 'warning').length
            };

            return analysis;

        } catch (error) {
            this.log('error', `Analysis failed: ${error.message}`);
            throw error;
        }
    }

    /**
     * Lint code for style issues
     */
    async lintCode(taskData) {
        const { filePath } = taskData;
        
        this.log('info', `Linting code: ${filePath}`);

        // Simplified linting - in production would use ESLint
        const lintResults = {
            filePath,
            errors: [],
            warnings: [],
            info: []
        };

        try {
            const content = await fs.readFile(filePath, 'utf8');
            const lines = content.split('\n');

            // Basic checks
            lines.forEach((line, index) => {
                // Check line length
                if (line.length > 120) {
                    lintResults.warnings.push({
                        line: index + 1,
                        message: 'Line exceeds 120 characters',
                        rule: 'max-line-length'
                    });
                }

                // Check for console.log (except in this file!)
                if (line.includes('console.log') && !filePath.includes('Agent')) {
                    lintResults.warnings.push({
                        line: index + 1,
                        message: 'Avoid console.log in production code',
                        rule: 'no-console'
                    });
                }

                // Check for TODO comments
                if (line.includes('TODO') || line.includes('FIXME')) {
                    lintResults.info.push({
                        line: index + 1,
                        message: 'TODO/FIXME comment found',
                        rule: 'no-todo'
                    });
                }
            });

            lintResults.summary = {
                errors: lintResults.errors.length,
                warnings: lintResults.warnings.length,
                info: lintResults.info.length
            };

            return lintResults;

        } catch (error) {
            this.log('error', `Linting failed: ${error.message}`);
            throw error;
        }
    }

    /**
     * Check code complexity
     */
    async checkComplexity(taskData) {
        const { filePath } = taskData;
        
        this.log('info', `Checking complexity: ${filePath}`);

        try {
            const content = await fs.readFile(filePath, 'utf8');
            
            // Very basic complexity metrics
            const metrics = {
                filePath,
                lines: content.split('\n').length,
                functions: (content.match(/function\s+\w+/g) || []).length,
                classes: (content.match(/class\s+\w+/g) || []).length,
                imports: (content.match(/require\(|import\s+/g) || []).length,
                conditions: (content.match(/if\s*\(|switch\s*\(/g) || []).length,
                loops: (content.match(/for\s*\(|while\s*\(|do\s*\{/g) || []).length
            };

            // Calculate cyclomatic complexity (simplified)
            metrics.complexity = 1 + metrics.conditions + metrics.loops;
            
            metrics.assessment = {
                complexity: metrics.complexity < 10 ? 'low' : metrics.complexity < 20 ? 'medium' : 'high',
                maintainability: metrics.lines < 200 ? 'good' : metrics.lines < 500 ? 'fair' : 'poor'
            };

            return metrics;

        } catch (error) {
            this.log('error', `Complexity check failed: ${error.message}`);
            throw error;
        }
    }

    /**
     * Analyze a single file
     */
    async analyzeFile(filePath) {
        const content = await fs.readFile(filePath, 'utf8');
        const lines = content.split('\n');
        
        const metrics = {
            lines: lines.length,
            blankLines: lines.filter(l => l.trim() === '').length,
            commentLines: lines.filter(l => l.trim().startsWith('//')).length
        };

        const issues = [];

        // Check for potential issues
        if (metrics.lines > 500) {
            issues.push({
                file: filePath,
                severity: 'warning',
                message: 'File exceeds 500 lines'
            });
        }

        if (content.includes('eval(')) {
            issues.push({
                file: filePath,
                severity: 'critical',
                message: 'Use of eval() detected'
            });
        }

        return { metrics, issues };
    }

    /**
     * Get JavaScript files in directory (DEPRECATED - use pathScanner instead)
     * Kept for backward compatibility
     */
    async getJavaScriptFiles(dir) {
        this.log('warn', 'getJavaScriptFiles is deprecated - using PathScanningHelper instead');
        return await this.pathScanner.scanProject(dir, { language: 'javascript' });
    }
}

module.exports = CodeAnalyzerAgent;