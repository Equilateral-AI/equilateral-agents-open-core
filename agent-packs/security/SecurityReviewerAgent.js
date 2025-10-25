// SecurityReviewerAgent.js - Comprehensive security analysis with production cost controls
// Security review patterns following Equilateral standards

const fs = require('fs').promises;
const path = require('path');
const AgentConfiguration = require('../config/AgentConfiguration');
const ModelConfiguration = require('../config/ModelConfiguration');
const { ModelAwareAgent } = require('../config/ModelIntegrationExample');
const PathScanningHelper = require('../../equilateral-core/PathScanningHelper');

class SecurityReviewerAgent extends ModelAwareAgent {
    constructor(config = {}) {
        // Initialize ModelAwareAgent with SecurityReviewerAgent-specific preferences
        super('SecurityReviewerAgent', {
            ...config,
            modelConfig: {
                agentPreferences: {
                    SecurityReviewerAgent: {
                        preferredModels: ['claude-4', 'gpt-4-turbo', 'claude-3.5-sonnet'],
                        capabilities: ['security_analysis', 'complex_reasoning', 'vulnerability_detection'],
                        maxCostPerTask: 2.0,
                        preferQuality: true
                    }
                }
            }
        });
        // Initialize path scanner for security review
        this.pathScanner = new PathScanningHelper({
            verbose: config.verbose !== false,
            extensions: {
                all: ['.js', '.ts', '.py', '.java', '.go', '.rs']
            },
            maxDepth: config.maxDepth || 10
        });
        
        this.agentConfig = new AgentConfiguration(config);
        this.modelConfig = this.agentConfig.getAgentConfig('SecurityReviewerAgent').modelConfig;
        this.config = {
            projectRoot: config.projectRoot || this.agentConfig.getProjectPath(),
            securityThresholds: config.securityThresholds || this.getDefaultThresholds(),
            complianceLevel: config.complianceLevel || 'production',
            costTolerance: config.costTolerance || 'balanced',
            enableAIAnalysis: config.enableAIAnalysis !== false, // Default to enabled
            aiAnalysisThreshold: config.aiAnalysisThreshold || 'medium', // When to use AI
            fallbackToTraditional: config.fallbackToTraditional !== false, // Always have fallback
            // Enhanced model selection configuration
            modelSelection: {
                environment: config.environment || process.env.NODE_ENV || 'development',
                dataClassification: config.dataClassification || 'confidential', // Security data is sensitive
                requireCompliance: config.requireCompliance !== false, // Default to required
                preferEnterpriseProviders: config.preferEnterpriseProviders !== false,
                maxCostPerAnalysis: config.maxCostPerAnalysis || 5.0, // Higher budget for security
                fallbackToLocal: config.fallbackToLocal === true // For air-gapped environments
            },
            ...config
        };
        
        this.securityPatterns = this.initializeSecurityPatterns();
        this.vulnerabilityDatabase = this.initializeVulnerabilityDatabase();
        this.productionControls = this.initializeProductionControls();
        
        // AI-enhanced capabilities
        this.aiSecurityPatterns = this.initializeAISecurityPatterns();
        this.intelligentThreatDetection = this.initializeIntelligentThreatDetection();
    }

    getDefaultThresholds() {
        return {
            // From security-roadmap.md - Progressive security enhancement thresholds
            basic: {
                maxUsers: 10,
                maxCompanies: 5,
                requiredControls: ['basic_auth', 'input_validation', 'error_handling']
            },
            enhanced: {
                maxUsers: 100,
                maxCompanies: 20,
                requiredControls: ['mfa', 'rbac', 'audit_logging', 'secure_storage']
            },
            advanced: {
                maxUsers: 1000,
                maxCompanies: 100,
                requiredControls: ['zero_trust', 'continuous_monitoring', 'incident_response']
            },
            enterprise: {
                maxUsers: Infinity,
                maxCompanies: Infinity,
                requiredControls: ['formal_verification', 'compliance_automation', 'threat_modeling']
            }
        };
    }

    initializeSecurityPatterns() {
        return {
            // From tech_stack_security.md
            authentication: {
                patterns: [
                    'AWS Cognito integration',
                    'JWT token validation',
                    'Multi-factor authentication',
                    'Custom authentication flows'
                ],
                antiPatterns: [
                    'Hardcoded credentials',
                    'Weak password policies',
                    'Token exposure in logs',
                    'Session fixation vulnerabilities'
                ]
            },
            
            authorization: {
                patterns: [
                    'Role-Based Access Control (RBAC)',
                    'Context-based authorization',
                    'Least privilege enforcement',
                    'Permission structure validation'
                ],
                antiPatterns: [
                    'Overly permissive roles',
                    'Missing context validation',
                    'Privilege escalation paths',
                    'Inconsistent access controls'
                ]
            },

            dataProtection: {
                patterns: [
                    'AES-256 encryption at rest',
                    'TLS 1.2+ for data in transit',
                    'PII tokenization',
                    'Audit trails for sensitive data'
                ],
                antiPatterns: [
                    'Unencrypted sensitive data',
                    'PII in logs or error messages',
                    'Weak encryption algorithms',
                    'Missing data retention policies'
                ]
            },

            inputValidation: {
                patterns: [
                    'Typed schemas (Zod/Joi/AJV)',
                    'Input sanitization',
                    'Output encoding',
                    'Content-Type enforcement'
                ],
                antiPatterns: [
                    'Unvalidated user inputs',
                    'SQL injection vulnerabilities',
                    'XSS attack vectors',
                    'Command injection risks'
                ]
            },

            errorHandling: {
                patterns: [
                    'Structured error responses',
                    'No sensitive information in errors',
                    'Client-friendly error messages',
                    'Appropriate error logging'
                ],
                antiPatterns: [
                    'Stack traces in production errors',
                    'Database connection strings in errors',
                    'Internal system details exposed',
                    'Debugging information leaks'
                ]
            },

            infrastructure: {
                patterns: [
                    'VPC security groups',
                    'Private subnets for databases',
                    'WAF for public endpoints',
                    'Network ACLs'
                ],
                antiPatterns: [
                    'Overly permissive security groups',
                    'Public database access',
                    'Missing network segmentation',
                    'Unmonitored network traffic'
                ]
            }
        };
    }

    initializeVulnerabilityDatabase() {
        return {
            // From validate-security.sh patterns
            criticalVulnerabilities: [
                {
                    type: 'hardcoded_secrets',
                    patterns: [
                        'password\\s*[=:]\\s*["\']\\w+["\']',
                        'secret\\s*[=:]\\s*["\']\\w+["\']', 
                        'api[_-]?key\\s*[=:]\\s*["\']\\w+["\']',
                        'access[_-]?token\\s*[=:]\\s*["\']\\w+["\']',
                        'private[_-]?key\\s*[=:]\\s*["\']\\w+["\']'
                    ],
                    severity: 'critical',
                    impact: 'credential_exposure'
                },
                {
                    type: 'console_logging',
                    patterns: ['console\\.log.*password', 'console\\.log.*secret', 'console\\.log'],
                    severity: 'high',
                    impact: 'information_disclosure'
                },
                {
                    type: 'cors_wildcard',
                    patterns: ['AllowOrigin:.*\\*', "'\\*'"],
                    severity: 'medium',
                    impact: 'cross_origin_attacks'
                },
                {
                    type: 'weak_tls',
                    patterns: ['TLSv1\\.0', 'TLSv1\\.1', 'SSL'],
                    severity: 'high',
                    impact: 'man_in_the_middle'
                }
            ],
            
            securityRequirements: [
                'Secure logging implementation',
                'Environment validation framework',
                'CORS configuration security',
                'SSL/TLS validation framework',
                'Response utility security updates',
                'Database client security',
                'Console.log migration completion',
                'Environment variables security',
                'Security documentation',
                'Rollback procedures'
            ]
        };
    }

    initializeProductionControls() {
        return {
            // From security-roadmap.md production thresholds
            costControlThresholds: {
                lowCost: {
                    monthlyBudget: 1000,
                    controls: ['basic_monitoring', 'automated_backups']
                },
                mediumCost: {
                    monthlyBudget: 5000,
                    controls: ['enhanced_monitoring', 'incident_response', 'compliance_reporting']
                },
                highCost: {
                    monthlyBudget: 15000,
                    controls: ['24x7_monitoring', 'threat_intelligence', 'formal_audits']
                }
            },

            productionGates: {
                preDeployment: [
                    'Security validation passing',
                    'Vulnerability scan clean',
                    'Penetration test completed',
                    'Compliance checks passed'
                ],
                postDeployment: [
                    'Monitoring active',
                    'Incident response ready',
                    'Backup verification',
                    'Performance baselines established'
                ]
            },

            emergencyProcedures: {
                securityIncident: [
                    'Isolate affected systems',
                    'Preserve evidence',
                    'Notify stakeholders',
                    'Execute containment plan'
                ],
                dataBreach: [
                    'Assess scope of exposure',
                    'Notify authorities within 72 hours',
                    'Customer notification plan',
                    'Forensic investigation'
                ]
            }
        };
    }

    async performSecurityReview(options = {}) {
        const review = {
            timestamp: new Date().toISOString(),
            projectPath: options.projectPath || this.config.projectRoot,
            reviewType: options.reviewType || 'comprehensive',
            findings: [],
            recommendations: [],
            costAnalysis: {},
            complianceStatus: {},
            riskAssessment: {},
            systemMetrics: {},
            aiAnalysis: {
                enabled: this.config.enableAIAnalysis,
                used: false,
                model: null,
                confidence: null,
                fallbackUsed: false
            }
        };

        try {
            // 1. System Metrics Analysis (understand actual infrastructure)
            review.systemMetrics = await this.assessSystemMetrics(review.projectPath);
            
            // 2. Enhanced Analysis with AI Integration
            if (this.config.enableAIAnalysis && this.shouldUseAI(options.reviewType)) {
                const aiFindings = await this.performAIEnhancedSecurityAnalysis(review.projectPath, options.reviewType);
                review.findings.push(...aiFindings.findings);
                review.aiAnalysis = {
                    ...review.aiAnalysis,
                    ...aiFindings.metadata
                };
            } else {
                console.log('🔧 Using traditional security analysis methods');
                review.aiAnalysis.fallbackUsed = true;
            }
            
            // 3. Traditional Analysis (always run as backup/validation)
            const traditionalFindings = await this.performTraditionalSecurityAnalysis(review.projectPath);
            review.findings.push(...traditionalFindings);
            
            // 4. Production Readiness
            review.complianceStatus = await this.assessProductionReadiness(review.projectPath);
            
            // 5. Cost Analysis (with realistic system metrics)
            review.costAnalysis = await this.analyzeCostImplications(review.findings, review.systemMetrics);
            
            // 6. AI-Enhanced Risk Assessment
            review.riskAssessment = await this.performIntelligentRiskAssessment(review.findings, review.systemMetrics);
            
            // 7. Generate Smart Recommendations
            review.recommendations = await this.generateIntelligentRecommendations(review);
            
            return review;
            
        } catch (error) {
            review.findings.push({
                type: 'analysis_error',
                severity: 'high',
                message: `Security analysis failed: ${error.message}`,
                location: 'SecurityReviewerAgent',
                aiAnalysis: review.aiAnalysis.used ? 'AI analysis failed, fallback used' : 'Traditional analysis used'
            });
            review.aiAnalysis.fallbackUsed = true;
            return review;
        }
    }

    async assessSystemMetrics(projectPath) {
        const metrics = {
            architecture: 'serverless_arm64', // Default assumption for modern AWS
            monthlyInfrastructureCost: 50, // Realistic baseline
            lambdaCount: 0,
            databaseType: 'unknown',
            userCount: 'development',
            environmentType: 'development'
        };

        try {
            // Detect Lambda architecture from SAM templates
            const samTemplates = [
                this.agentConfig.getTimComboPath('IAC/sam/dev_stuff/deployAPI/lambda_with_auth.yaml'),
                this.agentConfig.getTimComboPath('IAC/sam/dev_stuff/SB_Flux/lambda_with_auth_updated.yaml'),
                // Also check deployment configs directory
                this.agentConfig.getDeploymentConfigPath('lambda_with_auth.yaml'),
                this.agentConfig.getDeploymentConfigPath('sam/lambda_with_auth.yaml')
            ];

            for (const templatePath of samTemplates) {
                try {
                    const content = await fs.readFile(templatePath, 'utf8');
                    
                    // Check for ARM64 architecture
                    if (content.includes('arm64')) {
                        metrics.architecture = 'serverless_arm64';
                    }
                    
                    // Check for database type
                    if (content.includes('t4g.micro')) {
                        metrics.databaseType = 'rds_postgresql_t4g_micro_arm64';
                        metrics.monthlyInfrastructureCost = 43; // ARM64 cost advantage
                    } else if (content.includes('t3.micro')) {
                        metrics.databaseType = 'rds_postgresql_t3_micro';
                        metrics.monthlyInfrastructureCost = 50;
                    }
                    
                    // Determine environment type
                    if (templatePath.includes('SB_Flux')) {
                        metrics.environmentType = 'sandbox';
                        metrics.userCount = 'pilot_testing';
                    } else if (templatePath.includes('deployAPI')) {
                        metrics.environmentType = 'development';
                        metrics.userCount = 'development';
                    }
                    
                } catch (error) {
                    // Template file might not exist
                }
            }

            // Count Lambda handlers
            const handlersDir = path.join(projectPath, 'src/backend/src/handlers');
            try {
                const handlerCount = await this.countLambdaHandlers(handlersDir);
                metrics.lambdaCount = handlerCount;
                
                // Adjust cost estimates based on actual Lambda count
                if (handlerCount > 100) {
                    metrics.monthlyInfrastructureCost += Math.min(handlerCount * 0.1, 20);
                }
            } catch (error) {
                // Handlers directory might not exist
            }

            // Detect multi-project setup
            // Use configurable project paths instead of hardcoded names
            const potentialProjects = [
                this.agentConfig.getTimComboPath(),
                this.agentConfig.getProjectPath(),
                this.agentConfig.getEquilateralPath()
            ];
            let detectedProjects = 0;
            
            for (const project of potentialProjects) {
                try {
                    const projectPath = path.join(projectPath, '..', project);
                    await fs.access(projectPath);
                    detectedProjects++;
                } catch (error) {
                    // Project doesn't exist
                }
            }
            
            if (detectedProjects > 1) {
                metrics.multiProject = true;
                metrics.monthlyInfrastructureCost += Math.min(detectedProjects * 10, 30);
            }

        } catch (error) {
            // Use defaults if analysis fails
        }

        return metrics;
    }

    async countLambdaHandlers(handlersDir) {
        let count = 0;
        
        try {
            const entries = await fs.readdir(handlersDir, { withFileTypes: true });
            
            for (const entry of entries) {
                const fullPath = path.join(handlersDir, entry.name);
                
                if (entry.isDirectory()) {
                    count += await this.countLambdaHandlers(fullPath);
                } else if (entry.name.endsWith('.js')) {
                    count++;
                }
            }
        } catch (error) {
            // Directory might not exist
        }
        
        return count;
    }

    async performStaticAnalysis(projectPath) {
        const findings = [];
        
        try {
            // Check for hardcoded secrets
            const secretFindings = await this.scanForSecrets(projectPath);
            findings.push(...secretFindings);
            
            // Check for console.log statements in production
            const loggingFindings = await this.scanLoggingIssues(projectPath);
            findings.push(...loggingFindings);
            
            // Check CORS configuration
            const corsFindings = await this.scanCORSConfiguration(projectPath);
            findings.push(...corsFindings);
            
            // Check TLS/SSL configuration
            const tlsFindings = await this.scanTLSConfiguration(projectPath);
            findings.push(...tlsFindings);
            
        } catch (error) {
            findings.push({
                type: 'static_analysis_error',
                severity: 'medium',
                message: `Static analysis incomplete: ${error.message}`
            });
        }
        
        return findings;
    }

    async scanForSecrets(projectPath) {
        const findings = [];
        const patterns = this.vulnerabilityDatabase.criticalVulnerabilities
            .find(v => v.type === 'hardcoded_secrets').patterns;
        
        try {
            const files = await this.getJavaScriptFiles(projectPath);
            
            for (const file of files) {
                const content = await fs.readFile(file, 'utf8');
                const lines = content.split('\n');
                
                // Determine if this is test/development code
                const isTestFile = file.includes('/test') || 
                                 file.includes('/archived') || 
                                 file.includes('test_data') || 
                                 file.includes('/dev/') ||
                                 file.includes('_test.js');
                
                lines.forEach((line, index) => {
                    patterns.forEach(pattern => {
                        const regex = new RegExp(pattern, 'i');
                        if (regex.test(line)) {
                            findings.push({
                                type: 'hardcoded_secrets',
                                severity: isTestFile ? 'medium' : 'critical', // Lower severity for test files
                                message: isTestFile ? 
                                        'Hardcoded secret in test/development file' : 
                                        'Potential hardcoded secret detected',
                                location: `${file}:${index + 1}`,
                                code: line.trim(),
                                recommendation: isTestFile ?
                                              'Use test-specific environment variables' :
                                              'Use environment variables or AWS Secrets Manager',
                                context: isTestFile ? 'test_file' : 'production_code'
                            });
                        }
                    });
                });
            }
        } catch (error) {
            findings.push({
                type: 'secret_scan_error',
                severity: 'medium',
                message: `Secret scanning failed: ${error.message}`
            });
        }
        
        return findings;
    }

    async scanLoggingIssues(projectPath) {
        const findings = [];
        
        try {
            const criticalFiles = [
                'src/backend/src/helpers/responseUtil.js',
                'src/backend/src/helpers/dbClient.js',
                'src/backend/src/helpers/errorHandler.js',
                'src/backend/src/helpers/lambdaWrapper.js'
            ];
            
            for (const relativePath of criticalFiles) {
                const filePath = path.join(projectPath, relativePath);
                try {
                    const content = await fs.readFile(filePath, 'utf8');
                    const consoleLogMatches = content.match(/console\.log/g);
                    
                    if (consoleLogMatches && consoleLogMatches.length > 0) {
                        findings.push({
                            type: 'insecure_logging',
                            severity: 'high',
                            message: `Found ${consoleLogMatches.length} console.log statements in critical file`,
                            location: filePath,
                            recommendation: 'Replace with secure logging using secureLogger helper'
                        });
                    }
                } catch (error) {
                    // File doesn't exist, which might be expected
                }
            }
        } catch (error) {
            findings.push({
                type: 'logging_scan_error',
                severity: 'low',
                message: `Logging scan failed: ${error.message}`
            });
        }
        
        return findings;
    }

    async performTraditionalSecurityAnalysis(projectPath) {
        const findings = [];
        
        try {
            console.log('🛡️ Performing traditional security pattern analysis...');
            
            // 1. Static Analysis
            findings.push(...await this.performStaticAnalysis(projectPath));
            
            // 2. Scan for authentication patterns
            const authFindings = await this.scanAuthenticationPatterns(projectPath);
            findings.push(...authFindings);
            
            // 3. Scan for authorization patterns  
            const authzFindings = await this.scanAuthorizationPatterns(projectPath);
            findings.push(...authzFindings);
            
            // 4. Scan for data protection patterns
            const dataFindings = await this.scanDataProtectionPatterns(projectPath);
            findings.push(...dataFindings);
            
            // 5. Scan for input validation patterns
            const inputFindings = await this.scanInputValidationPatterns(projectPath);
            findings.push(...inputFindings);
            
            console.log(`🔍 Traditional analysis found ${findings.length} security findings`);
            
        } catch (error) {
            findings.push({
                type: 'traditional_analysis_error',
                severity: 'low',
                message: `Traditional analysis failed: ${error.message}`
            });
        }
        
        return findings;
    }

    // ==========================================
    // AI-ENHANCED SECURITY ANALYSIS METHODS
    // ==========================================

    initializeAISecurityPatterns() {
        return {
            contextualAnalysis: {
                codePatterns: [
                    'Analyze authentication flows for weakness patterns',
                    'Identify authorization bypass vulnerabilities',
                    'Detect data exposure risks in API responses',
                    'Assess cryptographic implementation quality'
                ],
                architecturalPatterns: [
                    'Evaluate microservice security boundaries',
                    'Assess serverless function isolation',
                    'Analyze database access patterns',
                    'Review infrastructure security configurations'
                ]
            },
            
            threatModeling: {
                attackVectors: [
                    'SQL injection entry points',
                    'Cross-site scripting vulnerabilities',
                    'Authentication bypass techniques',
                    'Privilege escalation paths',
                    'Data exfiltration opportunities'
                ],
                mitigationStrategies: [
                    'Input validation effectiveness',
                    'Output encoding completeness',
                    'Session management security',
                    'Error handling information disclosure'
                ]
            }
        };
    }

    initializeIntelligentThreatDetection() {
        return {
            riskScoring: {
                factors: ['severity', 'exploitability', 'impact', 'detectability'],
                weights: { critical: 1.0, high: 0.7, medium: 0.4, low: 0.1 },
                contextualAdjustments: true
            },
            
            prioritization: {
                businessImpact: ['data_breach', 'service_disruption', 'compliance_violation'],
                technicalComplexity: ['easy_fix', 'medium_effort', 'major_refactor'],
                urgency: ['immediate', 'short_term', 'long_term']
            }
        };
    }

    shouldUseAI(reviewType) {
        if (!this.config.enableAIAnalysis) return false;
        
        const complexReviewTypes = ['comprehensive', 'threat_modeling', 'vulnerability_scan', 'penetration_test'];
        const threshold = this.config.aiAnalysisThreshold;
        
        if (threshold === 'always') return true;
        if (threshold === 'never') return false;
        if (threshold === 'complex' && complexReviewTypes.includes(reviewType)) return true;
        if (threshold === 'medium' && (complexReviewTypes.includes(reviewType) || reviewType === 'security_audit')) return true;
        
        return false;
    }

    // Enhanced Security-Focused Model Selection
    selectSecurityAnalysisModel(analysisType, dataClassification = 'confidential') {
        const taskContext = {
            taskType: 'security_analysis',
            capability: 'security_analysis',
            environment: this.config.modelSelection.environment,
            dataClassification: dataClassification,
            maxCost: this.config.modelSelection.maxCostPerAnalysis,
            requireCompliance: this.config.modelSelection.requireCompliance
        };

        const modelSelection = this.modelConfig.selectOptimalModel(taskContext);
        
        // Security-specific model preferences
        const securityPreferences = this.getSecurityModelPreferences(analysisType, dataClassification);
        
        return {
            ...modelSelection,
            securitySpecific: securityPreferences,
            reasoning: this.explainModelSelection(modelSelection, securityPreferences)
        };
    }

    getSecurityModelPreferences(analysisType, dataClassification) {
        const preferences = {
            vulnerability_scan: {
                preferredProviders: ['aws_bedrock', 'azure_openai'], // Enterprise for sensitive scans
                preferredModels: ['claude-4', 'gpt-4-turbo'],
                reasoning: 'Vulnerability scanning requires high accuracy and enterprise compliance',
                minConfidence: 0.9
            },
            threat_modeling: {
                preferredProviders: ['anthropic_direct', 'aws_bedrock'],
                preferredModels: ['claude-4', 'claude-3.5-sonnet'],
                reasoning: 'Threat modeling benefits from Claude\'s reasoning capabilities',
                minConfidence: 0.8
            },
            compliance_audit: {
                preferredProviders: ['aws_bedrock', 'azure_openai', 'ollama'], // Include local for air-gapped
                preferredModels: ['claude-4', 'gpt-4-turbo', 'llama-2-70b'],
                reasoning: 'Compliance audits may require local models for data residency',
                minConfidence: 0.9
            },
            penetration_test: {
                preferredProviders: ['ollama', 'lm_studio'], // Local only for security testing
                preferredModels: ['llama-2-70b', 'mistral-7b-instruct'],
                reasoning: 'Penetration testing should use local models to avoid exposing attack vectors',
                minConfidence: 0.7
            },
            code_security_review: {
                preferredProviders: ['anthropic_direct', 'openai_direct', 'google_vertex'],
                preferredModels: ['claude-3.5-sonnet', 'gpt-4-turbo', 'codey'],
                reasoning: 'Code review combines security analysis with code understanding',
                minConfidence: 0.8
            },
            incident_analysis: {
                preferredProviders: ['aws_bedrock', 'azure_openai'], // Enterprise SLA required
                preferredModels: ['claude-4', 'gpt-4-turbo'],
                reasoning: 'Incident analysis requires high availability and enterprise support',
                minConfidence: 0.9
            }
        };

        const basePreference = preferences[analysisType] || preferences.code_security_review;
        
        // Adjust based on data classification
        if (dataClassification === 'restricted') {
            basePreference.preferredProviders = ['ollama', 'lm_studio']; // Local only
            basePreference.reasoning += ' (restricted data requires local processing)';
        } else if (dataClassification === 'confidential' && this.config.modelSelection.preferEnterpriseProviders) {
            basePreference.preferredProviders = basePreference.preferredProviders.filter(p => 
                ['aws_bedrock', 'azure_openai', 'google_vertex'].includes(p)
            );
        }

        return basePreference;
    }

    explainModelSelection(modelSelection, securityPreferences) {
        const explanations = [];
        
        explanations.push(`Selected ${modelSelection.primaryModel} from ${modelSelection.tier}`);
        explanations.push(`Reason: ${securityPreferences.reasoning}`);
        
        if (modelSelection.complianceRequired) {
            explanations.push('Compliance requirements enforced');
        }
        
        if (modelSelection.costThreshold < 2.0) {
            explanations.push('Cost optimization applied');
        }
        
        explanations.push(`Fallback chain: ${modelSelection.fallbackChain.slice(0, 3).join(' → ')}`);
        
        return explanations.join('. ');
    }

    getModelForSecurityTask(taskDescription, dataClassification = 'confidential') {
        // Determine analysis type from task description
        let analysisType = 'code_security_review'; // default
        
        if (taskDescription.includes('vulnerability') || taskDescription.includes('scan')) {
            analysisType = 'vulnerability_scan';
        } else if (taskDescription.includes('threat') || taskDescription.includes('model')) {
            analysisType = 'threat_modeling';
        } else if (taskDescription.includes('compliance') || taskDescription.includes('audit')) {
            analysisType = 'compliance_audit';
        } else if (taskDescription.includes('penetration') || taskDescription.includes('pentest')) {
            analysisType = 'penetration_test';
        } else if (taskDescription.includes('incident') || taskDescription.includes('forensic')) {
            analysisType = 'incident_analysis';
        }

        return this.selectSecurityAnalysisModel(analysisType, dataClassification);
    }

    // Cost-aware model selection for different security analysis depths
    selectModelByAnalysisDepth(depth = 'standard', budget = null) {
        const depthConfigs = {
            surface: {
                maxCost: 0.50,
                preferredTier: 'tier3_development',
                analysisType: 'code_security_review',
                description: 'Quick security scan using cost-effective models'
            },
            standard: {
                maxCost: 2.00,
                preferredTier: 'tier2_production',
                analysisType: 'vulnerability_scan',
                description: 'Comprehensive security analysis with production models'
            },
            deep: {
                maxCost: 5.00,
                preferredTier: 'tier1_enterprise',
                analysisType: 'threat_modeling',
                description: 'Deep security analysis with enterprise-grade models'
            },
            forensic: {
                maxCost: 10.00,
                preferredTier: 'tier1_enterprise',
                analysisType: 'incident_analysis',
                description: 'Forensic-level analysis for critical security incidents'
            }
        };

        const config = depthConfigs[depth] || depthConfigs.standard;
        const effectiveBudget = budget || config.maxCost;
        
        return this.selectSecurityAnalysisModel(config.analysisType, 'confidential');
    }

    async performAIEnhancedSecurityAnalysis(projectPath, reviewType) {
        const result = {
            findings: [],
            metadata: {
                used: true,
                model: null,
                confidence: 0,
                analysisType: 'ai_enhanced',
                fallbackUsed: false
            }
        };

        // Use enhanced security-focused model selection
        const modelSelection = this.getModelForSecurityTask(`${reviewType} security analysis`, 'confidential');
        console.log(`🔒 Security Model Selection: ${modelSelection.reasoning}`);
        
        const taskContext = {
            taskType: 'complex',
            taskDescription: `AI-enhanced security analysis: ${reviewType} on ${projectPath}`,
            requireCapabilities: ['security_analysis', 'vulnerability_detection', 'complex_reasoning'],
            preferQuality: true,
            maxCost: modelSelection.costThreshold,
            environment: this.config.modelSelection.environment,
            modelSelection: modelSelection
        };

        try {
            console.log('🤖 Starting AI-enhanced security analysis...');
            
            const analysisResult = await this.executeTaskWithModel(taskContext, async (selectedModel, apiClient) => {
                result.metadata.model = selectedModel.modelId;
                
                if (apiClient && !apiClient.manual) {
                    // Automated AI analysis
                    return await this.performAutomatedAISecurityAnalysis(projectPath, reviewType, selectedModel, apiClient);
                } else if (apiClient && apiClient.manual) {
                    // Claude Pro Max hybrid mode
                    return await this.generateAISecurityAnalysisPrompt(projectPath, reviewType, selectedModel);
                } else {
                    // Fallback to enhanced traditional analysis
                    console.log('⚠️ AI analysis unavailable, using enhanced traditional methods');
                    result.metadata.fallbackUsed = true;
                    return await this.performEnhancedTraditionalAnalysis(projectPath, reviewType);
                }
            });

            if (analysisResult && analysisResult.findings) {
                result.findings = analysisResult.findings;
                result.metadata.confidence = analysisResult.confidence || 0.8;
                console.log(`✅ AI analysis completed with ${result.findings.length} findings`);
            }

        } catch (error) {
            console.error('❌ AI-enhanced security analysis failed:', error.message);
            result.metadata.fallbackUsed = true;
            
            // Fallback to enhanced traditional analysis
            const fallbackResult = await this.performEnhancedTraditionalAnalysis(projectPath, reviewType);
            result.findings = fallbackResult.findings || [];
        }

        return result;
    }

    async performAutomatedAISecurityAnalysis(projectPath, reviewType, selectedModel, apiClient) {
        try {
            // Get code context for AI analysis
            const codeContext = await this.buildSecurityAnalysisContext(projectPath);
            
            const securityPrompt = this.buildAISecurityPrompt(reviewType, codeContext);
            
            console.log(`🔍 Running automated AI security analysis with ${selectedModel.name}`);
            
            const response = await this.callProviderAPI(apiClient, {
                model: selectedModel.modelId,
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert security analyst. Analyze the provided code for security vulnerabilities, provide specific findings with severity levels, and suggest remediation strategies.'
                    },
                    {
                        role: 'user',
                        content: securityPrompt
                    }
                ],
                max_tokens: 8000,
                temperature: 0.1 // Low temperature for consistent security analysis
            });

            const findings = this.parseAISecurityResponse(response.content, projectPath);
            
            return {
                findings,
                confidence: 0.9, // High confidence for automated AI analysis
                tokensUsed: response.usage?.total_tokens || 0,
                cost: this.calculateActualCost(response.usage, selectedModel),
                analysisType: 'automated_ai'
            };

        } catch (error) {
            console.error('Automated AI analysis failed:', error.message);
            throw error;
        }
    }

    async generateAISecurityAnalysisPrompt(projectPath, reviewType, selectedModel) {
        const codeContext = await this.buildSecurityAnalysisContext(projectPath);
        const prompt = this.buildAISecurityPrompt(reviewType, codeContext);
        
        console.log('\n🧠 AI Security Analysis Prompt for Claude Pro Max:');
        console.log('=' .repeat(70));
        console.log(prompt);
        console.log('=' .repeat(70));
        console.log('\n📋 Instructions:');
        console.log('1. Copy the above prompt to Claude Pro Max');
        console.log('2. Include relevant code files from the analysis');
        console.log('3. Review the AI-generated security findings');
        console.log('4. Implement recommended security improvements');

        return {
            findings: [{
                type: 'ai_analysis_manual',
                severity: 'info',
                message: 'AI security analysis prompt generated for manual execution',
                location: 'Claude Pro Max',
                recommendation: 'Execute analysis manually with provided prompt'
            }],
            confidence: null, // Depends on manual execution
            prompt: prompt,
            manual: true,
            analysisType: 'manual_ai_prompt'
        };
    }

    async performEnhancedTraditionalAnalysis(projectPath, reviewType) {
        // Enhanced version of traditional analysis with AI-inspired patterns
        const findings = [];
        
        try {
            console.log('🔧 Performing enhanced traditional security analysis...');
            
            // Apply AI-inspired analysis patterns without actual AI
            const enhancedPatterns = await this.applyAIInspiredPatterns(projectPath);
            findings.push(...enhancedPatterns);
            
            // Enhanced vulnerability detection using improved heuristics
            const enhancedVulns = await this.detectVulnerabilitiesWithEnhancedHeuristics(projectPath);
            findings.push(...enhancedVulns);
            
            // Context-aware security analysis
            const contextualFindings = await this.performContextAwareAnalysis(projectPath, reviewType);
            findings.push(...contextualFindings);

        } catch (error) {
            findings.push({
                type: 'enhanced_analysis_error',
                severity: 'medium',
                message: `Enhanced traditional analysis failed: ${error.message}`
            });
        }

        return {
            findings,
            confidence: 0.75, // Good confidence for enhanced traditional methods
            analysisType: 'enhanced_traditional'
        };
    }

    async buildSecurityAnalysisContext(projectPath) {
        const context = {
            architecture: 'serverless',
            framework: 'node.js',
            database: 'postgresql',
            authentication: 'aws_cognito',
            files: []
        };

        try {
            // Get critical security files for context
            const criticalFiles = [
                'src/backend/src/helpers/responseUtil.js',
                'src/backend/src/helpers/dbOperations.js',
                'src/backend/src/helpers/lambdaWrapper.js',
                'src/backend/src/helpers/errorHandler.js'
            ];

            for (const file of criticalFiles) {
                const filePath = path.join(projectPath, file);
                try {
                    const content = await fs.readFile(filePath, 'utf8');
                    context.files.push({
                        path: file,
                        content: content.length > 2000 ? content.substring(0, 2000) + '...' : content,
                        size: content.length
                    });
                } catch (error) {
                    // File doesn't exist, skip
                }
            }

        } catch (error) {
            console.warn('Failed to build complete security context:', error.message);
        }

        return context;
    }

    buildAISecurityPrompt(reviewType, codeContext) {
        let prompt = `
SECURITY ANALYSIS REQUEST

Analysis Type: ${reviewType}
Architecture: ${codeContext.architecture}
Technology Stack: ${codeContext.framework}, ${codeContext.database}, ${codeContext.authentication}

ANALYSIS OBJECTIVES:
1. Identify security vulnerabilities with specific severity ratings
2. Assess authentication and authorization implementation
3. Evaluate data protection and encryption usage
4. Review input validation and output encoding
5. Analyze error handling for information disclosure
6. Check for injection attack vectors
7. Assess session management and CORS configuration

CODE CONTEXT:
`;

        codeContext.files.forEach((file, index) => {
            prompt += `
File ${index + 1}: ${file.path}
\`\`\`javascript
${file.content}
\`\`\`
`;
        });

        prompt += `

REQUIRED OUTPUT FORMAT:
For each finding, provide:
- Type: (e.g., "sql_injection", "xss_vulnerability", "weak_authentication")
- Severity: ("critical", "high", "medium", "low")
- Location: (file and line reference if possible)
- Description: (detailed explanation of the vulnerability)
- Impact: (potential business/security impact)
- Recommendation: (specific remediation steps)
- Confidence: (your confidence level in this finding: 0.1-1.0)

Focus on actionable findings with clear remediation guidance.
Prioritize findings that could lead to data breaches or system compromise.
`;

        return prompt;
    }

    parseAISecurityResponse(aiResponse, projectPath) {
        const findings = [];
        
        try {
            // Parse AI response for structured security findings
            const lines = aiResponse.split('\n');
            let currentFinding = {};
            
            for (const line of lines) {
                const trimmed = line.trim();
                
                if (trimmed.startsWith('Type:')) {
                    if (currentFinding.type) {
                        findings.push(this.normalizeFinding(currentFinding, projectPath));
                    }
                    currentFinding = { type: trimmed.substring(5).trim() };
                } else if (trimmed.startsWith('Severity:')) {
                    currentFinding.severity = trimmed.substring(9).trim().toLowerCase();
                } else if (trimmed.startsWith('Location:')) {
                    currentFinding.location = trimmed.substring(9).trim();
                } else if (trimmed.startsWith('Description:')) {
                    currentFinding.message = trimmed.substring(12).trim();
                } else if (trimmed.startsWith('Recommendation:')) {
                    currentFinding.recommendation = trimmed.substring(15).trim();
                } else if (trimmed.startsWith('Confidence:')) {
                    currentFinding.confidence = parseFloat(trimmed.substring(11).trim()) || 0.7;
                }
            }
            
            // Add the last finding
            if (currentFinding.type) {
                findings.push(this.normalizeFinding(currentFinding, projectPath));
            }

        } catch (error) {
            console.warn('Failed to parse AI security response, using fallback parsing:', error.message);
            
            // Fallback: extract basic patterns from the response
            const vulnerabilityKeywords = ['vulnerability', 'security issue', 'risk', 'weakness', 'exploit'];
            const severityKeywords = ['critical', 'high', 'medium', 'low'];
            
            for (const keyword of vulnerabilityKeywords) {
                if (aiResponse.toLowerCase().includes(keyword)) {
                    const severity = severityKeywords.find(s => aiResponse.toLowerCase().includes(s)) || 'medium';
                    findings.push({
                        type: 'ai_detected_issue',
                        severity,
                        message: `AI detected potential security issue related to: ${keyword}`,
                        location: projectPath,
                        recommendation: 'Review AI analysis output for detailed recommendations',
                        confidence: 0.6,
                        source: 'ai_analysis'
                    });
                }
            }
        }

        return findings;
    }

    normalizeFinding(finding, projectPath) {
        return {
            type: finding.type || 'ai_security_finding',
            severity: this.normalizeSeverity(finding.severity),
            message: finding.message || 'AI-detected security issue',
            location: finding.location || projectPath,
            recommendation: finding.recommendation || 'Review and address the identified security concern',
            confidence: finding.confidence || 0.7,
            source: 'ai_analysis'
        };
    }

    normalizeSeverity(severity) {
        if (!severity) return 'medium';
        const normalized = severity.toLowerCase();
        if (['critical', 'high', 'medium', 'low'].includes(normalized)) {
            return normalized;
        }
        // Map common variations
        if (normalized.includes('crit')) return 'critical';
        if (normalized.includes('sev')) return 'high';
        return 'medium';
    }

    async performIntelligentRiskAssessment(findings, systemMetrics) {
        const riskAssessment = {
            overallRisk: 'low',
            riskFactors: [],
            mitigationStrategies: [],
            businessImpact: {},
            intelligentAnalysis: {
                contextualFactors: [],
                predictiveInsights: [],
                prioritizedActions: []
            }
        };

        try {
            // Enhanced risk scoring with AI-inspired logic
            const aiFindings = findings.filter(f => f.source === 'ai_analysis');
            const traditionalFindings = findings.filter(f => f.source !== 'ai_analysis');
            
            const criticalCount = findings.filter(f => f.severity === 'critical').length;
            const highCount = findings.filter(f => f.severity === 'high').length;
            const mediumCount = findings.filter(f => f.severity === 'medium').length;

            // Intelligent contextual risk assessment
            const contextualRisk = await this.assessContextualRisk(findings, systemMetrics);
            riskAssessment.intelligentAnalysis.contextualFactors = contextualRisk.factors;

            // Overall risk calculation with AI insights
            let riskScore = 0;
            if (criticalCount > 0) riskScore += criticalCount * 10;
            if (highCount > 0) riskScore += highCount * 5;
            if (mediumCount > 0) riskScore += mediumCount * 2;
            
            // Adjust for AI confidence
            if (aiFindings.length > 0) {
                const avgConfidence = aiFindings.reduce((sum, f) => sum + (f.confidence || 0.7), 0) / aiFindings.length;
                riskScore *= avgConfidence;
            }

            // Contextual adjustments
            if (systemMetrics.environmentType === 'production') riskScore *= 1.5;
            if (systemMetrics.userCount === 'enterprise') riskScore *= 2.0;

            if (riskScore > 15) riskAssessment.overallRisk = 'critical';
            else if (riskScore > 8) riskAssessment.overallRisk = 'high';
            else if (riskScore > 3) riskAssessment.overallRisk = 'medium';
            else riskAssessment.overallRisk = 'low';

            // Generate intelligent mitigation strategies
            riskAssessment.intelligentAnalysis.mitigationStrategies = this.generateIntelligentMitigationStrategies(findings, systemMetrics);
            
            // Predictive insights
            riskAssessment.intelligentAnalysis.predictiveInsights = this.generatePredictiveInsights(findings, systemMetrics);

        } catch (error) {
            riskAssessment.error = `Intelligent risk assessment failed: ${error.message}`;
        }

        return riskAssessment;
    }

    async assessContextualRisk(findings, systemMetrics) {
        const factors = [];
        
        // System maturity factor
        if (systemMetrics.lambdaCount > 50) {
            factors.push('Complex system with high attack surface');
        }
        
        // Data sensitivity factor
        const dataRelatedFindings = findings.filter(f => 
            f.type.includes('data') || f.type.includes('pii') || f.type.includes('encryption')
        );
        if (dataRelatedFindings.length > 0) {
            factors.push('Data protection concerns identified');
        }
        
        // Infrastructure security factor
        if (systemMetrics.architecture === 'serverless_arm64') {
            factors.push('Serverless architecture provides built-in isolation benefits');
        }
        
        return { factors };
    }

    generateIntelligentMitigationStrategies(findings, systemMetrics) {
        const strategies = [];
        
        // Group findings by category for intelligent grouping
        const findingsByType = {};
        findings.forEach(f => {
            const category = this.categorizeSecurityFinding(f.type);
            if (!findingsByType[category]) findingsByType[category] = [];
            findingsByType[category].push(f);
        });

        // Generate category-specific strategies
        Object.entries(findingsByType).forEach(([category, categoryFindings]) => {
            const strategy = this.generateCategoryMitigationStrategy(category, categoryFindings, systemMetrics);
            if (strategy) strategies.push(strategy);
        });

        return strategies;
    }

    categorizeSecurityFinding(findingType) {
        if (findingType.includes('auth')) return 'authentication';
        if (findingType.includes('sql') || findingType.includes('injection')) return 'injection';
        if (findingType.includes('xss') || findingType.includes('script')) return 'xss';
        if (findingType.includes('data') || findingType.includes('pii')) return 'data_protection';
        if (findingType.includes('cors') || findingType.includes('origin')) return 'cors';
        if (findingType.includes('log') || findingType.includes('console')) return 'logging';
        return 'general';
    }

    generateCategoryMitigationStrategy(category, findings, systemMetrics) {
        const strategies = {
            authentication: {
                title: 'Strengthen Authentication Framework',
                actions: ['Implement MFA', 'Add JWT validation', 'Review session management'],
                priority: 'high'
            },
            injection: {
                title: 'Implement Input Validation Framework',
                actions: ['Use parameterized queries', 'Add input sanitization', 'Implement schema validation'],
                priority: 'critical'
            },
            xss: {
                title: 'Enhance Output Encoding',
                actions: ['Implement content security policy', 'Add output encoding', 'Review HTML rendering'],
                priority: 'high'
            },
            data_protection: {
                title: 'Improve Data Protection Controls',
                actions: ['Review encryption at rest', 'Add data classification', 'Implement access logging'],
                priority: 'high'
            },
            cors: {
                title: 'Secure CORS Configuration',
                actions: ['Restrict origins to specific domains', 'Review preflight handling', 'Add CORS testing'],
                priority: 'medium'
            },
            logging: {
                title: 'Implement Secure Logging',
                actions: ['Replace console.log with secure logger', 'Add log sanitization', 'Review log retention'],
                priority: 'medium'
            }
        };

        return strategies[category] || null;
    }

    generatePredictiveInsights(findings, systemMetrics) {
        const insights = [];

        // Trend analysis
        const criticalFindings = findings.filter(f => f.severity === 'critical');
        if (criticalFindings.length > 2) {
            insights.push('Critical findings trend suggests systematic security gaps requiring architecture review');
        }

        // Growth implications
        if (systemMetrics.environmentType === 'sandbox' && systemMetrics.userCount === 'pilot_testing') {
            insights.push('Current security posture may not scale with user growth - plan enhanced controls');
        }

        // Technology-specific insights
        if (systemMetrics.architecture === 'serverless_arm64') {
            insights.push('ARM64 serverless architecture reduces attack surface but requires specific security patterns');
        }

        return insights;
    }

    async generateIntelligentRecommendations(review) {
        // Use the existing generateRecommendations but enhance with AI insights
        const baseRecommendations = await this.generateRecommendations(review);
        
        // Add AI-specific recommendations if AI analysis was used
        if (review.aiAnalysis.used && !review.aiAnalysis.fallbackUsed) {
            baseRecommendations.push({
                priority: 'low',
                category: 'ai_enhancement',
                title: 'AI-Enhanced Security Analysis Active',
                description: `AI analysis using ${review.aiAnalysis.model} identified additional security patterns`,
                estimatedCost: 0,
                timeframe: 'ongoing',
                aiInsight: true
            });
        }

        return baseRecommendations;
    }

    // Enhanced traditional analysis methods with AI-inspired patterns
    async applyAIInspiredPatterns(projectPath) {
        const findings = [];
        
        try {
            // Pattern 1: Context-aware secret detection
            const contextualSecrets = await this.detectSecretsWithContext(projectPath);
            findings.push(...contextualSecrets);
            
            // Pattern 2: Flow analysis for authorization
            const authFlowIssues = await this.analyzeAuthorizationFlows(projectPath);
            findings.push(...authFlowIssues);
            
            // Pattern 3: Data flow tracking
            const dataFlowIssues = await this.trackDataFlowVulnerabilities(projectPath);
            findings.push(...dataFlowIssues);

        } catch (error) {
            console.warn('AI-inspired pattern analysis failed:', error.message);
        }

        return findings;
    }

    async detectSecretsWithContext(projectPath) {
        // Enhanced secret detection with context awareness
        const findings = [];
        const files = await this.getJavaScriptFiles(projectPath);
        
        for (const file of files) {
            try {
                const content = await fs.readFile(file, 'utf8');
                const isTestFile = file.includes('/test') || file.includes('test_') || file.includes('.test.');
                const isConfigFile = file.includes('config') || file.includes('.env');
                
                // Context-aware secret patterns
                const secretPatterns = [
                    { pattern: /['"]([A-Za-z0-9+/]{20,})['"]/, type: 'potential_key', severity: isTestFile ? 'low' : 'high' },
                    { pattern: /password\s*[:=]\s*['"]([^'"]+)['"]/, type: 'hardcoded_password', severity: isTestFile ? 'medium' : 'critical' },
                    { pattern: /api[_-]?key\s*[:=]\s*['"]([^'"]+)['"]/, type: 'api_key', severity: isTestFile ? 'medium' : 'critical' }
                ];
                
                for (const { pattern, type, severity } of secretPatterns) {
                    const matches = content.match(pattern);
                    if (matches) {
                        findings.push({
                            type: type,
                            severity: severity,
                            message: `${type.replace('_', ' ')} detected in ${isTestFile ? 'test' : 'production'} code`,
                            location: path.relative(projectPath, file),
                            recommendation: isTestFile ? 'Use test fixtures or environment variables' : 'Move to secure configuration management',
                            confidence: isConfigFile ? 0.9 : 0.7,
                            source: 'enhanced_traditional'
                        });
                    }
                }
                
            } catch (error) {
                // Skip unreadable files
            }
        }
        
        return findings;
    }

    async detectVulnerabilitiesWithEnhancedHeuristics(projectPath) {
        const findings = [];
        const files = await this.getJavaScriptFiles(projectPath);
        
        for (const file of files) {
            try {
                const content = await fs.readFile(file, 'utf8');
                const relativePath = path.relative(projectPath, file);
                
                // Enhanced SQL injection detection
                if (content.includes('query') && content.includes('${') && !content.includes('$1')) {
                    const severity = file.includes('handler') ? 'critical' : 'high';
                    findings.push({
                        type: 'sql_injection_risk',
                        severity,
                        message: 'String interpolation in SQL query detected',
                        location: relativePath,
                        recommendation: 'Use parameterized queries with $1, $2 placeholders',
                        confidence: 0.8,
                        source: 'enhanced_traditional'
                    });
                }
                
                // Enhanced XSS detection
                if ((content.includes('innerHTML') || content.includes('dangerouslySetInnerHTML')) && 
                    !content.includes('sanitize') && !content.includes('escape')) {
                    findings.push({
                        type: 'xss_vulnerability',
                        severity: 'high',
                        message: 'Unsafe HTML rendering without sanitization',
                        location: relativePath,
                        recommendation: 'Use DOMPurify or similar sanitization library',
                        confidence: 0.9,
                        source: 'enhanced_traditional'
                    });
                }
                
            } catch (error) {
                // Skip unreadable files
            }
        }
        
        return findings;
    }

    async performContextAwareAnalysis(projectPath, reviewType) {
        const findings = [];
        
        // Context-aware analysis based on review type
        if (reviewType === 'comprehensive' || reviewType === 'vulnerability_scan') {
            // Deep analysis for comprehensive reviews
            const deepFindings = await this.performDeepSecurityAnalysis(projectPath);
            findings.push(...deepFindings);
        }
        
        if (reviewType === 'compliance_check') {
            // Compliance-focused analysis
            const complianceFindings = await this.performComplianceAnalysis(projectPath);
            findings.push(...complianceFindings);
        }
        
        return findings;
    }

    async performDeepSecurityAnalysis(projectPath) {
        const findings = [];
        
        try {
            // Check for security middleware usage
            const middlewareFindings = await this.analyzeSecurityMiddleware(projectPath);
            findings.push(...middlewareFindings);
            
            // Check for proper error handling
            const errorHandlingFindings = await this.analyzeErrorHandlingSecurity(projectPath);
            findings.push(...errorHandlingFindings);
            
        } catch (error) {
            console.warn('Deep security analysis failed:', error.message);
        }
        
        return findings;
    }

    async performComplianceAnalysis(projectPath) {
        const findings = [];
        
        try {
            // Check for GDPR compliance patterns
            const gdprFindings = await this.checkGDPRCompliance(projectPath);
            findings.push(...gdprFindings);
            
            // Check for audit logging
            const auditFindings = await this.checkAuditLogging(projectPath);
            findings.push(...auditFindings);
            
        } catch (error) {
            console.warn('Compliance analysis failed:', error.message);
        }
        
        return findings;
    }

    async analyzeSecurityMiddleware(projectPath) {
        // Implementation for security middleware analysis
        return [];
    }

    async analyzeErrorHandlingSecurity(projectPath) {
        // Implementation for error handling security analysis
        return [];
    }

    async checkGDPRCompliance(projectPath) {
        // Implementation for GDPR compliance checking
        return [];
    }

    async checkAuditLogging(projectPath) {
        // Implementation for audit logging checks
        return [];
    }

    async analyzeAuthorizationFlows(projectPath) {
        // Implementation for authorization flow analysis
        return [];
    }

    async trackDataFlowVulnerabilities(projectPath) {
        // Implementation for data flow vulnerability tracking
        return [];
    }

    async assessProductionReadiness(projectPath) {
        const status = {
            requiredComponents: {},
            securityFrameworks: {},
            complianceLevel: 'unknown',
            productionGates: {},
            costThreshold: 'unknown'
        };
        
        try {
            // Check for required security components
            const components = [
                'src/backend/src/helpers/secureLogger.js',
                'src/backend/src/helpers/environmentValidator.js',
                'src/backend/src/helpers/corsConfig.js',
                'src/backend/src/helpers/sslValidator.js',
                'SECURITY_HARDENING_DOCUMENTATION.md',
                'scripts/security-rollback.sh'
            ];
            
            for (const component of components) {
                const filePath = path.join(projectPath, component);
                try {
                    await fs.access(filePath);
                    status.requiredComponents[component] = 'present';
                } catch {
                    status.requiredComponents[component] = 'missing';
                }
            }
            
            // Determine compliance level based on implemented controls
            const implementedControls = Object.values(status.requiredComponents)
                .filter(status => status === 'present').length;
            
            if (implementedControls >= 5) {
                status.complianceLevel = 'enhanced';
            } else if (implementedControls >= 3) {
                status.complianceLevel = 'basic';
            } else {
                status.complianceLevel = 'insufficient';
            }
            
            // Check production gates
            status.productionGates = {
                securityValidation: implementedControls >= 4 ? 'ready' : 'not_ready',
                monitoringSetup: 'requires_verification',
                incidentResponse: implementedControls >= 5 ? 'ready' : 'not_ready',
                backupProcedures: 'requires_verification'
            };
            
            // Compliance level determined based on implemented controls
            
        } catch (error) {
            status.error = `Production readiness assessment failed: ${error.message}`;
        }
        
        return status;
    }

    async analyzeCostImplications(findings, systemMetrics = {}) {
        const analysis = {
            securityCosts: {},
            remediationCosts: {},
            riskCosts: {},
            infrastructureCosts: {},
            recommendations: []
        };
        
        try {
            // Calculate costs based on findings severity
            const criticalFindings = findings.filter(f => f.severity === 'critical').length;
            const highFindings = findings.filter(f => f.severity === 'high').length;
            const mediumFindings = findings.filter(f => f.severity === 'medium').length;
            
            // Realistic serverless cost analysis
            const currentInfrastructureCost = systemMetrics.monthlyInfrastructureCost || 50;
            const architecture = systemMetrics.architecture || 'serverless_arm64';
            
            // Foundation level (built-in security costs)
            const foundationSecurityCost = 0; // Security is built into serverless architecture
            
            // Enhanced level (minimal additional costs)
            const enhancedSecurityCost = architecture === 'serverless_arm64' ? 10 : 15;
            
            // Advanced level (proportional to actual usage)
            const advancedSecurityCost = Math.max(currentInfrastructureCost * 0.3, 25);
            
            // Enterprise level (only at real scale)
            const enterpriseSecurityCost = Math.max(currentInfrastructureCost * 0.8, 100);
            
            analysis.infrastructureCosts = {
                current: currentInfrastructureCost,
                foundation: currentInfrastructureCost + foundationSecurityCost,
                enhanced: currentInfrastructureCost + enhancedSecurityCost,
                advanced: currentInfrastructureCost + advancedSecurityCost,
                enterprise: currentInfrastructureCost + enterpriseSecurityCost
            };
            
            // Realistic remediation costs (not enterprise assumptions)
            analysis.remediationCosts = {
                immediate: criticalFindings * 500 + highFindings * 100, // Much more realistic
                shortTerm: mediumFindings * 50,
                ongoing: Math.max(currentInfrastructureCost * 0.1, 5) // 10% of infrastructure cost
            };
            
            // Risk-based cost analysis proportional to system value
            const systemValue = systemMetrics.monthlyRevenue || (currentInfrastructureCost * 10);
            analysis.riskCosts = {
                dataBreachRisk: criticalFindings > 0 ? systemValue * 2 : systemValue * 0.1,
                complianceRisk: highFindings > 0 ? systemValue * 0.5 : systemValue * 0.05,
                reputationRisk: (criticalFindings + highFindings) * systemValue * 0.1
            };
            
            // Generate realistic recommendations based on actual costs
            const totalRisk = analysis.riskCosts.dataBreachRisk + 
                            analysis.riskCosts.complianceRisk + 
                            analysis.riskCosts.reputationRisk;
            
            const currentSecurityCost = analysis.infrastructureCosts.foundation;
            const riskToSecurityRatio = totalRisk / currentSecurityCost;
            
            if (riskToSecurityRatio > 10 && criticalFindings > 0) {
                analysis.recommendations.push('Address critical findings immediately');
                analysis.recommendations.push('Consider enhanced security level if cost-justified');
            } else if (riskToSecurityRatio > 5 && totalRisk > 1000) {
                analysis.recommendations.push('Enhanced security controls may be justified');
                analysis.recommendations.push('Monitor growth metrics for security triggers');
            } else {
                analysis.recommendations.push('Current security posture appears cost-appropriate');
                analysis.recommendations.push('Continue with foundation-level security');
            }
            
            // Add serverless-specific recommendations
            if (architecture === 'serverless_arm64') {
                analysis.recommendations.push('ARM64 architecture provides cost-effective security baseline');
                analysis.recommendations.push('Leverage built-in AWS security features before adding premium services');
            }
            
        } catch (error) {
            analysis.error = `Cost analysis failed: ${error.message}`;
        }
        
        return analysis;
    }

    async generateRecommendations(review) {
        const recommendations = [];
        
        try {
            const systemMetrics = review.systemMetrics || {};
            const currentCost = systemMetrics.monthlyInfrastructureCost || 50;
            const architecture = systemMetrics.architecture || 'serverless_arm64';
            
            // Based on compliance level
            if (review.complianceStatus.complianceLevel === 'insufficient') {
                recommendations.push({
                    priority: 'critical',
                    category: 'basic_security',
                    title: 'Implement Basic Security Framework',
                    description: 'Deploy secure logging, environment validation, and CORS configuration',
                    estimatedCost: Math.min(currentCost * 0.5, 500), // Proportional to system size
                    timeframe: '1-2 weeks'
                });
            }
            
            // Based on findings (realistic costs)
            const criticalFindings = review.findings.filter(f => f.severity === 'critical');
            if (criticalFindings.length > 0) {
                recommendations.push({
                    priority: 'critical',
                    category: 'vulnerability_remediation',
                    title: 'Address Critical Security Vulnerabilities',
                    description: `Resolve ${criticalFindings.length} critical security issues`,
                    estimatedCost: criticalFindings.length * 200, // Realistic for serverless fixes
                    timeframe: 'immediate'
                });
            }
            
            // Progressive security level recommendations
            const infrastructureCosts = review.costAnalysis.infrastructureCosts || {};
            const currentSecurityCost = infrastructureCosts.current || currentCost;
            const enhancedCost = infrastructureCosts.enhanced || (currentCost + 10);
            
            // Only recommend enhancement if justified by system growth
            if (systemMetrics.userCount === 'pilot_testing' && 
                systemMetrics.environmentType === 'sandbox') {
                recommendations.push({
                    priority: 'medium',
                    category: 'progressive_security',
                    title: 'Monitor for Enhanced Security Triggers',
                    description: 'Watch for 10+ companies or 100+ users to trigger enhanced security level',
                    estimatedCost: enhancedCost - currentSecurityCost,
                    timeframe: 'when_triggered'
                });
            }
            
            // ARM64-specific recommendations
            if (architecture === 'serverless_arm64') {
                recommendations.push({
                    priority: 'low',
                    category: 'optimization',
                    title: 'Leverage ARM64 Security Benefits',
                    description: 'Continue using ARM64 for 20% cost savings on security compute',
                    estimatedCost: 0, // Already implemented
                    timeframe: 'ongoing'
                });
            }
            
            // Realistic validation recommendation
            recommendations.push({
                priority: 'medium',
                category: 'continuous_security',
                title: 'Automated Security Validation',
                description: 'Run security validation script regularly in CI/CD pipeline',
                estimatedCost: 10, // Realistic CI/CD integration cost
                timeframe: '1 day'
            });
            
            // Cost-aware enterprise recommendation
            if (review.costAnalysis.riskCosts?.dataBreachRisk > currentCost * 20) {
                recommendations.push({
                    priority: 'high',
                    category: 'risk_mitigation',
                    title: 'Consider Enhanced Security Level',
                    description: 'Risk exposure justifies enhanced security controls',
                    estimatedCost: enhancedCost - currentSecurityCost,
                    timeframe: '1 month'
                });
            } else {
                recommendations.push({
                    priority: 'low',
                    category: 'security_posture',
                    title: 'Current Security Level Appropriate',
                    description: `Foundation level security suits current ${systemMetrics.userCount} usage`,
                    estimatedCost: 0,
                    timeframe: 'ongoing'
                });
            }
            
        } catch (error) {
            recommendations.push({
                priority: 'high',
                category: 'error_handling',
                title: 'Security Analysis Error',
                description: `Address security analysis issues: ${error.message}`,
                estimatedCost: 100, // Realistic debugging cost
                timeframe: '1 week'
            });
        }
        
        return recommendations;
    }

    async getJavaScriptFiles(directory) {
        const files = [];
        
        try {
            const entries = await fs.readdir(directory, { withFileTypes: true });
            
            for (const entry of entries) {
                const fullPath = path.join(directory, entry.name);
                
                if (entry.isDirectory() && !entry.name.startsWith('.') && 
                    entry.name !== 'node_modules') {
                    files.push(...await this.getJavaScriptFiles(fullPath));
                } else if (entry.name.endsWith('.js') || entry.name.endsWith('.ts')) {
                    files.push(fullPath);
                }
            }
        } catch (error) {
            // Directory might not exist or be accessible
        }
        
        return files;
    }

    // Additional helper methods for specific security checks
    async scanCORSConfiguration(projectPath) {
        const findings = [];
        
        try {
            const corsConfigPath = path.join(projectPath, 'src/backend/src/helpers/corsConfig.js');
            const content = await fs.readFile(corsConfigPath, 'utf8');
            
            if (content.includes("'*'") && content.includes('CORS_ORIGINS')) {
                findings.push({
                    type: 'cors_wildcard',
                    severity: 'medium',
                    message: 'Wildcard CORS origins detected in configuration',
                    location: corsConfigPath,
                    recommendation: 'Use specific domain origins for production'
                });
            }
        } catch (error) {
            findings.push({
                type: 'cors_config_missing',
                severity: 'high',
                message: 'CORS configuration file not found',
                recommendation: 'Implement CORS configuration helper'
            });
        }
        
        return findings;
    }

    async scanTLSConfiguration(projectPath) {
        const findings = [];
        
        try {
            const sslValidatorPath = path.join(projectPath, 'src/backend/src/helpers/sslValidator.js');
            const content = await fs.readFile(sslValidatorPath, 'utf8');
            
            if (!content.includes('TLSv1.2')) {
                findings.push({
                    type: 'weak_tls',
                    severity: 'high',
                    message: 'Minimum TLS version not enforced',
                    location: sslValidatorPath,
                    recommendation: 'Enforce TLS 1.2 or higher'
                });
            }
        } catch (error) {
            findings.push({
                type: 'ssl_validator_missing',
                severity: 'high',
                message: 'SSL/TLS validator not found',
                recommendation: 'Implement SSL/TLS validation framework'
            });
        }
        
        return findings;
    }

    async assessSecurityRisks(findings) {
        const riskAssessment = {
            overallRisk: 'low',
            riskFactors: [],
            mitigationStrategies: [],
            businessImpact: {}
        };
        
        try {
            const criticalCount = findings.filter(f => f.severity === 'critical').length;
            const highCount = findings.filter(f => f.severity === 'high').length;
            
            if (criticalCount > 0) {
                riskAssessment.overallRisk = 'critical';
                riskAssessment.riskFactors.push('Critical vulnerabilities present');
            } else if (highCount > 2) {
                riskAssessment.overallRisk = 'high';
                riskAssessment.riskFactors.push('Multiple high-severity issues');
            } else if (highCount > 0) {
                riskAssessment.overallRisk = 'medium';
                riskAssessment.riskFactors.push('High-severity issues present');
            }
            
            // Business impact assessment
            riskAssessment.businessImpact = {
                dataBreachProbability: criticalCount > 0 ? 'high' : 'low',
                complianceRisk: highCount > 0 ? 'medium' : 'low',
                operationalImpact: (criticalCount + highCount) > 5 ? 'high' : 'low',
                reputationalRisk: criticalCount > 0 ? 'high' : 'low'
            };
            
        } catch (error) {
            riskAssessment.error = `Risk assessment failed: ${error.message}`;
        }
        
        return riskAssessment;
    }

    // Real security scanning implementations
    async scanAuthenticationPatterns(projectPath) {
        const findings = [];
        const jsFiles = await this.getJavaScriptFiles(projectPath);
        
        for (const file of jsFiles) {
            try {
                const content = await fs.readFile(file, 'utf8');
                
                // Check for hardcoded credentials
                if (content.match(/(password|pwd|secret|key)\s*[=:]\s*["'][^"']+["']/i)) {
                    findings.push({
                        type: 'hardcoded_credentials',
                        severity: 'critical',
                        file: path.relative(projectPath, file),
                        message: 'Potential hardcoded credentials found',
                        recommendation: 'Use environment variables or AWS Secrets Manager'
                    });
                }
                
                // Check for weak JWT handling
                if (content.includes('jwt') && !content.includes('verify')) {
                    findings.push({
                        type: 'weak_jwt_validation',
                        severity: 'high',
                        file: path.relative(projectPath, file),
                        message: 'JWT usage without proper verification',
                        recommendation: 'Implement JWT signature verification'
                    });
                }
                
                // Check for missing authentication middleware
                if (content.includes('app.') && content.includes('router') && !content.includes('auth')) {
                    findings.push({
                        type: 'missing_auth_middleware',
                        severity: 'medium',
                        file: path.relative(projectPath, file),
                        message: 'Routes without authentication middleware',
                        recommendation: 'Add authentication middleware to protected routes'
                    });
                }
                
            } catch (error) {
                // Skip files that can't be read
            }
        }
        
        return findings;
    }

    async scanAuthorizationPatterns(projectPath) {
        const findings = [];
        const jsFiles = await this.getJavaScriptFiles(projectPath);
        
        for (const file of jsFiles) {
            try {
                const content = await fs.readFile(file, 'utf8');
                
                // Check for role-based access control
                if (content.includes('role') && !content.includes('hasPermission')) {
                    findings.push({
                        type: 'incomplete_rbac',
                        severity: 'medium',
                        file: path.relative(projectPath, file),
                        message: 'Role definitions without permission checks',
                        recommendation: 'Implement comprehensive RBAC with permission validation'
                    });
                }
                
                // Check for direct database access without authorization
                if (content.includes('executeQuery') && !content.includes('Company_ID')) {
                    findings.push({
                        type: 'missing_data_isolation',
                        severity: 'high',
                        file: path.relative(projectPath, file),
                        message: 'Database queries without tenant isolation',
                        recommendation: 'Add Company_ID filtering to all queries'
                    });
                }
                
            } catch (error) {
                // Skip files that can't be read
            }
        }
        
        return findings;
    }

    async scanDataProtectionPatterns(projectPath) {
        const findings = [];
        const jsFiles = await this.getJavaScriptFiles(projectPath);
        
        for (const file of jsFiles) {
            try {
                const content = await fs.readFile(file, 'utf8');
                
                // Check for PII in logs
                if (content.includes('console.log') && content.match(/(ssn|social|email|phone|address)/i)) {
                    findings.push({
                        type: 'pii_in_logs',
                        severity: 'high',
                        file: path.relative(projectPath, file),
                        message: 'Potential PII in log statements',
                        recommendation: 'Remove or mask PII from log outputs'
                    });
                }
                
                // Check for unencrypted sensitive data storage
                if (content.includes('password') && !content.includes('bcrypt') && !content.includes('hash')) {
                    findings.push({
                        type: 'unencrypted_passwords',
                        severity: 'critical',
                        file: path.relative(projectPath, file),
                        message: 'Password handling without encryption',
                        recommendation: 'Use bcrypt or similar for password hashing'
                    });
                }
                
                // Check for SQL injection vulnerabilities
                if (content.includes('query') && content.includes('${') && !content.includes('$1')) {
                    findings.push({
                        type: 'sql_injection_risk',
                        severity: 'critical',
                        file: path.relative(projectPath, file),
                        message: 'String interpolation in SQL queries',
                        recommendation: 'Use parameterized queries ($1, $2, etc.)'
                    });
                }
                
            } catch (error) {
                // Skip files that can't be read
            }
        }
        
        return findings;
    }

    async scanInputValidationPatterns(projectPath) {
        const findings = [];
        const jsFiles = await this.getJavaScriptFiles(projectPath);
        
        for (const file of jsFiles) {
            try {
                const content = await fs.readFile(file, 'utf8');
                
                // Check for missing input validation
                if (content.includes('requestBody') && !content.includes('validate') && !content.includes('schema')) {
                    findings.push({
                        type: 'missing_input_validation',
                        severity: 'medium',
                        file: path.relative(projectPath, file),
                        message: 'Request body processing without validation',
                        recommendation: 'Add input validation using schemas (Joi, Zod, etc.)'
                    });
                }
                
                // Check for XSS vulnerabilities
                if (content.includes('innerHTML') || content.includes('dangerouslySetInnerHTML')) {
                    findings.push({
                        type: 'xss_vulnerability',
                        severity: 'high',
                        file: path.relative(projectPath, file),
                        message: 'Potential XSS vulnerability in HTML rendering',
                        recommendation: 'Use safe HTML rendering or sanitization'
                    });
                }
                
                // Check for file upload without validation
                if (content.includes('upload') && !content.includes('mimetype') && !content.includes('size')) {
                    findings.push({
                        type: 'unsafe_file_upload',
                        severity: 'high',
                        file: path.relative(projectPath, file),
                        message: 'File upload without validation',
                        recommendation: 'Add file type and size validation'
                    });
                }
                
            } catch (error) {
                // Skip files that can't be read
            }
        }
        
        return findings;
    }
}

module.exports = SecurityReviewerAgent;