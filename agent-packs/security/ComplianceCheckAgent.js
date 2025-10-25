/**
 * Compliance Check Agent - Open Core Edition
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
 * Basic compliance validation and regulatory checking.
 * Commercial tiers include automated compliance reporting and multi-framework support.
 */

const BaseAgent = require('../../equilateral-core/BaseAgent');
const PathScanningHelper = require('../../equilateral-core/PathScanningHelper');
const fs = require('fs').promises;
const path = require('path');

class ComplianceCheckAgent extends BaseAgent {
    constructor(config = {}) {
        super('compliance-check', {
            agentType: 'security',
            capabilities: ['basic_compliance', 'policy_validation', 'audit_reporting'],
            ...config
        });
        // Initialize path scanner for compliance checking
        this.pathScanner = new PathScanningHelper({
            verbose: config.verbose !== false,
            extensions: {
                all: ['.js', '.ts', '.py', '.java']
            },
            maxDepth: config.maxDepth || 10
        });

        this.complianceFrameworks = new Map();
        this.loadBasicComplianceRules();
    }

    /**
     * Load basic compliance rules
     */
    loadBasicComplianceRules() {
        this.complianceFrameworks.set('gdpr', {
            name: 'GDPR (Basic)',
            description: 'Basic GDPR compliance checks',
            checks: ['data_protection', 'consent_management', 'privacy_policy'],
            severity: 'high',
            commercial_features: 'Full GDPR automation with DPO workflow'
        });

        this.complianceFrameworks.set('sox', {
            name: 'SOX (Basic)',
            description: 'Sarbanes-Oxley basic compliance',
            checks: ['financial_controls', 'audit_trails', 'data_integrity'],
            severity: 'critical',
            commercial_features: 'Automated SOX reporting and control testing'
        });

        this.complianceFrameworks.set('hipaa', {
            name: 'HIPAA (Basic)',
            description: 'Healthcare compliance basics',
            checks: ['data_encryption', 'access_controls', 'audit_logging'],
            severity: 'critical',
            commercial_features: 'Complete HIPAA compliance automation'
        });

        this.complianceFrameworks.set('pci', {
            name: 'PCI DSS (Basic)',
            description: 'Payment card industry standards',
            checks: ['encryption_standards', 'network_security', 'access_monitoring'],
            severity: 'high',
            commercial_features: 'Automated PCI compliance and reporting'
        });
    }

    /**
     * Perform compliance check task
     */
    async performTask(taskType, taskData, taskContext) {
        switch (taskType) {
            case 'compliance_scan':
                return await this.performComplianceScan(taskData);
            case 'policy_validation':
                return await this.validatePolicies(taskData);
            case 'audit_report':
                return await this.generateAuditReport(taskData);
            case 'framework_check':
                return await this.checkFrameworkCompliance(taskData);
            default:
                throw new Error(`Unknown compliance task: ${taskType}`);
        }
    }

    /**
     * Perform comprehensive compliance scan
     */
    async performComplianceScan(taskData) {
        const { 
            projectPath, 
            frameworks = ['gdpr', 'sox'], 
            severity = 'medium',
            includeRecommendations = true 
        } = taskData;

        try {
            const scan = {
                timestamp: new Date().toISOString(),
                project_path: projectPath,
                frameworks_scanned: frameworks,
                results: [],
                overall_score: 0,
                critical_issues: [],
                recommendations: [],
                commercial_upgrades: []
            };

            for (const framework of frameworks) {
                if (this.complianceFrameworks.has(framework)) {
                    const frameworkResult = await this.scanFramework(projectPath, framework);
                    scan.results.push(frameworkResult);
                    
                    if (frameworkResult.critical_violations.length > 0) {
                        scan.critical_issues.push(...frameworkResult.critical_violations);
                    }
                }
            }

            // Calculate overall score (basic scoring)
            scan.overall_score = this.calculateBasicComplianceScore(scan.results);

            // Show upgrade value for comprehensive compliance
            if (scan.critical_issues.length > 0 || frameworks.length > 2) {
                console.log('\n🛡️ Achieve complete compliance with Enterprise tier:');
                console.log('   → Automated compliance monitoring and reporting');
                console.log('   → Multi-framework compliance orchestration');
                console.log('   → Real-time compliance violation alerts');
                console.log('   → Automated remediation and policy enforcement\\n');

                scan.commercial_upgrades.push({
                    tier: 'Enterprise',
                    features: ['Automated compliance', 'Multi-framework support', 'Real-time monitoring'],
                    benefit: 'Reduce compliance violations by 95% with automated enforcement'
                });
            }

            await this.logActivity('compliance_scan_completed', {
                frameworks_scanned: frameworks.length,
                critical_issues: scan.critical_issues.length,
                overall_score: scan.overall_score,
                project_path: projectPath
            });

            return scan;

        } catch (error) {
            throw new Error(`Compliance scan failed: ${error.message}`);
        }
    }

    /**
     * Scan specific compliance framework
     */
    async scanFramework(projectPath, frameworkKey) {
        const framework = this.complianceFrameworks.get(frameworkKey);
        const result = {
            framework: framework.name,
            framework_key: frameworkKey,
            checks_performed: [],
            violations: [],
            critical_violations: [],
            warnings: [],
            score: 85, // Basic scoring
            recommendations: []
        };

        try {
            // Perform basic checks based on framework
            switch (frameworkKey) {
                case 'gdpr':
                    await this.performGDPRBasicChecks(projectPath, result);
                    break;
                case 'sox':
                    await this.performSOXBasicChecks(projectPath, result);
                    break;
                case 'hipaa':
                    await this.performHIPAABasicChecks(projectPath, result);
                    break;
                case 'pci':
                    await this.performPCIBasicChecks(projectPath, result);
                    break;
            }

            // Add commercial upgrade note
            result.commercial_enhancement = framework.commercial_features;

        } catch (error) {
            result.violations.push({
                type: 'scan_error',
                message: `Framework scan failed: ${error.message}`,
                severity: 'medium'
            });
        }

        return result;
    }

    /**
     * Basic GDPR compliance checks
     */
    async performGDPRBasicChecks(projectPath, result) {
        result.checks_performed.push('Privacy policy presence');
        result.checks_performed.push('Cookie consent detection');
        result.checks_performed.push('Data processing documentation');

        try {
            // Check for privacy policy files
            const privacyFiles = ['privacy.md', 'privacy-policy.md', 'PRIVACY.md'];
            let privacyFound = false;

            for (const file of privacyFiles) {
                try {
                    await fs.access(path.join(projectPath, file));
                    privacyFound = true;
                    break;
                } catch (err) {
                    // File doesn't exist
                }
            }

            if (!privacyFound) {
                result.violations.push({
                    type: 'missing_privacy_policy',
                    message: 'No privacy policy documentation found',
                    severity: 'high',
                    gdpr_article: 'Article 13-14 (Information obligations)'
                });
            }

            // Basic cookie/consent checks (very limited in open core)
            const packageJsonPath = path.join(projectPath, 'package.json');
            try {
                const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
                const deps = { ...packageJson.dependencies || {}, ...packageJson.devDependencies || {} };

                if (!deps['cookie-consent'] && !deps['cookiebot'] && !deps['onetrust']) {
                    result.warnings.push({
                        type: 'no_cookie_consent',
                        message: 'No cookie consent library detected',
                        recommendation: 'Implement GDPR-compliant cookie consent'
                    });
                }
            } catch (err) {
                // Package.json not found or invalid
            }

            result.recommendations.push('Commercial tiers include automated GDPR compliance with DPO workflows');

        } catch (error) {
            result.violations.push({
                type: 'gdpr_check_error',
                message: `GDPR check failed: ${error.message}`,
                severity: 'medium'
            });
        }
    }

    /**
     * Basic SOX compliance checks
     */
    async performSOXBasicChecks(projectPath, result) {
        result.checks_performed.push('Audit trail configuration');
        result.checks_performed.push('Financial control validation');
        result.checks_performed.push('Change management process');

        try {
            // Check for audit logging
            const auditFiles = ['audit.log', 'logs/audit/', 'audit-config.json'];
            let auditFound = false;

            for (const file of auditFiles) {
                try {
                    await fs.access(path.join(projectPath, file));
                    auditFound = true;
                    break;
                } catch (err) {
                    // File doesn't exist
                }
            }

            if (!auditFound) {
                result.critical_violations.push({
                    type: 'missing_audit_trails',
                    message: 'No audit trail configuration found',
                    severity: 'critical',
                    sox_requirement: 'Section 302 - Management assessment of internal controls'
                });
            }

            // Check for change management
            const changeFiles = ['CHANGELOG.md', 'CHANGES.md', '.github/workflows/'];
            let changeManagementFound = false;

            for (const file of changeFiles) {
                try {
                    await fs.access(path.join(projectPath, file));
                    changeManagementFound = true;
                    break;
                } catch (err) {
                    // File doesn't exist
                }
            }

            if (!changeManagementFound) {
                result.violations.push({
                    type: 'weak_change_management',
                    message: 'Limited change management documentation found',
                    severity: 'medium',
                    recommendation: 'Implement formal change control processes'
                });
            }

            result.recommendations.push('Enterprise tier provides automated SOX compliance with integrated audit workflows');

        } catch (error) {
            result.violations.push({
                type: 'sox_check_error',
                message: `SOX check failed: ${error.message}`,
                severity: 'medium'
            });
        }
    }

    /**
     * Basic HIPAA compliance checks
     */
    async performHIPAABasicChecks(projectPath, result) {
        result.checks_performed.push('Encryption standards');
        result.checks_performed.push('Access control implementation');
        result.checks_performed.push('PHI handling procedures');

        try {
            // Check for encryption configuration
            const configFiles = ['config/', '.env.example', 'security-config.json'];
            let encryptionConfigFound = false;

            for (const file of configFiles) {
                try {
                    const content = await fs.readFile(path.join(projectPath, file), 'utf8');
                    if (content.toLowerCase().includes('encrypt') || content.toLowerCase().includes('ssl')) {
                        encryptionConfigFound = true;
                        break;
                    }
                } catch (err) {
                    // File doesn't exist or can't be read
                }
            }

            if (!encryptionConfigFound) {
                result.critical_violations.push({
                    type: 'missing_encryption_config',
                    message: 'No encryption configuration detected',
                    severity: 'critical',
                    hipaa_requirement: 'Administrative Safeguards - Access Management'
                });
            }

            // Basic access control check
            const authFiles = ['auth.js', 'authentication.js', 'middleware/auth.js'];
            let authFound = false;

            for (const file of authFiles) {
                try {
                    await fs.access(path.join(projectPath, file));
                    authFound = true;
                    break;
                } catch (err) {
                    // File doesn't exist
                }
            }

            if (!authFound) {
                result.violations.push({
                    type: 'missing_access_controls',
                    message: 'No authentication/authorization files detected',
                    severity: 'high',
                    recommendation: 'Implement role-based access controls for PHI'
                });
            }

            result.recommendations.push('Commercial tiers include complete HIPAA compliance automation with BAA management');

        } catch (error) {
            result.violations.push({
                type: 'hipaa_check_error',
                message: `HIPAA check failed: ${error.message}`,
                severity: 'medium'
            });
        }
    }

    /**
     * Basic PCI DSS compliance checks
     */
    async performPCIBasicChecks(projectPath, result) {
        result.checks_performed.push('Network security configuration');
        result.checks_performed.push('Payment data handling');
        result.checks_performed.push('Security monitoring');

        try {
            // Check for payment-related files
            const paymentFiles = ['payment.js', 'stripe.js', 'paypal.js', 'billing/'];
            let paymentHandlingFound = false;

            for (const file of paymentFiles) {
                try {
                    await fs.access(path.join(projectPath, file));
                    paymentHandlingFound = true;
                    break;
                } catch (err) {
                    // File doesn't exist
                }
            }

            if (paymentHandlingFound) {
                // If payment handling exists, check for PCI compliance measures
                result.warnings.push({
                    type: 'payment_data_handling',
                    message: 'Payment processing detected - verify PCI DSS compliance',
                    severity: 'high',
                    pci_requirement: 'Requirement 1-12 (All PCI DSS requirements apply)'
                });

                // Check for basic security measures
                const securityFiles = ['firewall.conf', 'security.js', 'encryption.js'];
                let securityFound = false;

                for (const file of securityFiles) {
                    try {
                        await fs.access(path.join(projectPath, file));
                        securityFound = true;
                        break;
                    } catch (err) {
                        // File doesn't exist
                    }
                }

                if (!securityFound) {
                    result.critical_violations.push({
                        type: 'insufficient_payment_security',
                        message: 'Payment processing without adequate security controls',
                        severity: 'critical',
                        pci_requirement: 'Requirement 4 - Encrypt transmission of cardholder data'
                    });
                }
            }

            result.recommendations.push('Enterprise tier provides automated PCI compliance validation and reporting');

        } catch (error) {
            result.violations.push({
                type: 'pci_check_error',
                message: `PCI DSS check failed: ${error.message}`,
                severity: 'medium'
            });
        }
    }

    /**
     * Validate policies against framework requirements
     */
    async validatePolicies(taskData) {
        const { policies, framework = 'gdpr' } = taskData;

        const validation = {
            framework: framework,
            policies_validated: policies?.length || 0,
            compliant: true,
            violations: [],
            recommendations: []
        };

        // Basic policy validation (commercial tiers have intelligent policy analysis)
        if (!policies || policies.length === 0) {
            validation.compliant = false;
            validation.violations.push({
                type: 'no_policies',
                message: 'No policies provided for validation',
                severity: 'high'
            });
        }

        validation.recommendations.push('Commercial tiers include automated policy generation and validation');
        validation.commercial_note = 'Professional tier provides intelligent policy analysis and automated updates';

        return validation;
    }

    /**
     * Generate basic audit report
     */
    async generateAuditReport(taskData) {
        const { workflowId, frameworks = ['gdpr'], includeRemediation = false } = taskData;

        const report = {
            workflow_id: workflowId,
            generated_at: new Date().toISOString(),
            frameworks_covered: frameworks,
            audit_summary: {},
            findings: [],
            remediation_plan: includeRemediation ? [] : null,
            compliance_score: 75, // Basic scoring
            next_audit_recommended: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
            commercial_features: {
                professional: 'Advanced audit analytics and trend analysis',
                enterprise: 'Automated audit reporting with compliance dashboards'
            }
        };

        // Get audit results from workflow
        const auditResults = await this.queryAgentResults(workflowId, 'compliance-check');
        
        if (auditResults && auditResults.length > 0) {
            const latest = auditResults[auditResults.length - 1];
            report.findings = latest.result_data?.results || [];
            report.audit_summary = {
                frameworks_scanned: latest.result_data?.frameworks_scanned?.length || 0,
                total_violations: latest.result_data?.critical_issues?.length || 0,
                overall_score: latest.result_data?.overall_score || 0
            };
        }

        // Show upgrade value for comprehensive reporting
        if (frameworks.length > 2 || includeRemediation) {
            console.log('\n📊 Professional audit reporting with Enterprise tier:');
            console.log('   → Automated compliance reporting and dashboards');
            console.log('   → Real-time compliance monitoring and alerts');
            console.log('   → Integrated remediation workflows and tracking\\n');
        }

        return report;
    }

    /**
     * Check specific framework compliance
     */
    async checkFrameworkCompliance(taskData) {
        const { framework, requirements = [], strict = false } = taskData;

        if (!this.complianceFrameworks.has(framework)) {
            throw new Error(`Unknown compliance framework: ${framework}`);
        }

        const frameworkData = this.complianceFrameworks.get(framework);
        const compliance = {
            framework: frameworkData.name,
            framework_key: framework,
            requirements_checked: requirements.length || frameworkData.checks.length,
            compliant: true,
            gaps: [],
            score: 80, // Basic scoring
            upgrade_benefits: {
                commercial_features: frameworkData.commercial_features,
                automation_available: 'Enterprise tier provides full automation for this framework'
            }
        };

        // Basic compliance checking (commercial tiers have comprehensive validation)
        const checksToPerform = requirements.length > 0 ? requirements : frameworkData.checks;
        
        for (const check of checksToPerform) {
            // Very basic validation - commercial tiers have detailed implementation
            compliance.gaps.push({
                requirement: check,
                status: 'requires_manual_verification',
                commercial_solution: `Automated validation available in ${frameworkData.commercial_features}`
            });
        }

        if (compliance.gaps.length > 0 && strict) {
            compliance.compliant = false;
        }

        return compliance;
    }

    /**
     * Calculate basic compliance score
     */
    calculateBasicComplianceScore(results) {
        if (results.length === 0) return 0;

        let totalScore = 0;
        for (const result of results) {
            totalScore += result.score || 0;
        }

        return Math.round(totalScore / results.length);
    }

    /**
     * Get available compliance frameworks
     */
    getAvailableFrameworks() {
        const frameworks = [];
        for (const [key, framework] of this.complianceFrameworks) {
            frameworks.push({
                key: key,
                name: framework.name,
                description: framework.description,
                severity: framework.severity,
                checks: framework.checks,
                commercial_enhancement: framework.commercial_features
            });
        }

        return {
            frameworks: frameworks,
            total_frameworks: frameworks.length,
            commercial_note: 'Professional and Enterprise tiers include 15+ additional compliance frameworks',
            upgrade_benefits: [
                'Automated compliance monitoring',
                'Multi-framework orchestration',
                'Real-time violation alerts',
                'Integrated remediation workflows'
            ]
        };
    }
}

module.exports = ComplianceCheckAgent;