/**
 * Infrastructure Validation Workflow
 *
 * Comprehensive infrastructure-as-code validation and optimization.
 *
 * Agents Used:
 * - TemplateValidationAgent: IaC template validation
 * - ConfigurationManagementAgent: Config validation
 * - ResourceOptimizationAgent: Cost and resource optimization
 * - SecurityReviewerAgent: Infrastructure security
 * - MonitoringOrchestrationAgent: Observability setup
 *
 * Teaching Value:
 * - Infrastructure-as-code best practices
 * - Cost optimization patterns
 * - Security configuration validation
 * - Observability automation
 */

class InfrastructureValidationWorkflow {
    constructor(orchestrator) {
        this.orchestrator = orchestrator;
        this.workflowName = 'infrastructure-validation';
    }

    async execute(options = {}) {
        const {
            projectPath = process.cwd(),
            templatePath = null,
            validateCosts = true,
            optimizeResources = true,
            setupMonitoring = false
        } = options;

        console.log('🏗️  Starting Infrastructure Validation Workflow');
        console.log(`   Project: ${projectPath}`);

        const results = {
            workflowName: this.workflowName,
            startTime: new Date(),
            projectPath,
            validation: {
                templates: { passed: false },
                configuration: { passed: false },
                security: { passed: false },
                costs: { passed: false },
                optimization: { passed: false }
            },
            recommendations: []
        };

        try {
            // Step 1: Template Validation
            if (templatePath) {
                console.log('\n📋 Step 1: Validating infrastructure templates...');
                const templateResults = await this.orchestrator.executeAgentTask(
                    'template-validator',
                    'validate',
                    { templatePath, strictMode: true }
                );

                results.validation.templates = {
                    passed: templateResults.valid === true,
                    errors: templateResults.errors || [],
                    warnings: templateResults.warnings || []
                };

                if (!results.validation.templates.passed) {
                    console.log(`❌ Template validation found ${results.validation.templates.errors.length} errors`);
                } else {
                    console.log(`✅ Template validation passed`);
                    if (results.validation.templates.warnings.length > 0) {
                        console.log(`⚠️  ${results.validation.templates.warnings.length} warnings`);
                    }
                }
            }

            // Step 2: Configuration Management Validation
            console.log('\n⚙️  Step 2: Validating configuration management...');
            const configResults = await this.orchestrator.executeAgentTask(
                'configuration-management',
                'validate',
                { projectPath }
            );

            results.validation.configuration = {
                passed: configResults.valid === true,
                issues: configResults.issues || [],
                recommendations: configResults.recommendations || []
            };

            results.recommendations.push(...(configResults.recommendations || []));

            console.log(`${results.validation.configuration.passed ? '✅' : '⚠️ '} Configuration validation: ${results.validation.configuration.issues.length} issues`);

            // Step 3: Infrastructure Security Review
            console.log('\n🔒 Step 3: Infrastructure security review...');
            const securityResults = await this.orchestrator.executeAgentTask(
                'security-reviewer',
                'review-infrastructure',
                { projectPath, templatePath }
            );

            results.validation.security = {
                passed: this.evaluateSecurityResults(securityResults),
                findings: securityResults.findings || []
            };

            console.log(`${results.validation.security.passed ? '✅' : '⚠️ '} Security review: ${results.validation.security.findings.length} findings`);

            // Step 4: Cost Analysis
            if (validateCosts) {
                console.log('\n💰 Step 4: Analyzing infrastructure costs...');
                const costResults = await this.orchestrator.executeAgentTask(
                    'resource-optimization',
                    'analyze-costs',
                    { projectPath, templatePath }
                );

                results.validation.costs = {
                    passed: true,
                    estimatedMonthlyCost: costResults.estimatedMonthlyCost || 0,
                    breakdown: costResults.breakdown || {},
                    warnings: costResults.warnings || []
                };

                console.log(`✅ Estimated monthly cost: $${results.validation.costs.estimatedMonthlyCost.toFixed(2)}`);
                if (results.validation.costs.warnings.length > 0) {
                    console.log(`⚠️  ${results.validation.costs.warnings.length} cost warnings`);
                }
            }

            // Step 5: Resource Optimization
            if (optimizeResources) {
                console.log('\n⚡ Step 5: Analyzing resource optimization opportunities...');
                const optimizationResults = await this.orchestrator.executeAgentTask(
                    'resource-optimization',
                    'optimize',
                    { projectPath }
                );

                results.validation.optimization = {
                    passed: true,
                    opportunities: optimizationResults.opportunities || [],
                    potentialSavings: optimizationResults.potentialSavings || 0
                };

                results.recommendations.push(...(optimizationResults.opportunities || []));

                console.log(`✅ Found ${results.validation.optimization.opportunities.length} optimization opportunities`);
                if (results.validation.optimization.potentialSavings > 0) {
                    console.log(`   Potential monthly savings: $${results.validation.optimization.potentialSavings.toFixed(2)}`);
                }
            }

            // Step 6: Monitoring Setup (optional)
            if (setupMonitoring) {
                console.log('\n📊 Step 6: Setting up monitoring and observability...');
                const monitoringResults = await this.orchestrator.executeAgentTask(
                    'monitoring-orchestration',
                    'setup',
                    { projectPath, autoCreate: true }
                );

                results.monitoring = {
                    dashboards: monitoringResults.dashboards || [],
                    alerts: monitoringResults.alerts || []
                };

                console.log(`✅ Created ${results.monitoring.dashboards.length} dashboards and ${results.monitoring.alerts.length} alerts`);
            }

            // Overall validation
            results.overallPassed = this.evaluateOverall(results.validation);
            results.success = true;
            results.endTime = new Date();
            results.duration = results.endTime - results.startTime;

            this.displaySummary(results);

            return results;

        } catch (error) {
            console.error('❌ Infrastructure validation failed:', error.message);
            results.error = error.message;
            results.success = false;
            return results;
        }
    }

    evaluateSecurityResults(securityResults) {
        const critical = securityResults.findings?.filter(f => f.severity === 'critical') || [];
        return critical.length === 0;
    }

    evaluateOverall(validation) {
        return validation.templates.passed &&
               validation.configuration.passed &&
               validation.security.passed;
    }

    displaySummary(results) {
        console.log('\n' + '='.repeat(60));
        console.log('📋 INFRASTRUCTURE VALIDATION SUMMARY');
        console.log('='.repeat(60));
        console.log(`Overall Status: ${results.overallPassed ? '✅ PASSED' : '⚠️  NEEDS ATTENTION'}`);

        console.log(`\nValidation Results:`);
        Object.entries(results.validation).forEach(([check, result]) => {
            const icon = result.passed ? '✅' : '⚠️ ';
            console.log(`  ${icon} ${check}: ${result.passed ? 'PASSED' : 'FAILED/WARNINGS'}`);
            if (result.errors?.length > 0) {
                console.log(`     Errors: ${result.errors.length}`);
            }
            if (result.findings?.length > 0) {
                console.log(`     Findings: ${result.findings.length}`);
            }
        });

        if (results.validation.costs?.estimatedMonthlyCost) {
            console.log(`\n💰 Estimated Monthly Cost: $${results.validation.costs.estimatedMonthlyCost.toFixed(2)}`);
        }

        if (results.validation.optimization?.potentialSavings > 0) {
            console.log(`⚡ Potential Savings: $${results.validation.optimization.potentialSavings.toFixed(2)}/month`);
        }

        if (results.recommendations.length > 0) {
            console.log(`\n💡 Top Recommendations:`);
            results.recommendations.slice(0, 5).forEach(rec => {
                console.log(`  • ${rec.title || rec.description || rec}`);
            });
            if (results.recommendations.length > 5) {
                console.log(`  ... and ${results.recommendations.length - 5} more`);
            }
        }

        console.log('='.repeat(60) + '\n');
    }
}

module.exports = InfrastructureValidationWorkflow;
