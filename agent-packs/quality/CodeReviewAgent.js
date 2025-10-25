/**
 * Code Review Agent - Automated Code Quality & Standards Enforcement
 * 
 * Provides comprehensive code analysis, standards compliance checking,
 * security vulnerability detection, and automated review recommendations
 */

const fs = require('fs').promises;
const path = require('path');
const PathScanningHelper = require('../../equilateral-core/PathScanningHelper');
const AgentConfiguration = require('../config/AgentConfiguration');
const ModelConfiguration = require('../config/ModelConfiguration');
const { ModelAwareAgent } = require('../config/ModelIntegrationExample');

// Simple response utilities to avoid environment dependencies
const createSuccessResponse = (data, message, metadata) => ({
    success: true,
    data,
    message,
    metadata
});

const createErrorResponse = (message, code) => ({
    success: false,
    message,
    error_code: code
});

class CodeReviewAgent extends ModelAwareAgent {
    constructor(configOverrides = {}) {
        // Initialize ModelAwareAgent with CodeReviewAgent-specific preferences
        super('CodeReviewAgent', {
            ...configOverrides,
            modelConfig: {
                agentPreferences: {
                    CodeReviewAgent: {
                        preferredModels: ['claude-3.5-sonnet', 'gpt-4o', 'claude-4'],
                        capabilities: ['code_analysis', 'quality_assessment', 'complex_reasoning'],
                        maxCostPerTask: 1.5,
                        preferQuality: true
                    }
                }
            }
        });
        
        this.config = new AgentConfiguration(configOverrides);
        this.modelConfig = this.config.getAgentConfig('CodeReviewAgent').modelConfig;
        this.aiConfig = {
            enableAIAnalysis: configOverrides.enableAIAnalysis !== false,
            aiAnalysisThreshold: configOverrides.aiAnalysisThreshold || 'medium',
            fallbackToTraditional: configOverrides.fallbackToTraditional !== false,
            enhancedPatternDetection: configOverrides.enhancedPatternDetection !== false,
            // Enhanced code-specialized model configuration
            codeAnalysisConfig: {
                environment: configOverrides.environment || process.env.NODE_ENV || 'development',
                dataClassification: configOverrides.dataClassification || 'internal', // Code is internal
                maxCostPerReview: configOverrides.maxCostPerReview || 1.5,
                preferCodeSpecializedModels: configOverrides.preferCodeSpecializedModels !== false,
                enableMultiModelConsensus: configOverrides.enableMultiModelConsensus === true,
                supportedLanguages: configOverrides.supportedLanguages || ['javascript', 'typescript', 'python', 'java', 'go', 'rust'],
                reviewDepth: configOverrides.reviewDepth || 'standard' // surface, standard, deep, architectural
            }
        };

        // Initialize path scanner for code review
        this.pathScanner = new PathScanningHelper({
            verbose: configOverrides.verbose !== false,
            extensions: {
                all: ['.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.cs', '.cpp', '.c', '.php', '.rb', '.go', '.rs']
            },
            maxDepth: configOverrides.maxDepth || 10
        });

        // Initialize code-specific capabilities
        this.codeCapabilities = this.initializeCodeCapabilities();
        this.languageSpecializations = this.initializeLanguageSpecializations();

        this.reviewCategories = {
            'code_quality': {
                description: 'Analyze code quality metrics and maintainability',
                weight: 0.25,
                criteria: [
                    'complexity_analysis',
                    'code_duplication_detection',
                    'maintainability_index',
                    'technical_debt_assessment'
                ]
            },
            'security_analysis': {
                description: 'Detect security vulnerabilities and anti-patterns',
                weight: 0.35,
                criteria: [
                    'vulnerability_scanning',
                    'injection_attack_prevention',
                    'authentication_authorization_review',
                    'data_encryption_compliance'
                ]
            },
            'performance_analysis': {
                description: 'Identify performance bottlenecks and optimization opportunities',
                weight: 0.20,
                criteria: [
                    'algorithmic_complexity_review',
                    'memory_usage_analysis',
                    'database_query_optimization',
                    'caching_strategy_assessment'
                ]
            },
            'standards_compliance': {
                description: 'Ensure adherence to coding standards and best practices',
                weight: 0.20,
                criteria: [
                    'coding_style_consistency',
                    'naming_convention_compliance',
                    'documentation_completeness',
                    'test_coverage_analysis'
                ]
            }
        };

        this.securityPatterns = {
            sql_injection: /(\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b).*\+.*\$|\$.*\+.*/gi,
            xss_vulnerability: /(innerHTML|outerHTML|document\.write).*\+|\$\{.*\}/gi,
            hardcoded_secrets: /(password|secret|token|key)\s*[:=]\s*['"][^'"]*['"]/gi,
            insecure_random: /Math\.random\(\)|new Random\(\)/gi,
            weak_encryption: /MD5|SHA1(?!.*256)|DES(?!.*3)/gi
        };

        this.qualityThresholds = {
            complexity_threshold: 10,
            duplication_threshold: 0.15, // 15% duplication
            test_coverage_threshold: 0.80, // 80% coverage
            maintainability_threshold: 70
        };

        this.reviewResults = [];
        this.issues = [];
        this.recommendations = [];
    }

    // Code-Specialized Model Selection Methods
    initializeCodeCapabilities() {
        return {
            javascript: {
                preferredModels: ['claude-3.5-sonnet', 'gpt-4-turbo', 'codey'],
                specializations: ['node_js', 'react', 'express', 'serverless'],
                securityPatterns: ['xss', 'injection', 'prototype_pollution'],
                performancePatterns: ['memory_leaks', 'blocking_operations', 'inefficient_loops']
            },
            typescript: {
                preferredModels: ['claude-3.5-sonnet', 'gpt-4-turbo', 'copilot'],
                specializations: ['angular', 'nest', 'type_safety'],
                securityPatterns: ['type_confusion', 'any_abuse', 'unsafe_assertions'],
                performancePatterns: ['compilation_overhead', 'type_checking_cost']
            },
            python: {
                preferredModels: ['codey', 'gpt-4-turbo', 'claude-3.5-sonnet'],
                specializations: ['django', 'flask', 'fastapi', 'data_science'],
                securityPatterns: ['pickle_injection', 'eval_abuse', 'path_traversal'],
                performancePatterns: ['gil_contention', 'memory_allocation', 'regex_performance']
            },
            java: {
                preferredModels: ['codey', 'gpt-4-turbo', 'claude-4'],
                specializations: ['spring', 'jakarta_ee', 'microservices'],
                securityPatterns: ['deserialization', 'xml_injection', 'reflection_abuse'],
                performancePatterns: ['gc_pressure', 'thread_contention', 'io_blocking']
            },
            go: {
                preferredModels: ['codey', 'gpt-4-turbo', 'claude-3.5-sonnet'],
                specializations: ['goroutines', 'channels', 'microservices'],
                securityPatterns: ['race_conditions', 'unsafe_pointer', 'path_injection'],
                performancePatterns: ['goroutine_leaks', 'channel_blocking', 'memory_alignment']
            },
            rust: {
                preferredModels: ['codey', 'claude-4', 'gpt-4-turbo'],
                specializations: ['memory_safety', 'concurrency', 'systems_programming'],
                securityPatterns: ['unsafe_blocks', 'ffi_vulnerabilities', 'integer_overflow'],
                performancePatterns: ['allocation_patterns', 'zero_cost_abstractions', 'simd_usage']
            }
        };
    }

    initializeLanguageSpecializations() {
        return {
            multiLanguagePatterns: {
                preferredModels: ['claude-4', 'gpt-4-turbo', 'gemini-pro-1.5'],
                capabilities: ['cross_language_analysis', 'architecture_patterns', 'api_consistency'],
                reasoning: 'Multi-language codebases require models with broad language understanding'
            },
            frameworkSpecific: {
                react: { models: ['claude-3.5-sonnet', 'gpt-4-turbo'], focus: ['hooks', 'state_management', 'performance'] },
                node_express: { models: ['codey', 'claude-3.5-sonnet'], focus: ['middleware', 'async_patterns', 'error_handling'] },
                serverless: { models: ['claude-3.5-sonnet', 'gpt-4-turbo'], focus: ['cold_starts', 'memory_optimization', 'event_driven'] },
                microservices: { models: ['claude-4', 'gpt-4-turbo'], focus: ['service_boundaries', 'communication_patterns', 'resilience'] }
            },
            reviewDepthModels: {
                surface: {
                    models: ['claude-3.5-sonnet', 'gpt-3.5-turbo'],
                    maxCost: 0.25,
                    focus: ['syntax_errors', 'basic_security', 'code_style'],
                    description: 'Quick code scan using efficient models'
                },
                standard: {
                    models: ['claude-3.5-sonnet', 'gpt-4', 'codey'],
                    maxCost: 1.5,
                    focus: ['security_vulnerabilities', 'performance_issues', 'maintainability'],
                    description: 'Comprehensive review with production-quality models'
                },
                deep: {
                    models: ['claude-4', 'gpt-4-turbo', 'gemini-pro-1.5'],
                    maxCost: 5.0,
                    focus: ['architectural_patterns', 'complex_logic', 'cross_cutting_concerns'],
                    description: 'Deep analysis with advanced reasoning models'
                },
                architectural: {
                    models: ['claude-4', 'gpt-4-turbo'],
                    maxCost: 10.0,
                    focus: ['system_design', 'scalability', 'technical_debt', 'refactoring_opportunities'],
                    description: 'Architectural review with highest-capability models'
                }
            }
        };
    }

    // Code Review Model Selection
    selectCodeReviewModel(language, reviewDepth = 'standard', fileCount = 1) {
        const taskContext = {
            taskType: 'code_review',
            capability: 'code_review',
            environment: this.aiConfig.codeAnalysisConfig.environment,
            dataClassification: this.aiConfig.codeAnalysisConfig.dataClassification,
            maxCost: this.aiConfig.codeAnalysisConfig.maxCostPerReview,
            requireCompliance: false // Code review typically doesn't need compliance models
        };

        const modelSelection = this.modelConfig.selectOptimalModel(taskContext);
        const codeSpecific = this.getCodeSpecificPreferences(language, reviewDepth, fileCount);
        
        return {
            ...modelSelection,
            codeSpecific: codeSpecific,
            reasoning: this.explainCodeModelSelection(modelSelection, codeSpecific, language, reviewDepth)
        };
    }

    getCodeSpecificPreferences(language, reviewDepth, fileCount) {
        const capabilities = this.codeCapabilities[language] || this.codeCapabilities.javascript;
        const depthConfig = this.languageSpecializations.reviewDepthModels[reviewDepth];
        
        // Multi-model consensus for critical reviews
        const useConsensus = this.aiConfig.codeAnalysisConfig.enableMultiModelConsensus && 
                            (reviewDepth === 'deep' || reviewDepth === 'architectural' || fileCount > 10);
        
        return {
            preferredModels: capabilities.preferredModels,
            specializations: capabilities.specializations,
            securityPatterns: capabilities.securityPatterns,
            performancePatterns: capabilities.performancePatterns,
            depthConfig: depthConfig,
            useMultiModelConsensus: useConsensus,
            consensusModels: useConsensus ? capabilities.preferredModels.slice(0, 3) : [],
            costBudget: depthConfig.maxCost,
            focusAreas: depthConfig.focus
        };
    }

    explainCodeModelSelection(modelSelection, codeSpecific, language, reviewDepth) {
        const explanations = [];
        
        explanations.push(`Selected ${modelSelection.primaryModel} for ${language} code review at ${reviewDepth} depth`);
        
        if (codeSpecific.specializations.length > 0) {
            explanations.push(`Optimized for: ${codeSpecific.specializations.join(', ')}`);
        }
        
        if (codeSpecific.useMultiModelConsensus) {
            explanations.push(`Multi-model consensus enabled with: ${codeSpecific.consensusModels.join(', ')}`);
        }
        
        explanations.push(`Focus areas: ${codeSpecific.focusAreas.join(', ')}`);
        explanations.push(`Budget: $${codeSpecific.costBudget}`);
        
        return explanations.join('. ');
    }

    // Enhanced model selection for different review scenarios
    getModelForReviewScenario(scenario) {
        const scenarios = {
            security_audit: {
                models: ['claude-4', 'gpt-4-turbo'],
                dataClassification: 'confidential',
                maxCost: 5.0,
                reasoning: 'Security audits require high-accuracy models with security expertise'
            },
            performance_optimization: {
                models: ['codey', 'claude-3.5-sonnet', 'gpt-4-turbo'],
                dataClassification: 'internal',
                maxCost: 3.0,
                reasoning: 'Performance analysis benefits from code-specialized models'
            },
            architecture_review: {
                models: ['claude-4', 'gpt-4-turbo', 'gemini-pro-1.5'],
                dataClassification: 'internal',
                maxCost: 10.0,
                reasoning: 'Architectural reviews require models with strong reasoning and context understanding'
            },
            refactoring_suggestions: {
                models: ['claude-3.5-sonnet', 'gpt-4-turbo', 'codey'],
                dataClassification: 'internal',
                maxCost: 2.0,
                reasoning: 'Refactoring benefits from models that understand code patterns and transformations'
            },
            compliance_check: {
                models: ['claude-4', 'gpt-4-turbo'],
                dataClassification: 'confidential',
                maxCost: 3.0,
                reasoning: 'Compliance checking requires thorough analysis and attention to standards'
            },
            legacy_modernization: {
                models: ['claude-4', 'gpt-4-turbo', 'codey'],
                dataClassification: 'internal',
                maxCost: 8.0,
                reasoning: 'Legacy modernization requires understanding of both old and new patterns'
            }
        };

        const scenarioConfig = scenarios[scenario] || scenarios.refactoring_suggestions;
        
        const taskContext = {
            taskType: 'code_review',
            capability: 'code_review',
            environment: this.aiConfig.codeAnalysisConfig.environment,
            dataClassification: scenarioConfig.dataClassification,
            maxCost: scenarioConfig.maxCost
        };

        const modelSelection = this.modelConfig.selectOptimalModel(taskContext);
        
        return {
            ...modelSelection,
            scenario: scenario,
            scenarioConfig: scenarioConfig,
            reasoning: `${scenarioConfig.reasoning}. Selected: ${modelSelection.primaryModel}`
        };
    }

    /**
     * Perform comprehensive code review on specified files or directories
     */
    async performCodeReview(targets = [], reviewOptions = {}) {
        try {
            console.log(`🔍 Starting AI-enhanced comprehensive code review on ${targets.length} targets`);
            
            const reviewResults = {
                targets_reviewed: 0,
                total_files: 0,
                issues_found: {},
                security_vulnerabilities: [],
                performance_issues: [],
                quality_metrics: {},
                compliance_issues: [],
                recommendations: [],
                overall_score: 0,
                aiAnalysis: {
                    enabled: this.aiConfig.enableAIAnalysis,
                    used: false,
                    model: null,
                    confidence: null,
                    enhancementsApplied: []
                }
            };

            for (const target of targets) {
                console.log(`📋 Reviewing target: ${target.name || target.path}`);
                
                const targetReview = await this.reviewTargetWithAI(target, reviewOptions);
                reviewResults.targets_reviewed++;
                reviewResults.total_files += targetReview.files_reviewed;
                
                // Merge AI analysis metadata
                if (targetReview.aiAnalysis) {
                    reviewResults.aiAnalysis.used = reviewResults.aiAnalysis.used || targetReview.aiAnalysis.used;
                    if (targetReview.aiAnalysis.model) {
                        reviewResults.aiAnalysis.model = targetReview.aiAnalysis.model;
                    }
                    if (targetReview.aiAnalysis.enhancementsApplied) {
                        reviewResults.aiAnalysis.enhancementsApplied.push(...targetReview.aiAnalysis.enhancementsApplied);
                    }
                }
                
                // Merge issues by category
                Object.keys(targetReview.issues).forEach(category => {
                    if (!reviewResults.issues_found[category]) {
                        reviewResults.issues_found[category] = [];
                    }
                    reviewResults.issues_found[category].push(...targetReview.issues[category]);
                });

                // Merge specific issue types
                reviewResults.security_vulnerabilities.push(...targetReview.security_vulnerabilities);
                reviewResults.performance_issues.push(...targetReview.performance_issues);
                reviewResults.compliance_issues.push(...targetReview.compliance_issues);
                
                // Merge quality metrics
                Object.assign(reviewResults.quality_metrics, targetReview.quality_metrics);
            }

            // Generate AI-enhanced recommendations and scoring
            reviewResults.recommendations = await this.generateAIEnhancedRecommendations(reviewResults);
            reviewResults.overall_score = this.calculateAIAwareScore(reviewResults);
            
            const summary = this.generateReviewSummary(reviewResults);
            
            return createSuccessResponse(
                { reviewResults, summary },
                'Code review completed successfully',
                {
                    targets_reviewed: reviewResults.targets_reviewed,
                    total_files: reviewResults.total_files,
                    total_issues: Object.values(reviewResults.issues_found).flat().length,
                    security_issues: reviewResults.security_vulnerabilities.length,
                    overall_score: reviewResults.overall_score,
                    timestamp: new Date().toISOString()
                }
            );

        } catch (error) {
            console.error('Code review failed:', error);
            return createErrorResponse(error.message, 'CODE_REVIEW_ERROR');
        }
    }

    /**
     * Review a single target (file or directory)
     */
    async reviewTarget(target, options) {
        const results = {
            files_reviewed: 0,
            issues: {},
            security_vulnerabilities: [],
            performance_issues: [],
            quality_metrics: {},
            compliance_issues: []
        };

        try {
            const files = await this.getFilesForReview(target);
            results.files_reviewed = files.length;

            // Review each file
            for (const file of files) {
                await this.reviewFile(file, results, options);
            }

            // Perform cross-file analysis
            await this.performCrossFileAnalysis(files, results);

        } catch (error) {
            console.error(`Error reviewing target ${target.name}:`, error);
            results.issues.system_errors = results.issues.system_errors || [];
            results.issues.system_errors.push({
                type: 'review_error',
                severity: 'high',
                message: `Failed to review target: ${error.message}`,
                file: target.path
            });
        }

        return results;
    }

    /**
     * Review individual file for all categories
     */
    async reviewFile(filePath, results, options) {
        try {
            const content = await fs.readFile(filePath, 'utf8');
            const fileName = path.basename(filePath);
            const fileExtension = path.extname(filePath);

            // Skip non-code files
            if (!this.isCodeFile(fileExtension)) return;

            console.log(`    📄 Reviewing file: ${fileName}`);

            // Code quality analysis
            await this.analyzeCodeQuality(filePath, content, results);
            
            // Security analysis
            await this.analyzeCodeSecurity(filePath, content, results);
            
            // Performance analysis
            await this.analyzeCodePerformance(filePath, content, results);
            
            // Standards compliance analysis
            await this.analyzeStandardsCompliance(filePath, content, results);

        } catch (error) {
            console.error(`Error reviewing file ${filePath}:`, error);
            results.issues.file_errors = results.issues.file_errors || [];
            results.issues.file_errors.push({
                type: 'file_read_error',
                severity: 'medium',
                message: `Could not read file: ${error.message}`,
                file: filePath
            });
        }
    }

    /**
     * Analyze code quality metrics
     */
    async analyzeCodeQuality(filePath, content, results) {
        if (!results.issues.code_quality) results.issues.code_quality = [];
        
        const fileName = path.basename(filePath);
        
        // Complexity analysis
        const complexity = this.calculateCyclomaticComplexity(content);
        if (complexity > this.qualityThresholds.complexity_threshold) {
            results.issues.code_quality.push({
                type: 'high_complexity',
                severity: 'medium',
                message: `High cyclomatic complexity (${complexity}) exceeds threshold (${this.qualityThresholds.complexity_threshold})`,
                file: fileName,
                line: this.findComplexFunction(content),
                metric: complexity
            });
        }

        // Code duplication detection
        const duplicationScore = this.detectCodeDuplication(content);
        if (duplicationScore > this.qualityThresholds.duplication_threshold) {
            results.issues.code_quality.push({
                type: 'code_duplication',
                severity: 'medium',
                message: `Code duplication (${(duplicationScore * 100).toFixed(1)}%) exceeds threshold (${(this.qualityThresholds.duplication_threshold * 100)}%)`,
                file: fileName,
                metric: duplicationScore
            });
        }

        // Function length analysis
        const longFunctions = this.findLongFunctions(content);
        longFunctions.forEach(func => {
            results.issues.code_quality.push({
                type: 'long_function',
                severity: 'low',
                message: `Function '${func.name}' is too long (${func.lines} lines)`,
                file: fileName,
                line: func.line,
                metric: func.lines
            });
        });

        // Store quality metrics
        results.quality_metrics[fileName] = {
            complexity: complexity,
            duplication_score: duplicationScore,
            long_functions_count: longFunctions.length,
            lines_of_code: content.split('\n').length
        };
    }

    /**
     * Analyze code security vulnerabilities
     */
    async analyzeCodeSecurity(filePath, content, results) {
        const fileName = path.basename(filePath);
        
        // Check for security patterns
        Object.keys(this.securityPatterns).forEach(patternName => {
            const pattern = this.securityPatterns[patternName];
            const matches = content.match(pattern);
            
            if (matches) {
                matches.forEach(match => {
                    const lineNumber = this.getLineNumber(content, match);
                    results.security_vulnerabilities.push({
                        type: patternName,
                        severity: this.getSecuritySeverity(patternName),
                        message: `Potential ${patternName.replace('_', ' ')} vulnerability detected`,
                        file: fileName,
                        line: lineNumber,
                        code_snippet: match,
                        recommendation: this.getSecurityRecommendation(patternName)
                    });
                });
            }
        });

        // Check for insecure configurations
        const insecureConfigs = this.detectInsecureConfigurations(content);
        insecureConfigs.forEach(config => {
            results.security_vulnerabilities.push({
                type: 'insecure_configuration',
                severity: 'high',
                message: config.message,
                file: fileName,
                line: config.line,
                recommendation: config.recommendation
            });
        });

        // Check for missing input validation
        const validationIssues = this.detectMissingValidation(content);
        validationIssues.forEach(issue => {
            results.security_vulnerabilities.push({
                type: 'missing_input_validation',
                severity: 'medium',
                message: issue.message,
                file: fileName,
                line: issue.line,
                recommendation: 'Add proper input validation and sanitization'
            });
        });
    }

    /**
     * Analyze code performance issues
     */
    async analyzeCodePerformance(filePath, content, results) {
        const fileName = path.basename(filePath);
        
        // Detect inefficient algorithms
        const inefficientPatterns = this.detectInefficientAlgorithms(content);
        inefficientPatterns.forEach(pattern => {
            results.performance_issues.push({
                type: 'inefficient_algorithm',
                severity: 'medium',
                message: pattern.message,
                file: fileName,
                line: pattern.line,
                recommendation: pattern.recommendation
            });
        });

        // Detect memory leaks
        const memoryIssues = this.detectPotentialMemoryLeaks(content);
        memoryIssues.forEach(issue => {
            results.performance_issues.push({
                type: 'potential_memory_leak',
                severity: 'high',
                message: issue.message,
                file: fileName,
                line: issue.line,
                recommendation: issue.recommendation
            });
        });

        // Detect inefficient database patterns
        const dbIssues = this.detectInefficientDatabasePatterns(content);
        dbIssues.forEach(issue => {
            results.performance_issues.push({
                type: 'inefficient_database_pattern',
                severity: 'medium',
                message: issue.message,
                file: fileName,
                line: issue.line,
                recommendation: issue.recommendation
            });
        });
    }

    /**
     * Analyze standards compliance
     */
    async analyzeStandardsCompliance(filePath, content, results) {
        const fileName = path.basename(filePath);
        
        // Check naming conventions
        const namingIssues = this.checkNamingConventions(content, filePath);
        namingIssues.forEach(issue => {
            results.compliance_issues.push({
                type: 'naming_convention',
                severity: 'low',
                message: issue.message,
                file: fileName,
                line: issue.line,
                recommendation: issue.recommendation
            });
        });

        // Check documentation completeness
        const docIssues = this.checkDocumentation(content);
        docIssues.forEach(issue => {
            results.compliance_issues.push({
                type: 'missing_documentation',
                severity: 'low',
                message: issue.message,
                file: fileName,
                line: issue.line,
                recommendation: 'Add comprehensive documentation and comments'
            });
        });

        // Check for TODO/FIXME comments
        const todoIssues = this.findTodoComments(content);
        todoIssues.forEach(issue => {
            results.compliance_issues.push({
                type: 'todo_comment',
                severity: 'low',
                message: `TODO/FIXME comment found: ${issue.comment}`,
                file: fileName,
                line: issue.line,
                recommendation: 'Address or create proper issue tracking for TODO items'
            });
        });
    }

    /**
     * Perform cross-file analysis for architectural issues
     */
    async performCrossFileAnalysis(files, results) {
        // Check for circular dependencies
        const circularDeps = this.detectCircularDependencies(files);
        circularDeps.forEach(dep => {
            results.issues.architecture = results.issues.architecture || [];
            results.issues.architecture.push({
                type: 'circular_dependency',
                severity: 'high',
                message: `Circular dependency detected between ${dep.files.join(' and ')}`,
                files: dep.files,
                recommendation: 'Refactor to eliminate circular dependencies'
            });
        });

        // Check for architectural violations
        const archIssues = this.detectArchitecturalViolations(files);
        archIssues.forEach(issue => {
            results.issues.architecture = results.issues.architecture || [];
            results.issues.architecture.push(issue);
        });
    }

    /**
     * Generate comprehensive recommendations based on review results
     */
    async generateReviewRecommendations(reviewResults) {
        const recommendations = [];

        // Security recommendations
        if (reviewResults.security_vulnerabilities.length > 0) {
            const criticalSecurity = reviewResults.security_vulnerabilities.filter(v => v.severity === 'critical').length;
            const highSecurity = reviewResults.security_vulnerabilities.filter(v => v.severity === 'high').length;
            
            if (criticalSecurity > 0 || highSecurity > 0) {
                recommendations.push({
                    category: 'security',
                    priority: 'critical',
                    title: 'Address Security Vulnerabilities',
                    description: `Found ${criticalSecurity} critical and ${highSecurity} high-severity security issues`,
                    actions: [
                        'Review and fix all SQL injection vulnerabilities',
                        'Implement proper input validation and sanitization',
                        'Replace hardcoded secrets with secure configuration',
                        'Update encryption methods to use strong algorithms',
                        'Conduct security code review with security team'
                    ]
                });
            }
        }

        // Performance recommendations
        if (reviewResults.performance_issues.length > 0) {
            recommendations.push({
                category: 'performance',
                priority: 'high',
                title: 'Optimize Performance',
                description: `Found ${reviewResults.performance_issues.length} performance-related issues`,
                actions: [
                    'Optimize inefficient algorithms and data structures',
                    'Fix potential memory leaks and resource management',
                    'Improve database query efficiency',
                    'Implement proper caching strategies',
                    'Profile application performance in production-like environment'
                ]
            });
        }

        // Code quality recommendations
        const qualityIssues = reviewResults.issues_found.code_quality || [];
        if (qualityIssues.length > 0) {
            recommendations.push({
                category: 'code_quality',
                priority: 'medium',
                title: 'Improve Code Quality',
                description: `Found ${qualityIssues.length} code quality issues`,
                actions: [
                    'Reduce cyclomatic complexity of complex functions',
                    'Eliminate code duplication through refactoring',
                    'Break down long functions into smaller, focused units',
                    'Improve code readability and maintainability',
                    'Add unit tests for complex logic'
                ]
            });
        }

        // Compliance recommendations
        if (reviewResults.compliance_issues.length > 0) {
            recommendations.push({
                category: 'compliance',
                priority: 'low',
                title: 'Ensure Standards Compliance',
                description: `Found ${reviewResults.compliance_issues.length} compliance issues`,
                actions: [
                    'Standardize naming conventions across codebase',
                    'Add missing documentation and comments',
                    'Address TODO/FIXME comments or convert to proper issues',
                    'Implement automated code style checking',
                    'Set up pre-commit hooks for standards enforcement'
                ]
            });
        }

        return recommendations;
    }

    /**
     * Calculate overall code review score
     */
    calculateOverallScore(reviewResults) {
        let score = 100;

        // Deduct points for different types of issues
        const securityDeductions = {
            critical: 25,
            high: 15,
            medium: 8,
            low: 3
        };

        const performanceDeductions = {
            high: 12,
            medium: 6,
            low: 2
        };

        const qualityDeductions = {
            high: 8,
            medium: 4,
            low: 1
        };

        // Apply security deductions
        reviewResults.security_vulnerabilities.forEach(vuln => {
            score -= securityDeductions[vuln.severity] || 5;
        });

        // Apply performance deductions
        reviewResults.performance_issues.forEach(issue => {
            score -= performanceDeductions[issue.severity] || 3;
        });

        // Apply quality deductions
        const qualityIssues = reviewResults.issues_found.code_quality || [];
        qualityIssues.forEach(issue => {
            score -= qualityDeductions[issue.severity] || 2;
        });

        // Apply compliance deductions
        score -= Math.min(reviewResults.compliance_issues.length * 0.5, 10);

        // Ensure score doesn't go below 0
        return Math.max(0, Math.round(score));
    }

    /**
     * Generate comprehensive review summary
     */
    generateReviewSummary(reviewResults) {
        const totalIssues = Object.values(reviewResults.issues_found).flat().length;
        const criticalIssues = reviewResults.security_vulnerabilities.filter(v => v.severity === 'critical').length;
        const highIssues = reviewResults.security_vulnerabilities.filter(v => v.severity === 'high').length +
                          reviewResults.performance_issues.filter(i => i.severity === 'high').length;

        return {
            total_files_reviewed: reviewResults.total_files,
            total_issues_found: totalIssues,
            critical_issues: criticalIssues,
            high_priority_issues: highIssues,
            security_vulnerabilities: reviewResults.security_vulnerabilities.length,
            performance_issues: reviewResults.performance_issues.length,
            compliance_issues: reviewResults.compliance_issues.length,
            overall_score: reviewResults.overall_score,
            review_grade: this.getReviewGrade(reviewResults.overall_score),
            recommendations_count: reviewResults.recommendations.length,
            review_timestamp: new Date().toISOString(),
            next_review_recommended: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 1 week from now
        };
    }

    // Helper methods for code analysis

    isCodeFile(extension) {
        const codeExtensions = ['.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.cs', '.cpp', '.c', '.php', '.rb', '.go', '.rs'];
        return codeExtensions.includes(extension.toLowerCase());
    }

    calculateCyclomaticComplexity(content) {
        // Simple cyclomatic complexity calculation
        const complexityKeywords = /\b(if|else|while|for|case|catch|&&|\|\||\?)\b/g;
        const matches = content.match(complexityKeywords);
        return matches ? matches.length + 1 : 1;
    }

    detectCodeDuplication(content) {
        // Simple duplication detection based on line similarity
        const lines = content.split('\n').filter(line => line.trim().length > 10);
        const uniqueLines = new Set(lines.map(line => line.trim()));
        return lines.length > 0 ? 1 - (uniqueLines.size / lines.length) : 0;
    }

    findLongFunctions(content) {
        const functions = [];
        const functionRegex = /function\s+(\w+)|(\w+)\s*[:=]\s*function|(\w+)\s*\([^)]*\)\s*{/g;
        let match;
        
        while ((match = functionRegex.exec(content)) !== null) {
            const functionName = match[1] || match[2] || match[3];
            const startIndex = match.index;
            const lines = this.countFunctionLines(content, startIndex);
            
            if (lines > 50) { // Functions longer than 50 lines
                functions.push({
                    name: functionName,
                    lines: lines,
                    line: this.getLineNumber(content, content.substring(0, startIndex))
                });
            }
        }
        
        return functions;
    }

    findComplexFunction(content) {
        // Return line number of most complex function
        return 1; // Simplified for now
    }

    countFunctionLines(content, startIndex) {
        // Count lines in function (simplified)
        return 10; // Simplified for now
    }

    getLineNumber(content, searchString) {
        const beforeString = content.substring(0, content.indexOf(searchString));
        return beforeString.split('\n').length;
    }

    getSecuritySeverity(patternName) {
        const severityMap = {
            sql_injection: 'critical',
            xss_vulnerability: 'high',
            hardcoded_secrets: 'high',
            insecure_random: 'medium',
            weak_encryption: 'high'
        };
        return severityMap[patternName] || 'medium';
    }

    getSecurityRecommendation(patternName) {
        const recommendations = {
            sql_injection: 'Use parameterized queries or prepared statements',
            xss_vulnerability: 'Sanitize user input and use safe DOM manipulation methods',
            hardcoded_secrets: 'Move secrets to secure configuration or environment variables',
            insecure_random: 'Use cryptographically secure random number generation',
            weak_encryption: 'Update to use SHA-256 or stronger encryption algorithms'
        };
        return recommendations[patternName] || 'Review and address security concern';
    }

    detectInsecureConfigurations(content) {
        const issues = [];
        
        // Check for insecure protocols
        if (content.includes('http://') && !content.includes('localhost')) {
            issues.push({
                message: 'Insecure HTTP protocol used instead of HTTPS',
                line: this.getLineNumber(content, 'http://'),
                recommendation: 'Use HTTPS for all external communications'
            });
        }
        
        return issues;
    }

    detectMissingValidation(content) {
        const issues = [];
        
        // Check for direct user input usage
        const userInputPatterns = /(req\.body|req\.query|req\.params)\.(\w+)/g;
        let match;
        
        while ((match = userInputPatterns.exec(content)) !== null) {
            const context = this.getContextAroundMatch(content, match.index, 100);
            if (!context.includes('validate') && !context.includes('sanitize')) {
                issues.push({
                    message: `User input ${match[0]} may not be properly validated`,
                    line: this.getLineNumber(content, match[0])
                });
            }
        }
        
        return issues;
    }

    detectInefficientAlgorithms(content) {
        const issues = [];
        
        // Check for nested loops
        const nestedLoopPattern = /for\s*\([^}]*for\s*\(/g;
        let match;
        
        while ((match = nestedLoopPattern.exec(content)) !== null) {
            issues.push({
                message: 'Nested loop detected - consider algorithmic optimization',
                line: this.getLineNumber(content, match[0]),
                recommendation: 'Consider using more efficient data structures or algorithms'
            });
        }
        
        return issues;
    }

    detectPotentialMemoryLeaks(content) {
        const issues = [];
        
        // Check for event listeners without cleanup
        const eventListenerPattern = /addEventListener\s*\(/g;
        const removeListenerPattern = /removeEventListener\s*\(/g;
        
        const addCount = (content.match(eventListenerPattern) || []).length;
        const removeCount = (content.match(removeListenerPattern) || []).length;
        
        if (addCount > removeCount) {
            issues.push({
                message: 'Potential memory leak: Event listeners may not be properly cleaned up',
                line: 1,
                recommendation: 'Ensure all event listeners are removed in cleanup/unmount methods'
            });
        }
        
        return issues;
    }

    detectInefficientDatabasePatterns(content) {
        const issues = [];
        
        // Check for N+1 query pattern
        const queryInLoopPattern = /for\s*\([^}]*query\s*\(/g;
        let match;
        
        while ((match = queryInLoopPattern.exec(content)) !== null) {
            issues.push({
                message: 'Potential N+1 query problem detected',
                line: this.getLineNumber(content, match[0]),
                recommendation: 'Use batch queries or joins instead of querying in loops'
            });
        }
        
        return issues;
    }

    checkNamingConventions(content, filePath) {
        const issues = [];
        const fileExtension = path.extname(filePath);
        
        if (fileExtension === '.js' || fileExtension === '.ts') {
            // Check for camelCase variables
            const variablePattern = /\b(var|let|const)\s+([A-Z][a-zA-Z0-9]*)/g;
            let match;
            
            while ((match = variablePattern.exec(content)) !== null) {
                issues.push({
                    message: `Variable '${match[2]}' should use camelCase naming convention`,
                    line: this.getLineNumber(content, match[0]),
                    recommendation: 'Use camelCase for variable names (e.g., userName instead of UserName)'
                });
            }
        }
        
        return issues;
    }

    checkDocumentation(content) {
        const issues = [];
        
        // Check for functions without JSDoc comments
        const functionPattern = /function\s+(\w+)/g;
        const jsdocPattern = /\/\*\*[\s\S]*?\*\//g;
        
        const functions = content.match(functionPattern) || [];
        const jsdocs = content.match(jsdocPattern) || [];
        
        if (functions.length > jsdocs.length) {
            issues.push({
                message: 'Some functions lack proper documentation',
                line: 1,
                recommendation: 'Add JSDoc comments for all public functions'
            });
        }
        
        return issues;
    }

    findTodoComments(content) {
        const issues = [];
        const todoPattern = /\/\/\s*(TODO|FIXME|HACK|XXX):?\s*(.+)/gi;
        let match;
        
        while ((match = todoPattern.exec(content)) !== null) {
            issues.push({
                comment: match[2].trim(),
                line: this.getLineNumber(content, match[0])
            });
        }
        
        return issues;
    }

    detectCircularDependencies(files) {
        // Simplified circular dependency detection
        // In a real implementation, this would build a dependency graph
        return [];
    }

    detectArchitecturalViolations(files) {
        const violations = [];
        
        // Check for direct database access from presentation layer
        files.forEach(file => {
            if (file.path.includes('/components/') || file.path.includes('/views/')) {
                try {
                    const content = require('fs').readFileSync(file.path, 'utf8');
                    if (content.includes('SELECT') || content.includes('INSERT') || content.includes('UPDATE')) {
                        violations.push({
                            type: 'architectural_violation',
                            severity: 'high',
                            message: 'Presentation layer should not contain direct database queries',
                            file: path.basename(file.path),
                            recommendation: 'Move database operations to service or repository layer'
                        });
                    }
                } catch (error) {
                    // Ignore file read errors for this check
                }
            }
        });
        
        return violations;
    }

    getContextAroundMatch(content, matchIndex, contextLength) {
        const start = Math.max(0, matchIndex - contextLength);
        const end = Math.min(content.length, matchIndex + contextLength);
        return content.substring(start, end);
    }

    getReviewGrade(score) {
        if (score >= 90) return 'A';
        if (score >= 80) return 'B';
        if (score >= 70) return 'C';
        if (score >= 60) return 'D';
        return 'F';
    }

    async getFilesForReview(target) {
        // This would typically scan directories and filter for code files
        // For now, return mock structure
        if (target.path) {
            try {
                const stat = await fs.stat(target.path);
                if (stat.isDirectory()) {
                    return await this.scanDirectory(target.path);
                } else {
                    return [{ path: target.path, name: path.basename(target.path) }];
                }
            } catch (error) {
                return [];
            }
        }
        return [];
    }

    async scanDirectory(dirPath) {
        console.warn('scanDirectory is deprecated - using PathScanningHelper instead');
        const filePaths = await this.pathScanner.scanProject(dirPath, { language: 'all' });

        // Convert to expected format { path, name }
        return filePaths.map(filePath => ({
            path: filePath,
            name: path.basename(filePath)
        }));
    }

    // ==========================================
    // AI-ENHANCED CODE REVIEW METHODS
    // ==========================================

    /**
     * Review target with AI enhancements
     */
    async reviewTargetWithAI(target, options) {
        const results = {
            files_reviewed: 0,
            issues: {},
            security_vulnerabilities: [],
            performance_issues: [],
            quality_metrics: {},
            compliance_issues: [],
            aiAnalysis: {
                enabled: this.aiConfig.enableAIAnalysis,
                used: false,
                model: null,
                enhancementsApplied: []
            }
        };

        try {
            const files = await this.getFilesForReview(target);
            results.files_reviewed = files.length;

            // Determine if AI should be used for this target
            const shouldUseAI = this.shouldUseAIForTarget(target, files, options);
            
            if (shouldUseAI) {
                console.log('🤖 Using AI-enhanced code analysis...');
                
                // Perform AI-enhanced analysis
                const aiResults = await this.performAIEnhancedCodeAnalysis(target, files, options);
                
                // Merge AI results
                this.mergeAIResults(results, aiResults);
                results.aiAnalysis = aiResults.metadata || results.aiAnalysis;
                results.aiAnalysis.used = true;
            } else {
                console.log('🔧 Using traditional code analysis methods...');
            }

            // Always perform traditional analysis as baseline/validation
            for (const file of files) {
                await this.reviewFile(file.path, results, options);
            }

            // Perform cross-file analysis with AI enhancements if available
            await this.performAIEnhancedCrossFileAnalysis(files, results);

        } catch (error) {
            console.error(`Error in AI-enhanced review of target ${target.name}:`, error);
            results.issues.system_errors = results.issues.system_errors || [];
            results.issues.system_errors.push({
                type: 'ai_review_error',
                severity: 'high',
                message: `Failed to perform AI-enhanced review: ${error.message}`,
                file: target.path
            });
        }

        return results;
    }

    /**
     * Determine if AI should be used for this target
     */
    shouldUseAIForTarget(target, files, options) {
        if (!this.aiConfig.enableAIAnalysis) return false;
        if (options.forceAI) return true;
        if (options.disableAI) return false;

        // Use AI for larger codebases or complex analysis
        const threshold = this.aiConfig.aiAnalysisThreshold;
        if (threshold === 'always') return true;
        if (threshold === 'never') return false;
        
        // Use heuristics to determine complexity
        const fileCount = files.length;
        const hasComplexFiles = files.some(f => 
            f.name.includes('complex') || 
            f.name.includes('algorithm') ||
            f.path.includes('core/') ||
            f.path.includes('engine/')
        );

        if (threshold === 'complex' && (fileCount > 20 || hasComplexFiles)) return true;
        if (threshold === 'medium' && fileCount > 5) return true;
        
        return false;
    }

    /**
     * Perform AI-enhanced code analysis
     */
    async performAIEnhancedCodeAnalysis(target, files, options) {
        const taskContext = {
            taskType: 'medium',
            taskDescription: `AI code quality analysis on ${target.name || target.path}`,
            requireCapabilities: ['code_analysis', 'quality_assessment', 'complex_reasoning'],
            preferQuality: true,
            maxCost: 1.5,
            environment: process.env.NODE_ENV || 'development'
        };

        try {
            const analysisResult = await this.executeTaskWithModel(taskContext, async (selectedModel, apiClient) => {
                if (apiClient && !apiClient.manual) {
                    return await this.performAutomatedAICodeAnalysis(target, files, selectedModel, apiClient);
                } else if (apiClient && apiClient.manual) {
                    return await this.generateAICodeAnalysisPrompt(target, files, selectedModel);
                } else {
                    return await this.performEnhancedTraditionalCodeAnalysis(target, files);
                }
            });

            return {
                findings: analysisResult.findings || [],
                recommendations: analysisResult.recommendations || [],
                qualityMetrics: analysisResult.qualityMetrics || {},
                metadata: {
                    used: true,
                    model: analysisResult.model || 'unknown',
                    confidence: analysisResult.confidence || 0.8,
                    enhancementsApplied: analysisResult.enhancementsApplied || []
                }
            };

        } catch (error) {
            console.error('AI-enhanced code analysis failed:', error.message);
            
            // Fallback to enhanced traditional analysis
            const fallbackResult = await this.performEnhancedTraditionalCodeAnalysis(target, files);
            return {
                ...fallbackResult,
                metadata: {
                    used: false,
                    fallbackUsed: true,
                    error: error.message,
                    enhancementsApplied: ['fallback_analysis']
                }
            };
        }
    }

    /**
     * Perform automated AI code analysis
     */
    async performAutomatedAICodeAnalysis(target, files, selectedModel, apiClient) {
        try {
            const codeContext = await this.buildCodeAnalysisContext(target, files);
            const analysisPrompt = this.buildAICodeAnalysisPrompt(codeContext);
            
            console.log(`🔍 Running automated AI code analysis with ${selectedModel.name}`);
            
            const response = await this.callProviderAPI(apiClient, {
                model: selectedModel.modelId,
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert code reviewer. Analyze the provided code for quality issues, security vulnerabilities, performance problems, and compliance with best practices. Provide specific, actionable recommendations.'
                    },
                    {
                        role: 'user',
                        content: analysisPrompt
                    }
                ],
                max_tokens: 8000,
                temperature: 0.1
            });

            const analysis = this.parseAICodeAnalysisResponse(response.content, target);
            
            return {
                findings: analysis.findings,
                recommendations: analysis.recommendations,
                qualityMetrics: analysis.qualityMetrics,
                confidence: 0.9,
                model: selectedModel.modelId,
                enhancementsApplied: ['automated_ai_analysis', 'intelligent_pattern_detection', 'contextual_recommendations'],
                tokensUsed: response.usage?.total_tokens || 0,
                cost: this.calculateActualCost(response.usage, selectedModel)
            };

        } catch (error) {
            console.error('Automated AI code analysis failed:', error.message);
            throw error;
        }
    }

    /**
     * Generate AI code analysis prompt for manual execution
     */
    async generateAICodeAnalysisPrompt(target, files, selectedModel) {
        const codeContext = await this.buildCodeAnalysisContext(target, files);
        const prompt = this.buildAICodeAnalysisPrompt(codeContext);
        
        console.log('\n🧠 AI Code Analysis Prompt for Claude Pro Max:');
        console.log('=' .repeat(70));
        console.log(prompt);
        console.log('=' .repeat(70));
        console.log('\n📋 Instructions:');
        console.log('1. Copy the above prompt to Claude Pro Max');
        console.log('2. Review the AI-generated code analysis');
        console.log('3. Implement recommended improvements');

        return {
            findings: [{
                type: 'ai_analysis_manual',
                severity: 'info',
                message: 'AI code analysis prompt generated for manual execution',
                recommendation: 'Execute analysis manually with provided prompt'
            }],
            recommendations: ['Execute manual AI analysis'],
            qualityMetrics: {},
            confidence: null,
            model: selectedModel.modelId,
            enhancementsApplied: ['manual_prompt_generation'],
            manual: true
        };
    }

    /**
     * Perform enhanced traditional code analysis with AI-inspired patterns
     */
    async performEnhancedTraditionalCodeAnalysis(target, files) {
        console.log('🔧 Performing enhanced traditional code analysis...');
        
        const findings = [];
        const recommendations = [];
        const qualityMetrics = {};
        
        for (const file of files) {
            try {
                const content = await fs.readFile(file.path, 'utf8');
                
                // Enhanced pattern detection
                const enhancedIssues = await this.detectAIInspiredCodeIssues(file.path, content);
                findings.push(...enhancedIssues);
                
                // Advanced quality metrics
                const advancedMetrics = this.calculateAdvancedQualityMetrics(content);
                qualityMetrics[file.name] = advancedMetrics;
                
            } catch (error) {
                console.warn(`Failed to analyze file ${file.path}:`, error.message);
            }
        }
        
        // Generate intelligent recommendations
        const intelligentRecs = this.generateIntelligentRecommendations(findings, qualityMetrics);
        recommendations.push(...intelligentRecs);
        
        return {
            findings,
            recommendations,
            qualityMetrics,
            confidence: 0.75,
            enhancementsApplied: ['enhanced_pattern_detection', 'advanced_metrics', 'intelligent_recommendations']
        };
    }

    /**
     * Build code analysis context for AI
     */
    async buildCodeAnalysisContext(target, files) {
        const context = {
            projectName: target.name || path.basename(target.path),
            language: 'javascript',
            framework: 'node.js',
            totalFiles: files.length,
            sampleFiles: []
        };

        // Include sample files for context
        const sampleSize = Math.min(files.length, 5);
        const sampleFiles = files.slice(0, sampleSize);

        for (const file of sampleFiles) {
            try {
                const content = await fs.readFile(file.path, 'utf8');
                context.sampleFiles.push({
                    path: file.path,
                    name: file.name,
                    content: content.length > 3000 ? content.substring(0, 3000) + '...[truncated]' : content,
                    lines: content.split('\\n').length,
                    size: content.length
                });
            } catch (error) {
                // Skip unreadable files
            }
        }

        return context;
    }

    /**
     * Build AI code analysis prompt
     */
    buildAICodeAnalysisPrompt(codeContext) {
        let prompt = `
CODE REVIEW REQUEST

Project: ${codeContext.projectName}
Language: ${codeContext.language}
Framework: ${codeContext.framework}
Total Files: ${codeContext.totalFiles}

ANALYSIS OBJECTIVES:
1. Code Quality Assessment
   - Identify complexity issues and maintainability concerns
   - Detect code duplication and refactoring opportunities
   - Assess adherence to best practices and patterns

2. Security Analysis
   - Find potential security vulnerabilities
   - Check for injection attack vectors
   - Review authentication and authorization patterns

3. Performance Analysis
   - Identify performance bottlenecks
   - Detect inefficient algorithms or data structures
   - Review memory usage and potential leaks

4. Standards Compliance
   - Check coding style consistency
   - Verify naming conventions
   - Assess documentation completeness

SAMPLE CODE FILES:
`;

        codeContext.sampleFiles.forEach((file, index) => {
            prompt += `
File ${index + 1}: ${file.name} (${file.lines} lines)
Path: ${file.path}
\`\`\`javascript
${file.content}
\`\`\`
`;
        });

        prompt += `

REQUIRED OUTPUT FORMAT:
Please provide a structured analysis with the following sections:

1. **QUALITY ISSUES**
   - Type: (e.g., "high_complexity", "code_duplication", "long_function")
   - Severity: ("critical", "high", "medium", "low")
   - File: (filename)
   - Description: (detailed explanation)
   - Recommendation: (specific fix guidance)

2. **SECURITY VULNERABILITIES**
   - Type: (e.g., "sql_injection", "xss_vulnerability", "hardcoded_secrets")
   - Severity: ("critical", "high", "medium", "low")
   - File: (filename)
   - Description: (security concern details)
   - Recommendation: (security fix guidance)

3. **PERFORMANCE ISSUES**
   - Type: (e.g., "inefficient_algorithm", "memory_leak", "n_plus_one_query")
   - Severity: ("high", "medium", "low")
   - File: (filename)
   - Description: (performance concern details)
   - Recommendation: (optimization guidance)

4. **RECOMMENDATIONS**
   - Priority: ("critical", "high", "medium", "low")
   - Category: (e.g., "security", "performance", "quality", "compliance")
   - Title: (brief recommendation title)
   - Description: (detailed recommendation)
   - Actions: (specific steps to take)

Focus on actionable insights that will meaningfully improve code quality, security, and maintainability.
`;

        return prompt;
    }

    /**
     * Parse AI code analysis response
     */
    parseAICodeAnalysisResponse(aiResponse, target) {
        const findings = [];
        const recommendations = [];
        const qualityMetrics = {};

        try {
            const sections = this.extractResponseSections(aiResponse);
            
            // Parse quality issues
            if (sections.qualityIssues) {
                const qualityFindings = this.parseIssuesSection(sections.qualityIssues, 'quality');
                findings.push(...qualityFindings);
            }
            
            // Parse security vulnerabilities
            if (sections.securityVulnerabilities) {
                const securityFindings = this.parseIssuesSection(sections.securityVulnerabilities, 'security');
                findings.push(...securityFindings);
            }
            
            // Parse performance issues
            if (sections.performanceIssues) {
                const performanceFindings = this.parseIssuesSection(sections.performanceIssues, 'performance');
                findings.push(...performanceFindings);
            }
            
            // Parse recommendations
            if (sections.recommendations) {
                const parsedRecommendations = this.parseRecommendationsSection(sections.recommendations);
                recommendations.push(...parsedRecommendations);
            }

        } catch (error) {
            console.warn('Failed to parse AI response, using fallback parsing:', error.message);
            
            // Fallback parsing
            const fallbackFindings = this.extractFindingsFromText(aiResponse);
            findings.push(...fallbackFindings);
        }

        return { findings, recommendations, qualityMetrics };
    }

    /**
     * Extract sections from AI response
     */
    extractResponseSections(response) {
        const sections = {};
        
        const qualityMatch = response.match(/\*\*QUALITY ISSUES\*\*(.*?)(?=\*\*|$)/s);
        if (qualityMatch) sections.qualityIssues = qualityMatch[1];
        
        const securityMatch = response.match(/\*\*SECURITY VULNERABILITIES\*\*(.*?)(?=\*\*|$)/s);
        if (securityMatch) sections.securityVulnerabilities = securityMatch[1];
        
        const performanceMatch = response.match(/\*\*PERFORMANCE ISSUES\*\*(.*?)(?=\*\*|$)/s);
        if (performanceMatch) sections.performanceIssues = performanceMatch[1];
        
        const recommendationsMatch = response.match(/\*\*RECOMMENDATIONS\*\*(.*?)(?=\*\*|$)/s);
        if (recommendationsMatch) sections.recommendations = recommendationsMatch[1];
        
        return sections;
    }

    /**
     * Parse issues section
     */
    parseIssuesSection(sectionText, category) {
        const issues = [];
        const lines = sectionText.split('\\n').filter(line => line.trim());
        
        let currentIssue = {};
        
        for (const line of lines) {
            const trimmed = line.trim();
            
            if (trimmed.startsWith('- Type:')) {
                if (currentIssue.type) {
                    issues.push(this.normalizeIssue(currentIssue, category));
                }
                currentIssue = { type: trimmed.substring(7).trim() };
            } else if (trimmed.startsWith('- Severity:')) {
                currentIssue.severity = trimmed.substring(11).trim().toLowerCase();
            } else if (trimmed.startsWith('- File:')) {
                currentIssue.file = trimmed.substring(7).trim();
            } else if (trimmed.startsWith('- Description:')) {
                currentIssue.message = trimmed.substring(14).trim();
            } else if (trimmed.startsWith('- Recommendation:')) {
                currentIssue.recommendation = trimmed.substring(17).trim();
            }
        }
        
        if (currentIssue.type) {
            issues.push(this.normalizeIssue(currentIssue, category));
        }
        
        return issues;
    }

    /**
     * Parse recommendations section
     */
    parseRecommendationsSection(sectionText) {
        const recommendations = [];
        const lines = sectionText.split('\\n').filter(line => line.trim());
        
        let currentRec = {};
        
        for (const line of lines) {
            const trimmed = line.trim();
            
            if (trimmed.startsWith('- Priority:')) {
                if (currentRec.priority) {
                    recommendations.push(currentRec);
                }
                currentRec = { priority: trimmed.substring(11).trim().toLowerCase() };
            } else if (trimmed.startsWith('- Category:')) {
                currentRec.category = trimmed.substring(11).trim();
            } else if (trimmed.startsWith('- Title:')) {
                currentRec.title = trimmed.substring(8).trim();
            } else if (trimmed.startsWith('- Description:')) {
                currentRec.description = trimmed.substring(14).trim();
            } else if (trimmed.startsWith('- Actions:')) {
                currentRec.actions = [trimmed.substring(10).trim()];
            }
        }
        
        if (currentRec.priority) {
            recommendations.push(currentRec);
        }
        
        return recommendations;
    }

    /**
     * Normalize issue format
     */
    normalizeIssue(issue, category) {
        return {
            type: issue.type || 'ai_detected_issue',
            severity: this.normalizeSeverity(issue.severity),
            message: issue.message || 'AI-detected code issue',
            file: issue.file || 'unknown',
            recommendation: issue.recommendation || 'Review and address the identified issue',
            category: category,
            source: 'ai_analysis'
        };
    }

    /**
     * Normalize severity levels
     */
    normalizeSeverity(severity) {
        if (!severity) return 'medium';
        const normalized = severity.toLowerCase();
        if (['critical', 'high', 'medium', 'low'].includes(normalized)) {
            return normalized;
        }
        if (normalized.includes('crit')) return 'critical';
        if (normalized.includes('sev')) return 'high';
        return 'medium';
    }

    /**
     * Extract findings from unstructured text (fallback)
     */
    extractFindingsFromText(text) {
        const findings = [];
        const keywords = ['issue', 'problem', 'vulnerability', 'inefficient', 'complex', 'duplicate'];
        
        for (const keyword of keywords) {
            const regex = new RegExp(`(${keyword}[^.!?]*[.!?])`, 'gi');
            const matches = text.match(regex);
            
            if (matches) {
                matches.forEach(match => {
                    findings.push({
                        type: 'ai_detected_issue',
                        severity: 'medium',
                        message: match.trim(),
                        file: 'detected_in_analysis',
                        recommendation: 'Review the identified concern',
                        category: 'general',
                        source: 'ai_analysis_fallback'
                    });
                });
            }
        }
        
        return findings;
    }

    /**
     * Merge AI results into traditional results
     */
    mergeAIResults(results, aiResults) {
        // Merge findings by category
        aiResults.findings.forEach(finding => {
            const category = finding.category || 'ai_detected';
            if (!results.issues[category]) results.issues[category] = [];
            results.issues[category].push(finding);
        });
        
        // Merge quality metrics
        Object.assign(results.quality_metrics, aiResults.qualityMetrics || {});
        
        // Add AI recommendations to existing recommendations
        results.ai_recommendations = aiResults.recommendations || [];
    }

    /**
     * Enhanced cross-file analysis with AI
     */
    async performAIEnhancedCrossFileAnalysis(files, results) {
        try {
            // Traditional cross-file analysis
            await this.performCrossFileAnalysis(files, results);
            
            // AI-inspired architectural analysis
            if (this.aiConfig.enhancedPatternDetection) {
                const architecturalIssues = await this.detectAIInspiredArchitecturalIssues(files);
                
                if (architecturalIssues.length > 0) {
                    results.issues.architecture = results.issues.architecture || [];
                    results.issues.architecture.push(...architecturalIssues);
                }
            }
            
        } catch (error) {
            console.warn('Enhanced cross-file analysis failed:', error.message);
        }
    }

    /**
     * Detect AI-inspired code issues
     */
    async detectAIInspiredCodeIssues(filePath, content) {
        const issues = [];
        
        try {
            // Context-aware complexity analysis
            const contextualComplexity = this.analyzeContextualComplexity(content, filePath);
            if (contextualComplexity.issues.length > 0) {
                issues.push(...contextualComplexity.issues);
            }
            
            // Semantic duplicate detection
            const semanticDuplicates = this.detectSemanticDuplication(content);
            if (semanticDuplicates.length > 0) {
                issues.push(...semanticDuplicates);
            }
            
            // Anti-pattern detection
            const antiPatterns = this.detectAntiPatterns(content, filePath);
            issues.push(...antiPatterns);
            
        } catch (error) {
            console.warn(`AI-inspired analysis failed for ${filePath}:`, error.message);
        }
        
        return issues;
    }

    /**
     * Analyze contextual complexity
     */
    analyzeContextualComplexity(content, filePath) {
        const issues = [];
        const fileName = path.basename(filePath);
        
        // Check if high complexity is justified by file purpose
        const complexity = this.calculateCyclomaticComplexity(content);
        const fileType = this.classifyFileType(filePath);
        
        const expectedComplexity = {
            'controller': 15,
            'service': 12,
            'utility': 8,
            'component': 10,
            'default': 10
        };
        
        const threshold = expectedComplexity[fileType] || expectedComplexity.default;
        
        if (complexity > threshold) {
            const severity = complexity > threshold * 1.5 ? 'high' : 'medium';
            issues.push({
                type: 'contextual_high_complexity',
                severity,
                message: `Complexity (${complexity}) exceeds expected threshold (${threshold}) for ${fileType} file`,
                file: fileName,
                recommendation: `Consider refactoring this ${fileType} to reduce complexity`,
                source: 'enhanced_traditional'
            });
        }
        
        return { issues };
    }

    /**
     * Classify file type based on path and content
     */
    classifyFileType(filePath) {
        if (filePath.includes('/controller')) return 'controller';
        if (filePath.includes('/service')) return 'service';
        if (filePath.includes('/util') || filePath.includes('/helper')) return 'utility';
        if (filePath.includes('/component')) return 'component';
        return 'default';
    }

    /**
     * Detect semantic code duplication
     */
    detectSemanticDuplication(content) {
        const issues = [];
        
        // Extract function signatures and bodies
        const functions = this.extractFunctions(content);
        
        // Compare functions for semantic similarity
        for (let i = 0; i < functions.length; i++) {
            for (let j = i + 1; j < functions.length; j++) {
                const similarity = this.calculateSemanticSimilarity(functions[i], functions[j]);
                
                if (similarity > 0.8) { // 80% similarity threshold
                    issues.push({
                        type: 'semantic_duplication',
                        severity: 'medium',
                        message: `Functions '${functions[i].name}' and '${functions[j].name}' are semantically similar`,
                        recommendation: 'Consider extracting common logic into a shared function',
                        source: 'enhanced_traditional'
                    });
                }
            }
        }
        
        return issues;
    }

    /**
     * Extract functions from code
     */
    extractFunctions(content) {
        const functions = [];
        const functionRegex = /function\s+(\w+)\s*\([^)]*\)\s*\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g;
        let match;
        
        while ((match = functionRegex.exec(content)) !== null) {
            functions.push({
                name: match[1],
                body: match[2],
                signature: match[0].substring(0, match[0].indexOf('{'))
            });
        }
        
        return functions;
    }

    /**
     * Calculate semantic similarity between functions
     */
    calculateSemanticSimilarity(func1, func2) {
        // Simplified semantic similarity based on normalized content
        const normalize = (text) => text.replace(/\\s+/g, ' ').replace(/[{}();]/g, '').trim().toLowerCase();
        
        const body1 = normalize(func1.body);
        const body2 = normalize(func2.body);
        
        if (body1.length === 0 && body2.length === 0) return 1.0;
        if (body1.length === 0 || body2.length === 0) return 0.0;
        
        // Simple Jaccard similarity on words
        const words1 = new Set(body1.split(' '));
        const words2 = new Set(body2.split(' '));
        
        const intersection = new Set([...words1].filter(x => words2.has(x)));
        const union = new Set([...words1, ...words2]);
        
        return intersection.size / union.size;
    }

    /**
     * Detect anti-patterns
     */
    detectAntiPatterns(content, filePath) {
        const issues = [];
        
        // God Object anti-pattern
        const lines = content.split('\\n').length;
        const methods = (content.match(/function\\s+\\w+/g) || []).length;
        
        if (lines > 500 && methods > 20) {
            issues.push({
                type: 'god_object',
                severity: 'high',
                message: 'File appears to be a "God Object" with too many responsibilities',
                file: path.basename(filePath),
                recommendation: 'Consider breaking this file into smaller, more focused modules',
                source: 'enhanced_traditional'
            });
        }
        
        // Callback Hell detection
        const callbackDepth = this.calculateCallbackDepth(content);
        if (callbackDepth > 3) {
            issues.push({
                type: 'callback_hell',
                severity: 'medium',
                message: `Deep callback nesting detected (depth: ${callbackDepth})`,
                file: path.basename(filePath),
                recommendation: 'Consider using Promises or async/await to flatten callback structure',
                source: 'enhanced_traditional'
            });
        }
        
        return issues;
    }

    /**
     * Calculate callback nesting depth
     */
    calculateCallbackDepth(content) {
        let maxDepth = 0;
        let currentDepth = 0;
        
        for (const char of content) {
            if (char === '(') {
                // Check if this might be start of callback
                currentDepth++;
                maxDepth = Math.max(maxDepth, currentDepth);
            } else if (char === ')') {
                currentDepth = Math.max(0, currentDepth - 1);
            }
        }
        
        return Math.floor(maxDepth / 3); // Approximate callback depth
    }

    /**
     * Calculate advanced quality metrics
     */
    calculateAdvancedQualityMetrics(content) {
        return {
            ...this.calculateBasicMetrics(content),
            callbackDepth: this.calculateCallbackDepth(content),
            semanticComplexity: this.calculateSemanticComplexity(content),
            maintainabilityIndex: this.calculateMaintainabilityIndex(content)
        };
    }

    /**
     * Calculate basic metrics
     */
    calculateBasicMetrics(content) {
        return {
            linesOfCode: content.split('\\n').length,
            complexity: this.calculateCyclomaticComplexity(content),
            duplicationScore: this.detectCodeDuplication(content),
            functionCount: (content.match(/function\\s+\\w+/g) || []).length
        };
    }

    /**
     * Calculate semantic complexity
     */
    calculateSemanticComplexity(content) {
        const patterns = [
            /if\s*\(/g, /else/g, /while\s*\(/g, /for\s*\(/g,
            /switch\s*\(/g, /case\s/g, /try\s*\{/g, /catch\s*\(/g
        ];
        
        let complexity = 0;
        patterns.forEach(pattern => {
            const matches = content.match(pattern);
            complexity += matches ? matches.length : 0;
        });
        
        return complexity;
    }

    /**
     * Calculate maintainability index
     */
    calculateMaintainabilityIndex(content) {
        const loc = content.split('\\n').length;
        const complexity = this.calculateCyclomaticComplexity(content);
        const duplication = this.detectCodeDuplication(content);
        
        // Simplified maintainability index
        let index = 100;
        index -= Math.log(loc) * 5;
        index -= complexity * 2;
        index -= duplication * 50;
        
        return Math.max(0, Math.min(100, Math.round(index)));
    }

    /**
     * Detect AI-inspired architectural issues
     */
    async detectAIInspiredArchitecturalIssues(files) {
        const issues = [];
        
        try {
            // Dependency direction analysis
            const dependencyIssues = this.analyzeDependencyDirection(files);
            issues.push(...dependencyIssues);
            
            // Cohesion analysis
            const cohesionIssues = this.analyzeCohesion(files);
            issues.push(...cohesionIssues);
            
        } catch (error) {
            console.warn('Architectural analysis failed:', error.message);
        }
        
        return issues;
    }

    /**
     * Analyze dependency direction for architectural violations
     */
    analyzeDependencyDirection(files) {
        const issues = [];
        
        // Check for upward dependencies (detail depending on abstraction)
        files.forEach(file => {
            const filePath = file.path;
            const layer = this.identifyArchitecturalLayer(filePath);
            
            if (layer === 'controller' || layer === 'handler') {
                // Controllers should not depend on other controllers
                files.forEach(otherFile => {
                    if (otherFile.path !== filePath && this.identifyArchitecturalLayer(otherFile.path) === 'controller') {
                        try {
                            const content = require('fs').readFileSync(filePath, 'utf8');
                            if (content.includes(path.basename(otherFile.path, '.js'))) {
                                issues.push({
                                    type: 'controller_coupling',
                                    severity: 'medium',
                                    message: 'Controller depends on another controller',
                                    file: path.basename(filePath),
                                    recommendation: 'Move shared logic to a service layer'
                                });
                            }
                        } catch (error) {
                            // Skip file read errors
                        }
                    }
                });
            }
        });
        
        return issues;
    }

    /**
     * Identify architectural layer of a file
     */
    identifyArchitecturalLayer(filePath) {
        if (filePath.includes('/controller') || filePath.includes('/handler')) return 'controller';
        if (filePath.includes('/service')) return 'service';
        if (filePath.includes('/repository') || filePath.includes('/dao')) return 'data';
        if (filePath.includes('/model') || filePath.includes('/entity')) return 'model';
        if (filePath.includes('/util') || filePath.includes('/helper')) return 'utility';
        return 'unknown';
    }

    /**
     * Analyze module cohesion
     */
    analyzeCohesion(files) {
        const issues = [];
        
        // Analyze each directory for functional cohesion
        const directories = new Map();
        
        files.forEach(file => {
            const dir = path.dirname(file.path);
            if (!directories.has(dir)) {
                directories.set(dir, []);
            }
            directories.get(dir).push(file);
        });
        
        directories.forEach((dirFiles, dirPath) => {
            if (dirFiles.length > 1) {
                const cohesionScore = this.calculateCohesionScore(dirFiles);
                
                if (cohesionScore < 0.5) { // Low cohesion threshold
                    issues.push({
                        type: 'low_cohesion',
                        severity: 'medium',
                        message: `Low cohesion detected in directory: ${path.basename(dirPath)}`,
                        files: dirFiles.map(f => f.name),
                        recommendation: 'Consider reorganizing files by functional similarity'
                    });
                }
            }
        });
        
        return issues;
    }

    /**
     * Calculate cohesion score for files in a directory
     */
    calculateCohesionScore(files) {
        // Simplified cohesion calculation based on shared imports/exports
        const allImports = new Set();
        const allExports = new Set();
        
        files.forEach(file => {
            try {
                const content = require('fs').readFileSync(file.path, 'utf8');
                
                // Extract imports
                const imports = content.match(/require\\s*\\([^)]*\\)|import\\s+[^;]+/g) || [];
                imports.forEach(imp => allImports.add(imp));
                
                // Extract exports
                const exports = content.match(/module\\.exports|export\\s+/g) || [];
                exports.forEach(exp => allExports.add(exp));
                
            } catch (error) {
                // Skip file read errors
            }
        });
        
        // Simple cohesion metric: shared dependencies / total dependencies
        const totalDependencies = allImports.size + allExports.size;
        const sharedDependencies = Math.floor(totalDependencies / files.length);
        
        return totalDependencies > 0 ? sharedDependencies / totalDependencies : 1.0;
    }

    /**
     * Generate intelligent recommendations based on AI analysis
     */
    generateIntelligentRecommendations(findings, qualityMetrics) {
        const recommendations = [];
        
        // Categorize findings for intelligent grouping
        const findingsByType = {};
        findings.forEach(finding => {
            const category = finding.category || 'general';
            if (!findingsByType[category]) findingsByType[category] = [];
            findingsByType[category].push(finding);
        });
        
        // Generate category-specific recommendations
        Object.entries(findingsByType).forEach(([category, categoryFindings]) => {
            const rec = this.generateCategoryRecommendation(category, categoryFindings, qualityMetrics);
            if (rec) recommendations.push(rec);
        });
        
        return recommendations;
    }

    /**
     * Generate category-specific recommendation
     */
    generateCategoryRecommendation(category, findings, qualityMetrics) {
        const severityCount = {
            critical: findings.filter(f => f.severity === 'critical').length,
            high: findings.filter(f => f.severity === 'high').length,
            medium: findings.filter(f => f.severity === 'medium').length,
            low: findings.filter(f => f.severity === 'low').length
        };
        
        const totalIssues = findings.length;
        if (totalIssues === 0) return null;
        
        const priority = severityCount.critical > 0 ? 'critical' : 
                        severityCount.high > 0 ? 'high' : 'medium';
        
        return {
            category: category,
            priority: priority,
            title: `Address ${category.replace('_', ' ')} Issues`,
            description: `Found ${totalIssues} ${category} issues (${severityCount.critical} critical, ${severityCount.high} high)`,
            actions: this.generateCategoryActions(category, severityCount),
            aiEnhanced: true
        };
    }

    /**
     * Generate category-specific actions
     */
    generateCategoryActions(category, severityCount) {
        const actionMap = {
            quality: [
                'Refactor high-complexity functions',
                'Eliminate code duplication',
                'Break down large functions',
                'Improve naming conventions'
            ],
            security: [
                'Fix injection vulnerabilities',
                'Remove hardcoded secrets',
                'Add input validation',
                'Implement proper authentication'
            ],
            performance: [
                'Optimize inefficient algorithms',
                'Fix memory leaks',
                'Improve database queries',
                'Add caching where appropriate'
            ]
        };
        
        return actionMap[category] || ['Review and address identified issues'];
    }

    /**
     * Generate AI-enhanced recommendations
     */
    async generateAIEnhancedRecommendations(reviewResults) {
        const baseRecommendations = await this.generateReviewRecommendations(reviewResults);
        
        // Add AI-specific insights if AI was used
        if (reviewResults.aiAnalysis.used) {
            baseRecommendations.push({
                category: 'ai_insights',
                priority: 'low',
                title: 'AI-Enhanced Analysis Completed',
                description: `AI analysis using ${reviewResults.aiAnalysis.model} provided enhanced insights`,
                actions: reviewResults.aiAnalysis.enhancementsApplied || [],
                aiEnhanced: true
            });
        }
        
        // Add intelligent recommendations from AI analysis
        if (reviewResults.ai_recommendations) {
            baseRecommendations.push(...reviewResults.ai_recommendations);
        }
        
        return baseRecommendations;
    }

    /**
     * Calculate AI-aware overall score
     */
    calculateAIAwareScore(reviewResults) {
        let score = this.calculateOverallScore(reviewResults);
        
        // Adjust score based on AI confidence if AI was used
        if (reviewResults.aiAnalysis.used && reviewResults.aiAnalysis.confidence) {
            const confidenceBonus = (reviewResults.aiAnalysis.confidence - 0.5) * 10; // -5 to +5 points
            score = Math.max(0, Math.min(100, score + confidenceBonus));
        }
        
        return Math.round(score);
    }
}

module.exports = CodeReviewAgent;