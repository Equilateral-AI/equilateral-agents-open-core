/**
 * Full-Stack Development Workflow
 *
 * End-to-end development workflow from code generation to testing.
 *
 * Agents Used:
 * - CodeGeneratorAgent: Generate code from specifications
 * - TestAgent: Automated UI/integration testing
 * - TestOrchestrationAgent: Test execution
 * - CodeReviewAgent: Code quality review
 * - BackendAuditorAgent: Backend validation
 * - FrontendAuditorAgent: Frontend validation
 * - UIUXSpecialistAgent: Design consistency
 *
 * Teaching Value:
 * - Complete SDLC automation
 * - Test-driven development patterns
 * - Continuous quality checks
 * - Full-stack best practices
 */

class FullStackDevelopmentWorkflow {
    constructor(orchestrator) {
        this.orchestrator = orchestrator;
        this.workflowName = 'full-stack-development';
    }

    async execute(options = {}) {
        const {
            projectPath = process.cwd(),
            featureSpec = null,
            generateCode = true,
            runTests = true,
            validateQuality = true,
            checkDesign = true
        } = options;

        console.log('🏗️  Starting Full-Stack Development Workflow');
        console.log(`   Project: ${projectPath}`);

        const results = {
            workflowName: this.workflowName,
            startTime: new Date(),
            projectPath,
            phases: {
                codeGeneration: { completed: false },
                testing: { completed: false },
                backendReview: { completed: false },
                frontendReview: { completed: false },
                designReview: { completed: false },
                qualityCheck: { completed: false }
            },
            generatedFiles: [],
            testResults: {},
            qualityScore: 0
        };

        try {
            // Phase 1: Code Generation (if feature spec provided)
            if (generateCode && featureSpec) {
                console.log('\n💻 Phase 1: Generating code from specification...');
                const codeGenResults = await this.orchestrator.executeAgentTask(
                    'code-generator',
                    'generate',
                    { specification: featureSpec, projectPath }
                );

                results.generatedFiles = codeGenResults.files || [];
                results.phases.codeGeneration = {
                    completed: true,
                    filesGenerated: results.generatedFiles.length
                };
                console.log(`✅ Generated ${results.generatedFiles.length} files`);
            }

            // Phase 2: Automated Testing
            if (runTests) {
                console.log('\n🧪 Phase 2: Running automated tests...');

                // Run unit/integration tests
                const testOrcResults = await this.orchestrator.executeAgentTask(
                    'test-orchestration',
                    'run-tests',
                    { projectPath, testType: 'all' }
                );

                // Run UI tests if applicable
                const uiTestResults = await this.orchestrator.executeAgentTask(
                    'test',
                    'run-ui-tests',
                    { projectPath }
                );

                results.testResults = {
                    unit: testOrcResults,
                    ui: uiTestResults,
                    passed: testOrcResults.passed && uiTestResults.passed
                };

                results.phases.testing = {
                    completed: true,
                    passed: results.testResults.passed,
                    totalTests: (testOrcResults.totalTests || 0) + (uiTestResults.totalTests || 0),
                    passedTests: (testOrcResults.passedTests || 0) + (uiTestResults.passedTests || 0)
                };

                console.log(`✅ Tests completed: ${results.phases.testing.passedTests}/${results.phases.testing.totalTests} passed`);

                if (!results.testResults.passed) {
                    console.log('⚠️  Some tests failed - continuing with quality checks');
                }
            }

            // Phase 3 & 4: Backend and Frontend Review (parallel)
            console.log('\n🔍 Phases 3-4: Running backend and frontend reviews in parallel...');

            const [backendResults, frontendResults] = await Promise.all([
                this.orchestrator.executeAgentTask(
                    'backend-auditor',
                    'audit-backend',
                    { projectPath }
                ),
                this.orchestrator.executeAgentTask(
                    'frontend-auditor',
                    'audit-frontend',
                    { projectPath }
                )
            ]);

            results.phases.backendReview = {
                completed: true,
                issues: backendResults.issues || [],
                score: backendResults.score || 0
            };

            results.phases.frontendReview = {
                completed: true,
                issues: frontendResults.issues || [],
                score: frontendResults.score || 0
            };

            console.log(`✅ Backend review: ${results.phases.backendReview.issues.length} issues found`);
            console.log(`✅ Frontend review: ${results.phases.frontendReview.issues.length} issues found`);

            // Phase 5: Design Consistency Check
            if (checkDesign) {
                console.log('\n🎨 Phase 5: Checking design consistency...');
                const designResults = await this.orchestrator.executeAgentTask(
                    'uiux-specialist',
                    'validate-design',
                    { projectPath }
                );

                results.phases.designReview = {
                    completed: true,
                    issues: designResults.issues || [],
                    accessibilityScore: designResults.accessibilityScore || 0
                };

                console.log(`✅ Design review: ${results.phases.designReview.issues.length} issues found`);
                console.log(`   Accessibility score: ${results.phases.designReview.accessibilityScore}/100`);
            }

            // Phase 6: Overall Quality Check
            if (validateQuality) {
                console.log('\n📊 Phase 6: Overall quality assessment...');
                const qualityResults = await this.orchestrator.executeAgentTask(
                    'code-reviewer',
                    'review',
                    { projectPath }
                );

                results.phases.qualityCheck = {
                    completed: true,
                    issues: qualityResults.issues || []
                };

                // Calculate overall quality score
                results.qualityScore = this.calculateOverallQuality(results);

                console.log(`✅ Quality score: ${results.qualityScore}/100`);
            }

            results.success = true;
            results.endTime = new Date();
            results.duration = results.endTime - results.startTime;

            this.displaySummary(results);

            return results;

        } catch (error) {
            console.error('❌ Full-stack development workflow failed:', error.message);
            results.error = error.message;
            results.success = false;
            return results;
        }
    }

    calculateOverallQuality(results) {
        let totalScore = 100;
        let weights = {
            tests: 30,
            backend: 25,
            frontend: 25,
            design: 20
        };

        // Deduct for test failures
        if (results.phases.testing?.completed) {
            const testPass = (results.phases.testing.passedTests / results.phases.testing.totalTests) * 100;
            totalScore -= weights.tests * (1 - testPass / 100);
        }

        // Deduct for backend issues
        if (results.phases.backendReview?.completed) {
            const backendPenalty = Math.min(weights.backend, results.phases.backendReview.issues.length * 2);
            totalScore -= backendPenalty;
        }

        // Deduct for frontend issues
        if (results.phases.frontendReview?.completed) {
            const frontendPenalty = Math.min(weights.frontend, results.phases.frontendReview.issues.length * 2);
            totalScore -= frontendPenalty;
        }

        // Factor in design score
        if (results.phases.designReview?.completed) {
            const designScore = results.phases.designReview.accessibilityScore / 100;
            totalScore = totalScore * 0.8 + (designScore * weights.design);
        }

        return Math.max(0, Math.round(totalScore));
    }

    displaySummary(results) {
        console.log('\n' + '='.repeat(60));
        console.log('📋 FULL-STACK DEVELOPMENT SUMMARY');
        console.log('='.repeat(60));
        console.log(`Overall Quality Score: ${results.qualityScore}/100`);
        console.log(`\nPhases Completed:`);

        Object.entries(results.phases).forEach(([phase, data]) => {
            if (data.completed) {
                console.log(`  ✅ ${phase}`);
                if (data.filesGenerated) console.log(`     Files generated: ${data.filesGenerated}`);
                if (data.totalTests) console.log(`     Tests: ${data.passedTests}/${data.totalTests} passed`);
                if (data.issues) console.log(`     Issues found: ${data.issues.length}`);
                if (data.score) console.log(`     Score: ${data.score}/100`);
            }
        });

        if (results.generatedFiles?.length > 0) {
            console.log(`\nGenerated Files:`);
            results.generatedFiles.slice(0, 5).forEach(file => {
                console.log(`  📄 ${file}`);
            });
            if (results.generatedFiles.length > 5) {
                console.log(`  ... and ${results.generatedFiles.length - 5} more`);
            }
        }

        console.log('='.repeat(60) + '\n');
    }
}

module.exports = FullStackDevelopmentWorkflow;
