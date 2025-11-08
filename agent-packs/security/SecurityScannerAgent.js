/**
 * Security Scanner Agent - Open Core Edition
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
 * Basic security scanning using open-source tools and simple pattern matching.
 * Commercial tiers include advanced threat intelligence and ML-based analysis.
 * BYOL Model: User provides security API keys, or uses basic free scanning
 */

const BaseAgent = require('../../equilateral-core/BaseAgent');
const PathScanningHelper = require('../../equilateral-core/PathScanningHelper');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class SecurityScannerAgent extends BaseAgent {
    constructor(config = {}) {
        super({
            agentId: 'security-scanner',
            agentType: 'security',
            capabilities: ['vulnerability_scan', 'dependency_check', 'basic_code_analysis', 'secrets_detection'],
            ...config
        });

        // BYOL Configuration for security APIs
        this.securityConfig = {
            nvdApiKey: config.nvdApiKey || process.env.NVD_API_KEY,
            snykToken: config.snykToken || process.env.SNYK_TOKEN,
            useFreeScanning: !config.nvdApiKey && !process.env.NVD_API_KEY
        };

        // Initialize path scanner for security scanning
        this.pathScanner = new PathScanningHelper({
            verbose: config.verbose !== false,
            extensions: {
                all: ['.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.go', '.rs', '.c', '.cpp', '.h', '.hpp']
            },
            maxDepth: config.maxDepth || 10
        });

        this.vulnerabilityPatterns = new Map();
        this.secretsPatterns = new Map();
        this.loadSecurityPatterns();
    }

    /**
     * Load basic security patterns (open source, no intelligence)
     */
    loadSecurityPatterns() {
        // Common vulnerability patterns
        this.vulnerabilityPatterns.set('sql_injection', {
            patterns: [
                /query\s*\(\s*['"`][^'"`]*\$\{[^}]+\}/gi,
                /execute\s*\(\s*['"`][^'"`]*\+/gi,
                /WHERE\s+[^=]*=\s*['"`]\s*\+/gi
            ],
            severity: 'HIGH',
            description: 'Potential SQL injection vulnerability'
        });

        this.vulnerabilityPatterns.set('xss', {
            patterns: [
                /innerHTML\s*=\s*[^;]+\+/gi,
                /document\.write\s*\([^)]*\+/gi,
                /\.html\s*\([^)]*\+/gi
            ],
            severity: 'MEDIUM',
            description: 'Potential XSS vulnerability'
        });

        this.vulnerabilityPatterns.set('hardcoded_secrets', {
            patterns: [
                /password\s*[=:]\s*['"][^'"]{3,}/gi,
                /api_key\s*[=:]\s*['"][^'"]{10,}/gi,
                /secret\s*[=:]\s*['"][^'"]{8,}/gi
            ],
            severity: 'HIGH',
            description: 'Hardcoded secrets detected'
        });

        // Common secret patterns
        this.secretsPatterns.set('aws_access_key', /AKIA[0-9A-Z]{16}/g);
        this.secretsPatterns.set('aws_secret_key', /[A-Za-z0-9/+=]{40}/g);
        this.secretsPatterns.set('github_token', /gh[ps]_[A-Za-z0-9]{36}/g);
        this.secretsPatterns.set('slack_token', /xox[baprs]-[A-Za-z0-9-]+/g);
        this.secretsPatterns.set('generic_api_key', /[Aa][Pp][Ii][Kk][Ee][Yy].*['\"][A-Za-z0-9]{16,}['\"]]/g);
    }

    /**
     * Perform security scanning task
     */
    async performTask(taskType, taskData, taskContext) {
        switch (taskType) {
            case 'security_scan':
                return await this.performSecurityScan(taskData);
            case 'dependency_check':
                return await this.checkDependencies(taskData);
            case 'secrets_scan':
                return await this.scanForSecrets(taskData);
            case 'code_analysis':
                return await this.analyzeCode(taskData);
            case 'quality_security_scan':
                return await this.qualitySecurityScan(taskData);
            default:
                throw new Error(`Unknown security task: ${taskType}`);
        }
    }

    /**
     * Perform comprehensive security scan
     */
    async performSecurityScan(taskData) {
        const { projectPath, scanTypes = ['vulnerabilities', 'secrets', 'dependencies'] } = taskData;
        const results = {
            scan_id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            project_path: projectPath,
            scan_types: scanTypes,
            findings: [],
            summary: {
                total_issues: 0,
                high_severity: 0,
                medium_severity: 0,
                low_severity: 0
            }
        };

        try {
            // Scan for code vulnerabilities
            if (scanTypes.includes('vulnerabilities')) {
                const vulnFindings = await this.scanVulnerabilities(projectPath);
                results.findings.push(...vulnFindings);
            }

            // Scan for secrets
            if (scanTypes.includes('secrets')) {
                const secretFindings = await this.scanForSecretsInPath(projectPath);
                results.findings.push(...secretFindings);
            }

            // Check dependencies (basic)
            if (scanTypes.includes('dependencies')) {
                const depFindings = await this.scanDependencies(projectPath);
                results.findings.push(...depFindings);
            }

            // Calculate summary
            results.summary = this.calculateScanSummary(results.findings);

            await this.logActivity('security_scan_completed', {
                scan_id: results.scan_id,
                findings_count: results.findings.length,
                summary: results.summary,
                scan_types: scanTypes
            });

            return results;

        } catch (error) {
            throw new Error(`Security scan failed: ${error.message}`);
        }
    }

    /**
     * Scan for code vulnerabilities using pattern matching
     */
    async scanVulnerabilities(projectPath) {
        const findings = [];

        try {
            this.logActivity('scanning_vulnerabilities', { projectPath });
            const files = await this.pathScanner.scanProject(projectPath, { language: 'all' });

            const scanStats = this.pathScanner.getStats(files, projectPath);
            if (!scanStats.hasSrcDirectory) {
                this.logActivity('warning_no_src_directory', {
                    message: 'No src/ directory found - vulnerability scan may not cover user code',
                    directoriesScanned: Array.from(scanStats.directories)
                });
            }

            for (const filePath of files) {
                const content = await fs.readFile(filePath, 'utf8');
                const relativeFile = path.relative(projectPath, filePath);

                // Scan with each vulnerability pattern
                for (const [vulnType, config] of this.vulnerabilityPatterns) {
                    for (const pattern of config.patterns) {
                        let match;
                        while ((match = pattern.exec(content)) !== null) {
                            const lineNumber = content.substring(0, match.index).split('\n').length;
                            
                            findings.push({
                                type: 'vulnerability',
                                vulnerability_type: vulnType,
                                severity: config.severity,
                                description: config.description,
                                file: relativeFile,
                                line: lineNumber,
                                code_snippet: this.extractCodeSnippet(content, match.index),
                                pattern_matched: match[0],
                                remediation: this.getBasicRemediation(vulnType)
                            });
                        }
                    }
                }
            }
        } catch (error) {
            console.warn(`Vulnerability scan warning: ${error.message}`);
        }

        return findings;
    }

    /**
     * Scan for secrets in project files
     */
    async scanForSecretsInPath(projectPath) {
        const findings = [];

        try {
            this.logActivity('scanning_secrets', { projectPath });
            const files = await this.pathScanner.scanProject(projectPath, { language: 'all' });

            const scanStats = this.pathScanner.getStats(files, projectPath);
            if (!scanStats.hasSrcDirectory) {
                this.logActivity('warning_no_src_directory', {
                    message: 'No src/ directory found - secrets scan may not cover user code',
                    directoriesScanned: Array.from(scanStats.directories)
                });
            }

            for (const filePath of files) {
                // Skip binary files and common ignore patterns
                if (this.shouldSkipFile(filePath)) continue;
                
                const content = await fs.readFile(filePath, 'utf8');
                const relativeFile = path.relative(projectPath, filePath);

                // Scan for each secret pattern
                for (const [secretType, pattern] of this.secretsPatterns) {
                    let match;
                    while ((match = pattern.exec(content)) !== null) {
                        const lineNumber = content.substring(0, match.index).split('\n').length;
                        
                        findings.push({
                            type: 'secret',
                            secret_type: secretType,
                            severity: 'HIGH',
                            description: `Potential ${secretType.replace('_', ' ')} detected`,
                            file: relativeFile,
                            line: lineNumber,
                            masked_value: this.maskSecret(match[0]),
                            remediation: 'Remove hardcoded secrets and use environment variables'
                        });
                    }
                }
            }
        } catch (error) {
            console.warn(`Secrets scan warning: ${error.message}`);
        }

        return findings;
    }

    /**
     * Basic dependency security check
     */
    async scanDependencies(projectPath) {
        const findings = [];
        
        try {
            // Check package.json if exists
            const packageJsonPath = path.join(projectPath, 'package.json');
            try {
                const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
                const dependencies = {
                    ...packageJson.dependencies || {},
                    ...packageJson.devDependencies || {}
                };

                // Basic vulnerability checks (limited in open core)
                const knownVulnPackages = {
                    'lodash': { versions: ['<4.17.21'], severity: 'HIGH', cve: 'CVE-2021-23337' },
                    'axios': { versions: ['<0.21.1'], severity: 'MEDIUM', cve: 'CVE-2020-28168' },
                    'node-fetch': { versions: ['<2.6.7'], severity: 'HIGH', cve: 'CVE-2022-0235' }
                };

                for (const [pkg, version] of Object.entries(dependencies)) {
                    if (knownVulnPackages[pkg]) {
                        findings.push({
                            type: 'dependency_vulnerability',
                            package: pkg,
                            version: version,
                            severity: knownVulnPackages[pkg].severity,
                            description: `Known vulnerability in ${pkg}`,
                            cve: knownVulnPackages[pkg].cve,
                            file: 'package.json',
                            remediation: `Update ${pkg} to latest version`,
                            upgrade_note: 'Commercial tiers include comprehensive vulnerability scanning'
                        });
                    }
                }
            } catch (err) {
                // package.json not found or invalid
            }

            // Check requirements.txt (Python)
            const requirementsPath = path.join(projectPath, 'requirements.txt');
            try {
                await fs.access(requirementsPath);
                findings.push({
                    type: 'info',
                    severity: 'INFO',
                    description: 'Python dependencies detected - upgrade to commercial tier for comprehensive Python vulnerability scanning',
                    file: 'requirements.txt',
                    upgrade_available: true
                });
            } catch (err) {
                // requirements.txt not found
            }

        } catch (error) {
            console.warn(`Dependency scan warning: ${error.message}`);
        }

        return findings;
    }

    /**
     * Quality-focused security scan
     */
    async qualitySecurityScan(taskData) {
        const { code, language = 'javascript' } = taskData;
        const issues = [];

        // Basic security quality checks
        if (language === 'javascript') {
            if (code.includes('eval(')) {
                issues.push({
                    type: 'security_quality',
                    severity: 'HIGH',
                    issue: 'eval_usage',
                    message: 'eval() usage detected - potential code injection risk',
                    remediation: 'Avoid eval() - use safe alternatives'
                });
            }

            if (code.includes('innerHTML') && !code.includes('DOMPurify')) {
                issues.push({
                    type: 'security_quality', 
                    severity: 'MEDIUM',
                    issue: 'unsafe_innerhtml',
                    message: 'innerHTML usage without sanitization',
                    remediation: 'Use textContent or sanitize with DOMPurify'
                });
            }

            if (!code.includes('https://') && code.includes('http://')) {
                issues.push({
                    type: 'security_quality',
                    severity: 'LOW',
                    issue: 'insecure_protocol',
                    message: 'HTTP URLs detected - should use HTTPS',
                    remediation: 'Replace HTTP URLs with HTTPS'
                });
            }
        }

        await this.logActivity('quality_security_scan', {
            language: language,
            code_length: code.length,
            issues_found: issues.length
        });

        return {
            language: language,
            security_issues: issues,
            passed: issues.filter(i => i.severity === 'HIGH').length === 0,
            recommendations: this.getSecurityRecommendations(language)
        };
    }

    /**
     * Helper methods (DEPRECATED - use pathScanner instead)
     * Kept for backward compatibility
     */
    async getCodeFiles(projectPath, extensions = ['.js', '.ts', '.jsx', '.tsx', '.py', '.java']) {
        console.warn('getCodeFiles is deprecated - using PathScanningHelper instead');
        return await this.pathScanner.scanProject(projectPath, { language: 'all' });
    }

    async getAllFiles(projectPath) {
        console.warn('getAllFiles is deprecated - using PathScanningHelper instead');
        return await this.pathScanner.scanProject(projectPath, { language: 'all' });
    }

    shouldSkipDirectory(dirName) {
        return this.pathScanner.shouldSkipDirectory(dirName);
    }

    shouldSkipFile(filePath) {
        const skipExtensions = ['.jpg', '.png', '.gif', '.pdf', '.zip', '.tar', '.gz'];
        const skipFiles = ['.env', '.env.local', '.env.production'];
        
        return skipExtensions.some(ext => filePath.endsWith(ext)) ||
               skipFiles.some(file => filePath.endsWith(file));
    }

    extractCodeSnippet(content, index, contextLength = 50) {
        const start = Math.max(0, index - contextLength);
        const end = Math.min(content.length, index + contextLength);
        return content.substring(start, end);
    }

    maskSecret(secret) {
        if (secret.length <= 8) return '*'.repeat(secret.length);
        return secret.substring(0, 4) + '*'.repeat(secret.length - 8) + secret.substring(secret.length - 4);
    }

    getBasicRemediation(vulnType) {
        const remediations = {
            'sql_injection': 'Use parameterized queries or prepared statements',
            'xss': 'Sanitize user input and use safe DOM manipulation methods',
            'hardcoded_secrets': 'Use environment variables or secure secret management'
        };
        return remediations[vulnType] || 'Review code for security best practices';
    }

    calculateScanSummary(findings) {
        const summary = {
            total_issues: findings.length,
            high_severity: 0,
            medium_severity: 0,
            low_severity: 0,
            info_severity: 0
        };

        for (const finding of findings) {
            switch (finding.severity) {
                case 'HIGH': summary.high_severity++; break;
                case 'MEDIUM': summary.medium_severity++; break;
                case 'LOW': summary.low_severity++; break;
                default: summary.info_severity++; break;
            }
        }

        return summary;
    }

    getSecurityRecommendations(language) {
        const recommendations = {
            'javascript': [
                'Use strict mode ("use strict")',
                'Validate and sanitize all user inputs', 
                'Use HTTPS for all communications',
                'Implement proper error handling',
                'Keep dependencies updated'
            ],
            'python': [
                'Use virtual environments',
                'Validate inputs with proper schemas',
                'Use secrets management for sensitive data',
                'Keep Python and packages updated'
            ]
        };

        return recommendations[language] || recommendations['javascript'];
    }

    /**
     * Generate security report
     */
    async generateSecurityReport(scanResults) {
        const report = {
            scan_summary: scanResults.summary,
            critical_findings: scanResults.findings.filter(f => f.severity === 'HIGH'),
            recommendations: [],
            upgrade_notes: []
        };

        // Add upgrade suggestions for commercial features
        if (this.securityConfig.useFreeScanning) {
            report.upgrade_notes.push(
                'Upgrade to Professional tier for comprehensive vulnerability scanning',
                'Commercial tiers include advanced threat intelligence',
                'Enterprise tier includes automated remediation suggestions'
            );
        }

        return report;
    }
}

module.exports = SecurityScannerAgent;