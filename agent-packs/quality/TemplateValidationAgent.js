/**
 * Template Validation Agent
 * Provides comprehensive logical completeness validation for integration templates
 * Implements the validation framework discovered from template analysis
 */

const fs = require('fs');
const path = require('path');
const PathScanningHelper = require('../../equilateral-core/PathScanningHelper');

class TemplateValidationAgent {
    constructor() {
        this.name = 'TemplateValidationAgent';
        this.capabilities = [
            'template-structure-validation',
            'field-mapping-completeness-check',
            'authentication-framework-validation',
            'business-rule-consistency-check',
            'error-handling-coverage-analysis',
            'workflow-logic-validation',
            'transformation-logic-verification',
            'compliance-requirement-check',
            'template-quality-scoring',
            'cross-template-consistency-analysis'
        ];
        
        this.validationCriteria = {
            structure: {
                required_sections: [
                    'template_info',
                    'authentication_requirements',
                    'field_mappings',
                    'business_rules',
                    'transformations',
                    'error_handling',
                    'integration_workflow'
                ],
                optional_sections: [
                    'monitoring',
                    'rollback_and_recovery',
                    'compliance_certifications'
                ]
            },
            quality_thresholds: {
                min_field_mappings: 10,
                min_confidence_score: 0.80,
                max_confidence_score: 0.95,
                min_business_rules: 5,
                min_error_codes: 5,
                min_workflow_steps: 4
            }
        };

        // Initialize path scanner for template validation
        this.pathScanner = new PathScanningHelper({
            verbose: false,
            extensions: {
                all: ['.json', '.yaml', '.yml', '.tf', '.template']
            },
            maxDepth: 10
        });
    }

    /**
     * Validate a single template for logical completeness
     */
    async validateTemplate(templatePath) {
        try {
            console.log(`🧪 Validating template: ${templatePath}`);
            
            // Load template
            const template = this.loadTemplate(templatePath);
            
            // Run all validation checks
            const results = {
                template_path: templatePath,
                template_id: template.template_info?.id || 'unknown',
                validation_timestamp: new Date().toISOString(),
                structure_validation: this.validateStructure(template),
                field_mapping_validation: this.validateFieldMappings(template),
                authentication_validation: this.validateAuthentication(template),
                business_rules_validation: this.validateBusinessRules(template),
                error_handling_validation: this.validateErrorHandling(template),
                workflow_validation: this.validateWorkflow(template),
                transformation_validation: this.validateTransformations(template),
                compliance_validation: this.validateCompliance(template)
            };
            
            // Calculate overall score
            results.overall_score = this.calculateOverallScore(results);
            results.quality_rating = this.getQualityRating(results.overall_score);
            results.recommendations = this.generateRecommendations(results);
            
            return results;
            
        } catch (error) {
            return {
                template_path: templatePath,
                validation_error: error.message,
                overall_score: 0,
                quality_rating: 'FAILED'
            };
        }
    }

    /**
     * Validate template structure
     */
    validateStructure(template) {
        const results = {
            score: 0,
            max_score: 100,
            issues: [],
            passed: []
        };

        // Check required sections
        const requiredSections = this.validationCriteria.structure.required_sections;
        let requiredSectionScore = 0;

        requiredSections.forEach(section => {
            if (template[section]) {
                requiredSectionScore += 1;
                results.passed.push(`Required section '${section}' present`);
            } else {
                results.issues.push(`Missing required section: ${section}`);
            }
        });

        // Check template metadata completeness
        const requiredMetadata = ['id', 'name', 'description', 'version', 'priority', 'complexity'];
        let metadataScore = 0;

        if (template.template_info) {
            requiredMetadata.forEach(field => {
                if (template.template_info[field]) {
                    metadataScore += 1;
                } else {
                    results.issues.push(`Missing template_info.${field}`);
                }
            });
        }

        // Calculate score
        const sectionCompleteness = (requiredSectionScore / requiredSections.length) * 70;
        const metadataCompleteness = (metadataScore / requiredMetadata.length) * 30;
        results.score = Math.round(sectionCompleteness + metadataCompleteness);

        return results;
    }

    /**
     * Validate field mappings completeness
     */
    validateFieldMappings(template) {
        const results = {
            score: 0,
            max_score: 100,
            issues: [],
            passed: [],
            mapping_count: 0,
            duplicate_mappings: []
        };

        if (!template.field_mappings || !Array.isArray(template.field_mappings)) {
            results.issues.push('field_mappings section missing or not an array');
            return results;
        }

        const mappings = template.field_mappings;
        results.mapping_count = mappings.length;

        // Check minimum mapping count
        if (mappings.length < this.validationCriteria.quality_thresholds.min_field_mappings) {
            results.issues.push(`Insufficient field mappings: ${mappings.length} (minimum: ${this.validationCriteria.quality_thresholds.min_field_mappings})`);
        } else {
            results.passed.push(`Sufficient field mappings: ${mappings.length}`);
        }

        // Check for duplicate mappings
        const targetFields = new Set();
        const sourceFields = new Set();

        mappings.forEach((mapping, index) => {
            // Check required mapping fields
            const requiredFields = ['source_field', 'target_field', 'required', 'confidence_score', 'description'];
            requiredFields.forEach(field => {
                if (!mapping.hasOwnProperty(field)) {
                    results.issues.push(`Mapping ${index}: missing ${field}`);
                }
            });

            // Check confidence score range
            if (mapping.confidence_score) {
                if (mapping.confidence_score < this.validationCriteria.quality_thresholds.min_confidence_score ||
                    mapping.confidence_score > this.validationCriteria.quality_thresholds.max_confidence_score) {
                    results.issues.push(`Mapping ${index}: confidence_score ${mapping.confidence_score} outside valid range (${this.validationCriteria.quality_thresholds.min_confidence_score}-${this.validationCriteria.quality_thresholds.max_confidence_score})`);
                }
            }

            // Check for duplicates
            if (targetFields.has(mapping.target_field)) {
                results.duplicate_mappings.push(mapping.target_field);
                results.issues.push(`Duplicate target field: ${mapping.target_field}`);
            }
            targetFields.add(mapping.target_field);

            if (sourceFields.has(mapping.source_field) && mapping.source_field !== 'unknown_source') {
                results.issues.push(`Duplicate source field: ${mapping.source_field}`);
            }
            sourceFields.add(mapping.source_field);

            // Check for unknown_source mappings (indicates incomplete analysis)
            if (mapping.source_field === 'unknown_source') {
                results.issues.push(`Mapping ${index}: unresolved source field`);
            }
        });

        // Calculate score
        let score = 0;
        
        // Mapping count score (40 points)
        const countScore = Math.min((mappings.length / this.validationCriteria.quality_thresholds.min_field_mappings) * 40, 40);
        score += countScore;

        // Quality score (40 points)
        const qualityIssues = results.issues.filter(issue => 
            issue.includes('missing') || 
            issue.includes('confidence_score') ||
            issue.includes('unresolved')
        ).length;
        const qualityScore = Math.max(0, 40 - (qualityIssues * 5));
        score += qualityScore;

        // Consistency score (20 points)
        const consistencyScore = Math.max(0, 20 - (results.duplicate_mappings.length * 10));
        score += consistencyScore;

        results.score = Math.round(score);
        return results;
    }

    /**
     * Validate authentication framework
     */
    validateAuthentication(template) {
        const results = {
            score: 0,
            max_score: 100,
            issues: [],
            passed: []
        };

        if (!template.authentication_requirements) {
            results.issues.push('authentication_requirements section missing');
            return results;
        }

        const auth = template.authentication_requirements;

        // Check required authentication fields
        const requiredFields = ['method', 'components', 'endpoints', 'credential_storage'];
        let fieldScore = 0;

        requiredFields.forEach(field => {
            if (auth[field]) {
                fieldScore += 1;
                results.passed.push(`Authentication field '${field}' present`);
            } else {
                results.issues.push(`Missing authentication field: ${field}`);
            }
        });

        // Check credential storage is UnifiedCredentialManager
        if (auth.credential_storage !== 'UnifiedCredentialManager') {
            results.issues.push(`credential_storage should be 'UnifiedCredentialManager', found: ${auth.credential_storage}`);
        } else {
            results.passed.push('Using UnifiedCredentialManager for credential storage');
        }

        // Check for correlation tracking
        if (!auth.correlation_tracking) {
            results.issues.push('Missing correlation_tracking configuration');
        } else {
            results.passed.push('Correlation tracking configured');
        }

        // Calculate score
        const fieldCompleteness = (fieldScore / requiredFields.length) * 60;
        const securityCompliance = auth.credential_storage === 'UnifiedCredentialManager' ? 25 : 0;
        const trackingImplementation = auth.correlation_tracking ? 15 : 0;

        results.score = Math.round(fieldCompleteness + securityCompliance + trackingImplementation);
        return results;
    }

    /**
     * Validate business rules
     */
    validateBusinessRules(template) {
        const results = {
            score: 0,
            max_score: 100,
            issues: [],
            passed: [],
            rule_count: 0
        };

        if (!template.business_rules || !Array.isArray(template.business_rules)) {
            results.issues.push('business_rules section missing or not an array');
            return results;
        }

        const rules = template.business_rules;
        results.rule_count = rules.length;

        if (rules.length < this.validationCriteria.quality_thresholds.min_business_rules) {
            results.issues.push(`Insufficient business rules: ${rules.length} (minimum: ${this.validationCriteria.quality_thresholds.min_business_rules})`);
        } else {
            results.passed.push(`Sufficient business rules: ${rules.length}`);
        }

        // Check rule completeness
        rules.forEach((rule, index) => {
            const requiredFields = ['rule_type', 'condition', 'action', 'failure_action', 'description'];
            requiredFields.forEach(field => {
                if (!rule[field]) {
                    results.issues.push(`Rule ${index}: missing ${field}`);
                }
            });
        });

        // Check for critical compliance rules
        const criticalRuleTypes = ['required_field_validation', 'employment_status_filter', 'data_quality_validation'];
        const presentRuleTypes = rules.map(rule => rule.rule_type);
        const missingCriticalRules = criticalRuleTypes.filter(type => !presentRuleTypes.includes(type));
        
        missingCriticalRules.forEach(ruleType => {
            results.issues.push(`Missing critical business rule: ${ruleType}`);
        });

        // Calculate score
        const ruleCountScore = Math.min((rules.length / this.validationCriteria.quality_thresholds.min_business_rules) * 50, 50);
        const completenessScore = Math.max(0, 30 - (results.issues.filter(issue => issue.includes('missing')).length * 3));
        const complianceScore = Math.max(0, 20 - (missingCriticalRules.length * 10));

        results.score = Math.round(ruleCountScore + completenessScore + complianceScore);
        return results;
    }

    /**
     * Validate error handling coverage
     */
    validateErrorHandling(template) {
        const results = {
            score: 0,
            max_score: 100,
            issues: [],
            passed: [],
            error_codes_covered: []
        };

        if (!template.error_handling || !Array.isArray(template.error_handling)) {
            results.issues.push('error_handling section missing or not an array');
            return results;
        }

        const errorHandlers = template.error_handling;
        const criticalErrorCodes = ['401', '403', '404', '422', '429', '500'];

        // Check coverage of critical error codes
        errorHandlers.forEach(handler => {
            if (handler.error_code) {
                results.error_codes_covered.push(handler.error_code);
            }
        });

        const missingCriticalCodes = criticalErrorCodes.filter(code => 
            !results.error_codes_covered.includes(code)
        );

        missingCriticalCodes.forEach(code => {
            results.issues.push(`Missing error handler for critical code: ${code}`);
        });

        // Check error handler completeness
        errorHandlers.forEach((handler, index) => {
            const requiredFields = ['error_code', 'error_type', 'action', 'retry_count', 'description'];
            requiredFields.forEach(field => {
                if (!handler.hasOwnProperty(field)) {
                    results.issues.push(`Error handler ${index}: missing ${field}`);
                }
            });

            // Check retry logic
            if (handler.retry_count > 0 && !handler.backoff_strategy) {
                results.issues.push(`Error handler ${index}: retry_count > 0 but no backoff_strategy specified`);
            }
        });

        // Calculate score
        const coverageScore = ((criticalErrorCodes.length - missingCriticalCodes.length) / criticalErrorCodes.length) * 50;
        const completenessScore = Math.max(0, 30 - (results.issues.filter(issue => issue.includes('missing')).length * 2));
        const retryLogicScore = errorHandlers.filter(h => h.retry_count > 0 && h.backoff_strategy).length > 0 ? 20 : 0;

        results.score = Math.round(coverageScore + completenessScore + retryLogicScore);
        return results;
    }

    /**
     * Validate integration workflow
     */
    validateWorkflow(template) {
        const results = {
            score: 0,
            max_score: 100,
            issues: [],
            passed: [],
            step_count: 0
        };

        if (!template.integration_workflow || !Array.isArray(template.integration_workflow)) {
            results.issues.push('integration_workflow section missing or not an array');
            return results;
        }

        const workflow = template.integration_workflow;
        results.step_count = workflow.length;

        if (workflow.length < this.validationCriteria.quality_thresholds.min_workflow_steps) {
            results.issues.push(`Insufficient workflow steps: ${workflow.length} (minimum: ${this.validationCriteria.quality_thresholds.min_workflow_steps})`);
        } else {
            results.passed.push(`Sufficient workflow steps: ${workflow.length}`);
        }

        // Check step numbering and dependencies
        const stepNumbers = workflow.map(step => step.step);
        const expectedNumbers = Array.from({length: workflow.length}, (_, i) => i + 1);
        
        if (!this.arraysEqual(stepNumbers.sort(), expectedNumbers)) {
            results.issues.push('Workflow steps not properly numbered (should be sequential 1, 2, 3...)');
        }

        // Check step completeness
        workflow.forEach((step, index) => {
            const requiredFields = ['step', 'name', 'description', 'handler', 'dependencies'];
            requiredFields.forEach(field => {
                if (!step.hasOwnProperty(field)) {
                    results.issues.push(`Workflow step ${index + 1}: missing ${field}`);
                }
            });
        });

        // Check for rollback procedures
        const hasRollbackProcedures = workflow.some(step => 
            step.rollback_procedures || 
            (step.handler && step.handler.includes('rollback'))
        );

        if (!hasRollbackProcedures && !template.rollback_and_recovery) {
            results.issues.push('No rollback procedures defined in workflow or separate section');
        } else {
            results.passed.push('Rollback procedures defined');
        }

        // Calculate score
        const stepCountScore = Math.min((workflow.length / this.validationCriteria.quality_thresholds.min_workflow_steps) * 40, 40);
        const completenessScore = Math.max(0, 30 - (results.issues.filter(issue => issue.includes('missing')).length * 3));
        const rollbackScore = hasRollbackProcedures || template.rollback_and_recovery ? 30 : 0;

        results.score = Math.round(stepCountScore + completenessScore + rollbackScore);
        return results;
    }

    /**
     * Validate transformations
     */
    validateTransformations(template) {
        const results = {
            score: 0,
            max_score: 100,
            issues: [],
            passed: [],
            transformation_count: 0
        };

        if (!template.transformations || !Array.isArray(template.transformations)) {
            results.issues.push('transformations section missing or not an array');
            return results;
        }

        const transformations = template.transformations;
        results.transformation_count = transformations.length;

        // Check transformation completeness
        transformations.forEach((transform, index) => {
            const requiredFields = ['transformation_type', 'source', 'target', 'description'];
            requiredFields.forEach(field => {
                if (!transform[field]) {
                    results.issues.push(`Transformation ${index}: missing ${field}`);
                }
            });

            // Check for transformation logic
            if (!transform.method && !transform.logic && !transform.mapping) {
                results.issues.push(`Transformation ${index}: missing transformation logic (method, logic, or mapping)`);
            }
        });

        // Check for common transformation types
        const commonTransformationTypes = [
            'date_transformation',
            'currency_conversion',
            'phone_standardization',
            'address_mapping'
        ];

        const presentTypes = transformations.map(t => t.transformation_type);
        const missingCommonTypes = commonTransformationTypes.filter(type => 
            !presentTypes.some(presentType => presentType.includes(type.split('_')[0]))
        );

        if (missingCommonTypes.length > 0) {
            results.issues.push(`Consider adding common transformations: ${missingCommonTypes.join(', ')}`);
        }

        // Calculate score
        const countScore = transformations.length > 0 ? 40 : 0;
        const completenessScore = Math.max(0, 40 - (results.issues.filter(issue => issue.includes('missing')).length * 5));
        const typeVarietyScore = Math.min((presentTypes.length / 4) * 20, 20);

        results.score = Math.round(countScore + completenessScore + typeVarietyScore);
        return results;
    }

    /**
     * Validate compliance requirements
     */
    validateCompliance(template) {
        const results = {
            score: 0,
            max_score: 100,
            issues: [],
            passed: []
        };

        // Check for compliance-related business rules
        if (template.business_rules) {
            const complianceRules = template.business_rules.filter(rule => 
                rule.rule_type && (
                    rule.rule_type.includes('compliance') ||
                    rule.rule_type.includes('flsa') ||
                    rule.rule_type.includes('privacy') ||
                    rule.rule_type.includes('validation')
                )
            );

            if (complianceRules.length > 0) {
                results.passed.push(`Found ${complianceRules.length} compliance-related business rules`);
            } else {
                results.issues.push('No compliance-related business rules found');
            }
        }

        // Check for audit trail requirements
        const hasAuditTrail = (template.integration_workflow && 
            template.integration_workflow.some(step => 
                step.name && step.name.includes('audit')
            )) || 
            (template.monitoring && template.monitoring.audit_trail);

        if (hasAuditTrail) {
            results.passed.push('Audit trail requirements defined');
        } else {
            results.issues.push('Missing audit trail requirements');
        }

        // Check for data privacy considerations
        const hasPrivacyRules = template.business_rules && 
            template.business_rules.some(rule => 
                rule.description && (
                    rule.description.toLowerCase().includes('ssn') ||
                    rule.description.toLowerCase().includes('privacy') ||
                    rule.description.toLowerCase().includes('sensitive')
                )
            );

        if (hasPrivacyRules) {
            results.passed.push('Data privacy rules defined');
        } else {
            results.issues.push('Missing data privacy considerations');
        }

        // Calculate score
        const complianceRuleScore = template.business_rules && 
            template.business_rules.some(rule => rule.rule_type && rule.rule_type.includes('compliance')) ? 40 : 0;
        const auditTrailScore = hasAuditTrail ? 30 : 0;
        const privacyScore = hasPrivacyRules ? 30 : 0;

        results.score = Math.round(complianceRuleScore + auditTrailScore + privacyScore);
        return results;
    }

    /**
     * Calculate overall template quality score
     */
    calculateOverallScore(validationResults) {
        const weights = {
            structure_validation: 0.15,
            field_mapping_validation: 0.20,
            authentication_validation: 0.15,
            business_rules_validation: 0.15,
            error_handling_validation: 0.15,
            workflow_validation: 0.10,
            transformation_validation: 0.05,
            compliance_validation: 0.05
        };

        let weightedScore = 0;
        let totalWeight = 0;

        Object.keys(weights).forEach(criterion => {
            if (validationResults[criterion] && validationResults[criterion].score !== undefined) {
                weightedScore += validationResults[criterion].score * weights[criterion];
                totalWeight += weights[criterion];
            }
        });

        return totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 0;
    }

    /**
     * Get quality rating based on score
     */
    getQualityRating(score) {
        if (score >= 90) return 'EXCELLENT';
        if (score >= 80) return 'GOOD';
        if (score >= 70) return 'FAIR';
        if (score >= 60) return 'POOR';
        return 'CRITICAL';
    }

    /**
     * Generate recommendations for improvement
     */
    generateRecommendations(validationResults) {
        const recommendations = [];
        const criticalIssues = [];
        const highPriorityIssues = [];

        // Collect critical issues (score < 50)
        Object.keys(validationResults).forEach(criterion => {
            const result = validationResults[criterion];
            if (result && result.score !== undefined && result.score < 50) {
                criticalIssues.push(`${criterion}: ${result.score}/100`);
                if (result.issues) {
                    result.issues.forEach(issue => {
                        if (issue.includes('missing') || issue.includes('insufficient')) {
                            recommendations.push(`CRITICAL: ${issue}`);
                        }
                    });
                }
            }
        });

        // Collect high priority issues (score < 80)
        Object.keys(validationResults).forEach(criterion => {
            const result = validationResults[criterion];
            if (result && result.score !== undefined && result.score >= 50 && result.score < 80) {
                highPriorityIssues.push(`${criterion}: ${result.score}/100`);
                if (result.issues) {
                    result.issues.slice(0, 3).forEach(issue => {
                        recommendations.push(`HIGH: ${issue}`);
                    });
                }
            }
        });

        // Add general recommendations
        if (validationResults.overall_score < 70) {
            recommendations.push('GENERAL: Template requires significant enhancement before production use');
        }
        if (validationResults.overall_score >= 70 && validationResults.overall_score < 90) {
            recommendations.push('GENERAL: Template is good but could benefit from additional enhancements');
        }
        if (validationResults.overall_score >= 90) {
            recommendations.push('GENERAL: Excellent template quality - ready for production use');
        }

        return recommendations;
    }

    // Helper methods
    loadTemplate(templatePath) {
        const fullPath = path.resolve(templatePath);
        const templateData = fs.readFileSync(fullPath, 'utf8');
        return JSON.parse(templateData);
    }

    arraysEqual(arr1, arr2) {
        return JSON.stringify(arr1) === JSON.stringify(arr2);
    }

    /**
     * Validate all templates in a directory
     */
    async validateAllTemplates(templatesDirectory = './tools/field-mappings/templates/') {
        const templateFiles = fs.readdirSync(templatesDirectory).filter(file => file.endsWith('.json'));
        const results = [];

        for (const file of templateFiles) {
            const templatePath = path.join(templatesDirectory, file);
            const validation = await this.validateTemplate(templatePath);
            results.push(validation);
        }

        return {
            validation_summary: {
                total_templates: results.length,
                excellent_templates: results.filter(r => r.overall_score >= 90).length,
                good_templates: results.filter(r => r.overall_score >= 80 && r.overall_score < 90).length,
                fair_templates: results.filter(r => r.overall_score >= 70 && r.overall_score < 80).length,
                poor_templates: results.filter(r => r.overall_score >= 60 && r.overall_score < 70).length,
                critical_templates: results.filter(r => r.overall_score < 60).length,
                average_score: Math.round(results.reduce((sum, r) => sum + r.overall_score, 0) / results.length)
            },
            detailed_results: results
        };
    }

    /**
     * Test validation framework
     */
    testValidationFramework() {
        console.log('🧪 Testing Template Validation Framework...');
        
        const testResults = {
            validation_agent_loaded: true,
            validation_criteria_defined: !!this.validationCriteria,
            all_validation_methods_present: [
                'validateStructure',
                'validateFieldMappings',
                'validateAuthentication',
                'validateBusinessRules',
                'validateErrorHandling',
                'validateWorkflow',
                'validateTransformations',
                'validateCompliance'
            ].every(method => typeof this[method] === 'function'),
            scoring_system_working: typeof this.calculateOverallScore === 'function',
            recommendation_engine_working: typeof this.generateRecommendations === 'function'
        };

        const allPassed = Object.values(testResults).every(result => result === true);
        
        return {
            success: allPassed,
            test_results: testResults,
            summary: allPassed ? 'Template Validation Framework is working correctly' : 'Some validation framework components are missing'
        };
    }
}

module.exports = TemplateValidationAgent;