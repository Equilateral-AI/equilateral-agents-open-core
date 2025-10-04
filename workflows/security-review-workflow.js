/**
 * Security Review Workflow
 *
 * Comprehensive security assessment combining multiple security agents
 * for defense-in-depth analysis.
 *
 * Agents Used:
 * - SecurityScannerAgent: Vulnerability scanning
 * - SecurityReviewerAgent: Security posture assessment
 * - SecurityVulnerabilityAgent: Known vulnerability detection
 * - ComplianceCheckAgent: Standards compliance
 *
 * Teaching Value:
 * - Multi-agent coordination patterns
 * - Security assessment workflows
 * - Parallel execution for speed
 * - Result aggregation and reporting
 */

class SecurityReviewWorkflow {
    constructor(orchestrator) {
        this.orchestrator = orchestrator;
        this.workflowName = 'security-review';
    }

    async execute(options = {}) {
        const {
            projectPath = process.cwd(),
            severity = 'medium', // low | medium | high | critical
            includeCompliance = true,
            parallelExecution = true
        } = options;

        console.log('🔐 Starting Security Review Workflow');
        console.log(`   Project: ${projectPath}`);
        console.log(`   Severity threshold: ${severity}`);

        const results = {
            workflowName: this.workflowName,
            startTime: new Date(),
            projectPath,
            findings: [],
            summary: {}
        };

        try {
            // Step 1: Vulnerability Scanning
            console.log('\n📊 Step 1: Scanning for vulnerabilities...');
            const scanResults = await this.orchestrator.executeAgentTask(
                'security-scanner',
                'scan',
                { projectPath, severity }
            );
            results.findings.push(...(scanResults.vulnerabilities || []));

            // Step 2: Security Review (can run in parallel with Step 3)
            if (parallelExecution) {
                console.log('\n🔄 Steps 2-3: Running security review and vulnerability check in parallel...');

                const [reviewResults, vulnResults] = await Promise.all([
                    this.orchestrator.executeAgentTask(
                        'security-reviewer',
                        'review',
                        { projectPath, includeInfrastructure: true }
                    ),
                    this.orchestrator.executeAgentTask(
                        'security-vulnerability',
                        'detect',
                        { projectPath, knownPatterns: true }
                    )
                ]);

                results.findings.push(...(reviewResults.issues || []));
                results.findings.push(...(vulnResults.vulnerabilities || []));
            } else {
                console.log('\n🔍 Step 2: Security posture review...');
                const reviewResults = await this.orchestrator.executeAgentTask(
                    'security-reviewer',
                    'review',
                    { projectPath, includeInfrastructure: true }
                );
                results.findings.push(...(reviewResults.issues || []));

                console.log('\n🎯 Step 3: Known vulnerability detection...');
                const vulnResults = await this.orchestrator.executeAgentTask(
                    'security-vulnerability',
                    'detect',
                    { projectPath, knownPatterns: true }
                );
                results.findings.push(...(vulnResults.vulnerabilities || []));
            }

            // Step 4: Compliance Check (optional)
            if (includeCompliance) {
                console.log('\n✅ Step 4: Compliance validation...');
                const complianceResults = await this.orchestrator.executeAgentTask(
                    'compliance-check',
                    'validate',
                    { projectPath, standards: ['OWASP', 'CWE'] }
                );
                results.findings.push(...(complianceResults.issues || []));
            }

            // Aggregate and summarize results
            results.summary = this.summarizeFindings(results.findings, severity);
            results.endTime = new Date();
            results.duration = results.endTime - results.startTime;
            results.success = true;

            // Display summary
            this.displaySummary(results.summary);

            return results;

        } catch (error) {
            console.error('❌ Security review failed:', error.message);
            results.error = error.message;
            results.success = false;
            return results;
        }
    }

    summarizeFindings(findings, severityThreshold) {
        const summary = {
            total: findings.length,
            bySeverity: {
                critical: 0,
                high: 0,
                medium: 0,
                low: 0
            },
            byCategory: {},
            actionRequired: false
        };

        const severityLevels = { critical: 4, high: 3, medium: 2, low: 1 };
        const threshold = severityLevels[severityThreshold] || 2;

        findings.forEach(finding => {
            const severity = finding.severity?.toLowerCase() || 'low';
            summary.bySeverity[severity] = (summary.bySeverity[severity] || 0) + 1;

            const category = finding.category || 'other';
            summary.byCategory[category] = (summary.byCategory[category] || 0) + 1;

            if (severityLevels[severity] >= threshold) {
                summary.actionRequired = true;
            }
        });

        return summary;
    }

    displaySummary(summary) {
        console.log('\n' + '='.repeat(60));
        console.log('📋 SECURITY REVIEW SUMMARY');
        console.log('='.repeat(60));
        console.log(`Total findings: ${summary.total}`);
        console.log('\nBy Severity:');
        console.log(`  🔴 Critical: ${summary.bySeverity.critical}`);
        console.log(`  🟠 High:     ${summary.bySeverity.high}`);
        console.log(`  🟡 Medium:   ${summary.bySeverity.medium}`);
        console.log(`  🟢 Low:      ${summary.bySeverity.low}`);

        if (summary.actionRequired) {
            console.log('\n⚠️  ACTION REQUIRED: Critical or high severity issues found');
        } else {
            console.log('\n✅ No critical issues detected');
        }
        console.log('='.repeat(60) + '\n');
    }
}

module.exports = SecurityReviewWorkflow;
