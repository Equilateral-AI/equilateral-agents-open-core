/**
 * Code Quality Workflow
 *
 * Comprehensive code quality assessment using multiple quality agents.
 *
 * Agents Used:
 * - CodeAnalyzerAgent: Static analysis and metrics
 * - CodeReviewAgent: Best practices and patterns
 * - BackendAuditorAgent: Backend-specific standards
 * - FrontendAuditorAgent: Frontend-specific standards
 * - AuditorAgent: Overall standards compliance
 *
 * Teaching Value:
 * - Quality gate patterns
 * - Multi-layer code review
 * - Standards enforcement automation
 * - Progressive quality checking
 */

class CodeQualityWorkflow {
    constructor(orchestrator) {
        this.orchestrator = orchestrator;
        this.workflowName = 'code-quality';
    }

    async execute(options = {}) {
        const {
            projectPath = process.cwd(),
            failOnQualityScore = 70,
            checkBackend = true,
            checkFrontend = true,
            generateReport = true
        } = options;

        console.log('📊 Starting Code Quality Workflow');
        console.log(`   Project: ${projectPath}`);
        console.log(`   Minimum quality score: ${failOnQualityScore}`);

        const results = {
            workflowName: this.workflowName,
            startTime: new Date(),
            projectPath,
            qualityScore: 0,
            issues: [],
            metrics: {}
        };

        try {
            // Step 1: Static Code Analysis
            console.log('\n🔍 Step 1: Analyzing code structure and metrics...');
            const analysisResults = await this.orchestrator.executeAgentTask(
                'code-analyzer',
                'analyze',
                { projectPath }
            );
            results.metrics = analysisResults.metrics || {};
            results.issues.push(...(analysisResults.issues || []));

            // Step 2: Code Review for Best Practices
            console.log('\n📝 Step 2: Reviewing code quality and best practices...');
            const reviewResults = await this.orchestrator.executeAgentTask(
                'code-reviewer',
                'review',
                { projectPath }
            );
            results.issues.push(...(reviewResults.issues || []));

            // Step 3: Standards Compliance Audit
            console.log('\n✅ Step 3: Validating standards compliance...');
            const auditResults = await this.orchestrator.executeAgentTask(
                'auditor',
                'audit',
                { projectPath }
            );
            results.issues.push(...(auditResults.issues || []));

            // Step 4: Backend-Specific Checks (if applicable)
            if (checkBackend) {
                console.log('\n🔧 Step 4: Backend-specific quality checks...');
                const backendResults = await this.orchestrator.executeAgentTask(
                    'backend-auditor',
                    'audit-backend',
                    { projectPath }
                );
                results.issues.push(...(backendResults.issues || []));
            }

            // Step 5: Frontend-Specific Checks (if applicable)
            if (checkFrontend) {
                console.log('\n🎨 Step 5: Frontend-specific quality checks...');
                const frontendResults = await this.orchestrator.executeAgentTask(
                    'frontend-auditor',
                    'audit-frontend',
                    { projectPath }
                );
                results.issues.push(...(frontendResults.issues || []));
            }

            // Calculate overall quality score
            results.qualityScore = this.calculateQualityScore(results);
            results.passed = results.qualityScore >= failOnQualityScore;

            results.endTime = new Date();
            results.duration = results.endTime - results.startTime;
            results.success = true;

            // Display summary
            this.displaySummary(results, failOnQualityScore);

            if (generateReport) {
                await this.generateQualityReport(results);
            }

            return results;

        } catch (error) {
            console.error('❌ Code quality workflow failed:', error.message);
            results.error = error.message;
            results.success = false;
            return results;
        }
    }

    calculateQualityScore(results) {
        // Simple quality scoring algorithm
        // Start with 100, deduct points for issues
        let score = 100;

        const issueWeights = {
            critical: 15,
            high: 10,
            medium: 5,
            low: 2
        };

        results.issues.forEach(issue => {
            const severity = issue.severity?.toLowerCase() || 'low';
            score -= (issueWeights[severity] || 2);
        });

        // Bonus points for good metrics
        if (results.metrics.complexity?.average < 10) {
            score += 5;
        }
        if (results.metrics.testCoverage > 80) {
            score += 10;
        }

        return Math.max(0, Math.min(100, score));
    }

    displaySummary(results, threshold) {
        console.log('\n' + '='.repeat(60));
        console.log('📋 CODE QUALITY SUMMARY');
        console.log('='.repeat(60));
        console.log(`Quality Score: ${results.qualityScore}/100`);
        console.log(`Status: ${results.passed ? '✅ PASSED' : '❌ FAILED'} (threshold: ${threshold})`);
        console.log(`\nTotal Issues: ${results.issues.length}`);

        const bySeverity = {};
        results.issues.forEach(issue => {
            const severity = issue.severity?.toLowerCase() || 'low';
            bySeverity[severity] = (bySeverity[severity] || 0) + 1;
        });

        console.log('\nIssues by Severity:');
        if (bySeverity.critical) console.log(`  🔴 Critical: ${bySeverity.critical}`);
        if (bySeverity.high) console.log(`  🟠 High:     ${bySeverity.high}`);
        if (bySeverity.medium) console.log(`  🟡 Medium:   ${bySeverity.medium}`);
        if (bySeverity.low) console.log(`  🟢 Low:      ${bySeverity.low}`);

        if (results.metrics.complexity) {
            console.log(`\nComplexity: ${results.metrics.complexity.average.toFixed(2)} (average)`);
        }
        if (results.metrics.testCoverage) {
            console.log(`Test Coverage: ${results.metrics.testCoverage}%`);
        }

        console.log('='.repeat(60) + '\n');
    }

    async generateQualityReport(results) {
        const reportPath = path.join(results.projectPath, '.equilateral', 'quality-report.json');
        const reportDir = path.dirname(reportPath);

        // Ensure directory exists
        const fs = require('fs');
        if (!fs.existsSync(reportDir)) {
            fs.mkdirSync(reportDir, { recursive: true });
        }

        fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
        console.log(`📄 Quality report saved: ${reportPath}`);
    }
}

const path = require('path');
module.exports = CodeQualityWorkflow;
