/**
 * Deployment Pipeline Workflow
 *
 * Complete pre-deployment validation and deployment automation.
 *
 * Agents Used:
 * - TemplateValidationAgent: IaC template validation
 * - SecurityReviewerAgent: Security checks
 * - DeploymentValidationAgent: Pre-flight checks
 * - DeploymentAgent: Actual deployment
 * - MonitoringOrchestrationAgent: Post-deployment monitoring
 *
 * Teaching Value:
 * - Deployment gate patterns
 * - Pre-flight validation
 * - Rollback strategies
 * - Post-deployment verification
 */

class DeploymentPipelineWorkflow {
    constructor(orchestrator) {
        this.orchestrator = orchestrator;
        this.workflowName = 'deployment-pipeline';
    }

    async execute(options = {}) {
        const {
            projectPath = process.cwd(),
            environment = 'dev', // dev | staging | production
            templatePath = null,
            skipValidation = false,
            autoRollback = true,
            setupMonitoring = true
        } = options;

        console.log('🚀 Starting Deployment Pipeline Workflow');
        console.log(`   Environment: ${environment}`);
        console.log(`   Project: ${projectPath}`);

        const results = {
            workflowName: this.workflowName,
            startTime: new Date(),
            environment,
            projectPath,
            gates: {
                templateValidation: { passed: false },
                securityReview: { passed: false },
                preFlightChecks: { passed: false },
                deployment: { passed: false },
                monitoring: { passed: false }
            },
            deployment: null
        };

        try {
            // Gate 1: Template Validation
            if (!skipValidation && templatePath) {
                console.log('\n📋 Gate 1: Validating infrastructure templates...');
                const templateResults = await this.orchestrator.executeAgentTask(
                    'template-validator',
                    'validate',
                    { templatePath, environment }
                );

                results.gates.templateValidation = {
                    passed: templateResults.valid === true,
                    issues: templateResults.issues || []
                };

                if (!results.gates.templateValidation.passed) {
                    throw new Error('Template validation failed - deployment blocked');
                }
                console.log('✅ Template validation passed');
            } else {
                results.gates.templateValidation.passed = true;
                results.gates.templateValidation.skipped = true;
            }

            // Gate 2: Security Review
            console.log('\n🔒 Gate 2: Security review...');
            const securityResults = await this.orchestrator.executeAgentTask(
                'security-reviewer',
                'review',
                {
                    projectPath,
                    environment,
                    failOnCritical: environment === 'production'
                }
            );

            results.gates.securityReview = {
                passed: this.evaluateSecurityResults(securityResults, environment),
                findings: securityResults.issues || []
            };

            if (!results.gates.securityReview.passed) {
                throw new Error('Security review failed - deployment blocked');
            }
            console.log('✅ Security review passed');

            // Gate 3: Pre-flight Checks
            console.log('\n✈️  Gate 3: Pre-flight deployment checks...');
            const preFlightResults = await this.orchestrator.executeAgentTask(
                'deployment-validation',
                'validate',
                { projectPath, environment }
            );

            results.gates.preFlightChecks = {
                passed: preFlightResults.ready === true,
                checks: preFlightResults.checks || []
            };

            if (!results.gates.preFlightChecks.passed) {
                throw new Error('Pre-flight checks failed - deployment blocked');
            }
            console.log('✅ Pre-flight checks passed');

            // Gate 4: Deployment
            console.log('\n🚀 Gate 4: Deploying to ' + environment + '...');
            const deploymentResults = await this.orchestrator.executeAgentTask(
                'deployment',
                'deploy',
                {
                    projectPath,
                    environment,
                    rollbackOnFailure: autoRollback
                }
            );

            results.gates.deployment = {
                passed: deploymentResults.success === true,
                deploymentId: deploymentResults.deploymentId,
                resources: deploymentResults.resources || []
            };

            results.deployment = deploymentResults;

            if (!results.gates.deployment.passed) {
                if (autoRollback) {
                    console.log('🔄 Deployment failed - initiating automatic rollback...');
                    await this.rollback(deploymentResults.deploymentId);
                }
                throw new Error('Deployment failed');
            }
            console.log('✅ Deployment successful');

            // Gate 5: Post-Deployment Monitoring Setup
            if (setupMonitoring) {
                console.log('\n📊 Gate 5: Setting up monitoring...');
                const monitoringResults = await this.orchestrator.executeAgentTask(
                    'monitoring-orchestration',
                    'setup',
                    {
                        projectPath,
                        environment,
                        resources: results.deployment.resources
                    }
                );

                results.gates.monitoring = {
                    passed: monitoringResults.success === true,
                    dashboards: monitoringResults.dashboards || [],
                    alerts: monitoringResults.alerts || []
                };

                if (results.gates.monitoring.passed) {
                    console.log('✅ Monitoring configured');
                }
            } else {
                results.gates.monitoring.passed = true;
                results.gates.monitoring.skipped = true;
            }

            // All gates passed
            results.success = true;
            results.endTime = new Date();
            results.duration = results.endTime - results.startTime;

            this.displaySummary(results);

            return results;

        } catch (error) {
            console.error('❌ Deployment pipeline failed:', error.message);
            results.error = error.message;
            results.success = false;
            results.endTime = new Date();
            results.duration = results.endTime - results.startTime;

            this.displaySummary(results);

            return results;
        }
    }

    evaluateSecurityResults(securityResults, environment) {
        const issues = securityResults.issues || [];

        // Production: Block on critical or high
        if (environment === 'production') {
            const critical = issues.filter(i => i.severity === 'critical' || i.severity === 'high');
            return critical.length === 0;
        }

        // Staging: Block only on critical
        if (environment === 'staging') {
            const critical = issues.filter(i => i.severity === 'critical');
            return critical.length === 0;
        }

        // Dev: Just warn, don't block
        return true;
    }

    async rollback(deploymentId) {
        try {
            await this.orchestrator.executeAgentTask(
                'deployment',
                'rollback',
                { deploymentId }
            );
            console.log('✅ Rollback completed');
        } catch (error) {
            console.error('❌ Rollback failed:', error.message);
        }
    }

    displaySummary(results) {
        console.log('\n' + '='.repeat(60));
        console.log('📋 DEPLOYMENT PIPELINE SUMMARY');
        console.log('='.repeat(60));
        console.log(`Environment: ${results.environment}`);
        console.log(`Status: ${results.success ? '✅ SUCCESS' : '❌ FAILED'}`);
        console.log(`\nGate Results:`);

        Object.entries(results.gates).forEach(([gate, result]) => {
            const icon = result.passed ? '✅' : (result.skipped ? '⏭️ ' : '❌');
            const status = result.passed ? 'PASSED' : (result.skipped ? 'SKIPPED' : 'FAILED');
            console.log(`  ${icon} ${gate}: ${status}`);
        });

        if (results.deployment?.deploymentId) {
            console.log(`\nDeployment ID: ${results.deployment.deploymentId}`);
        }

        if (results.duration) {
            console.log(`Duration: ${(results.duration / 1000).toFixed(1)}s`);
        }

        console.log('='.repeat(60) + '\n');
    }
}

module.exports = DeploymentPipelineWorkflow;
