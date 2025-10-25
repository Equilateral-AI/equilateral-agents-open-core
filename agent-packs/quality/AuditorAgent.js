/**
 * Auditor/Enforcer Agent - Standards Compliance & Quality Assurance
 * 
 * Ensures code compliance with established patterns and deployment readiness
 * Validates handler patterns, helper dependencies, and architectural standards
 */

const fs = require('fs').promises;
const path = require('path');
const AgentConfiguration = require('../config/AgentConfiguration');
const PathScanningHelper = require('../../equilateral-core/PathScanningHelper');

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

class AuditorAgent {
    constructor(configOverrides = {}) {
        this.config = new AgentConfiguration(configOverrides);
        
        this.auditCategories = {
            'handler_compliance': {
                description: 'Validate Lambda handler patterns and import standards',
                standards: [
                    'handlers_only_import_from_current_directory',
                    'handlers_use_wrapHandler_pattern',
                    'handlers_include_required_helpers_in_zip',
                    'handlers_use_business_scoped_ids',
                    'handlers_implement_proper_error_handling'
                ]
            },
            'api_standards': {
                description: 'Validate API response patterns and field naming',
                standards: [
                    'api_responses_use_Records_array_wrapper',
                    'api_fields_use_exact_db_names',
                    'api_errors_use_APIErrorResponse_format',
                    'api_endpoints_defined_in_apiClient'
                ]
            },
            'frontend_patterns': {
                description: 'Validate React component and context patterns',
                standards: [
                    'components_use_flowbite_react',
                    'contexts_follow_layered_provider_pattern',
                    'components_implement_rbac_properly',
                    'error_states_designed_as_first_class'
                ]
            },
            'deployment_readiness': {
                description: 'Validate deployment package completeness',
                standards: [
                    'all_required_helpers_included_in_zip',
                    'environment_configs_properly_set',
                    'dependencies_correctly_resolved',
                    'no_missing_imports_or_references'
                ]
            }
        };

        this.violations = [];
        this.warnings = [];
        this.passed = [];

        // Initialize path scanner for code auditing
        this.pathScanner = new PathScanningHelper({
            verbose: configOverrides.verbose !== false,
            extensions: {
                all: ['.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.go', '.rs']
            },
            maxDepth: configOverrides.maxDepth || 10
        });
    }

    /**
     * Run comprehensive audit across all categories
     */
    async runFullAudit(targetDirectory = null) {
        try {
            // Use configuration system for target directory with fallback logic
            const auditTarget = targetDirectory || 
                               this.config.getTimComboPath() ||
                               this.config.getProjectPath();
            
            console.log(`🔍 Starting comprehensive code audit on: ${auditTarget}`);
            
            const auditResults = {};
            
            for (const [category, config] of Object.entries(this.auditCategories)) {
                console.log(`\n📋 Auditing ${category}: ${config.description}`);
                
                const categoryResults = await this.auditCategory(category, auditTarget);
                auditResults[category] = categoryResults;
                
                console.log(`  ✅ Passed: ${categoryResults.passed.length}`);
                console.log(`  ⚠️  Warnings: ${categoryResults.warnings.length}`);
                console.log(`  ❌ Violations: ${categoryResults.violations.length}`);
            }

            const summary = this.generateAuditSummary(auditResults);
            
            return createSuccessResponse(
                { auditResults, summary },
                'Audit completed successfully',
                {
                    total_categories: Object.keys(this.auditCategories).length,
                    total_violations: summary.totalViolations,
                    total_warnings: summary.totalWarnings,
                    compliance_score: summary.complianceScore,
                    target_directory: auditTarget,
                    timestamp: new Date().toISOString()
                }
            );

        } catch (error) {
            console.error('Audit failed:', error);
            return createErrorResponse(error.message, 'AUDIT_EXECUTION_ERROR');
        }
    }

    /**
     * Audit specific category with detailed checks
     */
    async auditCategory(category, targetDirectory) {
        const results = {
            passed: [],
            warnings: [],
            violations: []
        };

        switch (category) {
            case 'handler_compliance':
                await this.auditHandlerCompliance(targetDirectory, results);
                break;
            case 'api_standards':
                await this.auditAPIStandards(targetDirectory, results);
                break;
            case 'frontend_patterns':
                await this.auditFrontendPatterns(targetDirectory, results);
                break;
            case 'deployment_readiness':
                await this.auditDeploymentReadiness(targetDirectory, results);
                break;
        }

        return results;
    }

    /**
     * Audit Lambda handler compliance
     */
    async auditHandlerCompliance(targetDir, results) {
        const targetDirStr = typeof targetDir === 'string' ? targetDir : this.config.getProjectPath();
        const handlersDir = path.join(targetDirStr, this.config.get('handlersPath') || 'src/backend/src/handlers');
        
        try {
            const handlerFiles = await this.findHandlerFiles(handlersDir);
            
            for (const handlerFile of handlerFiles) {
                await this.auditSingleHandler(handlerFile, results);
            }
            
        } catch (error) {
            results.violations.push({
                rule: 'handlers_directory_accessible',
                file: handlersDir,
                message: `Cannot access handlers directory: ${error.message}`,
                suggestion: `Verify handlers path configuration or check if directory exists at: ${handlersDir}`
            });
        }
    }

    /**
     * Audit single handler file for compliance
     */
    async auditSingleHandler(handlerPath, results) {
        try {
            const content = await fs.readFile(handlerPath, 'utf8');
            const fileName = path.basename(handlerPath);
            
            // Check 1: Only imports from current directory (./)
            const importMatches = content.match(/require\(['"`]([^'"`]+)['"`]\)/g) || [];
            const externalImports = importMatches.filter(imp => {
                const modulePath = imp.match(/require\(['"`]([^'"`]+)['"`]\)/)[1];
                return !modulePath.startsWith('./') && !modulePath.startsWith('fs') && 
                       !modulePath.startsWith('path') && !modulePath.startsWith('crypto') &&
                       !modulePath.startsWith('util') && !modulePath.startsWith('stream');
            });

            if (externalImports.length > 0) {
                results.violations.push({
                    rule: 'handlers_only_import_from_current_directory',
                    file: fileName,
                    message: `Handler imports from outside current directory: ${externalImports.join(', ')}`,
                    details: { externalImports }
                });
            } else {
                results.passed.push({
                    rule: 'handlers_only_import_from_current_directory',
                    file: fileName,
                    message: 'Handler only imports from current directory'
                });
            }

            // Check 2: Uses wrapHandler pattern
            if (content.includes('wrapHandler(') && content.includes('exports.handler = wrapHandler(')) {
                results.passed.push({
                    rule: 'handlers_use_wrapHandler_pattern',
                    file: fileName,
                    message: 'Handler uses wrapHandler pattern correctly'
                });
            } else {
                results.violations.push({
                    rule: 'handlers_use_wrapHandler_pattern',
                    file: fileName,
                    message: 'Handler does not use wrapHandler pattern'
                });
            }

            // Check 3: Includes required helpers
            const requiredHelpers = ['wrapHandler', 'executeQuery', 'createSuccessResponse', 'handleError'];
            const missingHelpers = requiredHelpers.filter(helper => !content.includes(helper));
            
            if (missingHelpers.length > 0) {
                results.warnings.push({
                    rule: 'handlers_include_required_helpers',
                    file: fileName,
                    message: `Handler missing helper references: ${missingHelpers.join(', ')}`,
                    details: { missingHelpers }
                });
            } else {
                results.passed.push({
                    rule: 'handlers_include_required_helpers',
                    file: fileName,
                    message: 'Handler includes all required helpers'
                });
            }

            // Check 4: Uses business-scoped IDs
            if (content.includes('requestContext.requestId') || content.includes('Request_ID')) {
                results.passed.push({
                    rule: 'handlers_use_business_scoped_ids',
                    file: fileName,
                    message: 'Handler uses business-scoped ID patterns'
                });
            } else {
                results.warnings.push({
                    rule: 'handlers_use_business_scoped_ids',
                    file: fileName,
                    message: 'Handler may not be using business-scoped IDs'
                });
            }

            // Check 5: Proper error handling
            if (content.includes('try {') && content.includes('catch (error)') && content.includes('handleError(')) {
                results.passed.push({
                    rule: 'handlers_implement_proper_error_handling',
                    file: fileName,
                    message: 'Handler implements proper error handling'
                });
            } else {
                results.violations.push({
                    rule: 'handlers_implement_proper_error_handling',
                    file: fileName,
                    message: 'Handler missing proper error handling pattern'
                });
            }

        } catch (error) {
            results.violations.push({
                rule: 'handler_file_readable',
                file: path.basename(handlerPath),
                message: `Cannot read handler file: ${error.message}`
            });
        }
    }

    /**
     * Audit API standards compliance
     */
    async auditAPIStandards(targetDir, results) {
        // Use configurable API directory path
        const apiDir = path.join(targetDir, this.config.get('frontendApiPath') || 'src/frontend/src/api');
        
        try {
            const apiFiles = await this.findFilesRecursive(apiDir, '.ts');
            
            for (const apiFile of apiFiles) {
                await this.auditSingleAPIFile(apiFile, results);
            }
            
        } catch (error) {
            results.violations.push({
                rule: 'api_directory_accessible',
                file: apiDir,
                message: `Cannot access API directory: ${error.message}`,
                suggestion: `Check if API directory exists at: ${apiDir}`
            });
        }
    }

    /**
     * Audit single API file for standards compliance
     */
    async auditSingleAPIFile(apiPath, results) {
        try {
            const content = await fs.readFile(apiPath, 'utf8');
            const fileName = path.basename(apiPath);
            
            // Check 1: Uses Records array wrapper
            if (content.includes('response.data.Records') || content.includes('{ Records:')) {
                results.passed.push({
                    rule: 'api_responses_use_Records_array_wrapper',
                    file: fileName,
                    message: 'API responses use Records array wrapper'
                });
            } else if (content.includes('response.data') && !content.includes('Records')) {
                results.warnings.push({
                    rule: 'api_responses_use_Records_array_wrapper',
                    file: fileName,
                    message: 'API file may not be using Records array wrapper pattern'
                });
            }

            // Check 2: Uses PascalCase_With_Underscores field naming
            const fieldMatches = content.match(/['"]([\w_]+)['"]:\s*\w+/g) || [];
            const incorrectFieldNaming = fieldMatches.filter(field => {
                const fieldName = field.match(/['"]([\w_]+)['"]/)[1];
                return !this.isPascalCaseWithUnderscores(fieldName);
            });

            if (incorrectFieldNaming.length > 0) {
                results.warnings.push({
                    rule: 'api_fields_use_exact_db_names',
                    file: fileName,
                    message: `API may have incorrect field naming: ${incorrectFieldNaming.slice(0, 3).join(', ')}`,
                    details: { incorrectFields: incorrectFieldNaming }
                });
            }

        } catch (error) {
            results.violations.push({
                rule: 'api_file_readable',
                file: path.basename(apiPath),
                message: `Cannot read API file: ${error.message}`
            });
        }
    }

    /**
     * Audit deployment readiness
     */
    async auditDeploymentReadiness(targetDir, results) {
        const backendDir = path.join(targetDir, this.config.get('backendPath') || 'src/backend');
        
        try {
            // Check if all required helpers are present
            const helpersDir = path.join(backendDir, this.config.get('helpersSubPath') || 'src/helpers');
            const requiredHelpers = [
                'wrapHandler.js',
                'dbOperations.js', 
                'responseUtil.js',
                'errorHandler.js',
                'environmentValidator.js'
            ];

            for (const helperFile of requiredHelpers) {
                const helperPath = path.join(helpersDir, helperFile);
                try {
                    await fs.access(helperPath);
                    results.passed.push({
                        rule: 'all_required_helpers_included',
                        file: helperFile,
                        message: `Required helper ${helperFile} is present`
                    });
                } catch (error) {
                    results.violations.push({
                        rule: 'all_required_helpers_included',
                        file: helperFile,
                        message: `Required helper ${helperFile} is missing`
                    });
                }
            }

            // Check package.json exists and has required dependencies
            const packageJsonPath = path.join(backendDir, 'package.json');
            try {
                const packageContent = await fs.readFile(packageJsonPath, 'utf8');
                const packageJson = JSON.parse(packageContent);
                
                const requiredDeps = ['aws-sdk', 'pg'];
                const missingDeps = requiredDeps.filter(dep => 
                    !packageJson.dependencies?.[dep] && !packageJson.devDependencies?.[dep]
                );

                if (missingDeps.length === 0) {
                    results.passed.push({
                        rule: 'dependencies_correctly_resolved',
                        file: 'package.json',
                        message: 'All required dependencies are present'
                    });
                } else {
                    results.violations.push({
                        rule: 'dependencies_correctly_resolved',
                        file: 'package.json',
                        message: `Missing required dependencies: ${missingDeps.join(', ')}`
                    });
                }
            } catch (error) {
                results.violations.push({
                    rule: 'dependencies_correctly_resolved',
                    file: 'package.json',
                    message: `Cannot read package.json: ${error.message}`
                });
            }

        } catch (error) {
            results.violations.push({
                rule: 'deployment_directory_accessible',
                file: backendDir,
                message: `Cannot access backend directory: ${error.message}`
            });
        }
    }

    /**
     * Audit frontend patterns compliance
     */
    async auditFrontendPatterns(targetDir, results) {
        const frontendDir = path.join(targetDir, this.config.get('frontendSrcPath') || 'src/frontend/src');
        
        try {
            // Check context provider layering
            const contextFiles = await this.findFilesRecursive(path.join(frontendDir, 'contexts'), '.tsx');
            
            for (const contextFile of contextFiles) {
                await this.auditContextFile(contextFile, results);
            }

            // Check component patterns
            const componentFiles = await this.findFilesRecursive(path.join(frontendDir, 'components'), '.tsx');
            
            for (const componentFile of componentFiles.slice(0, 10)) { // Sample check
                await this.auditComponentFile(componentFile, results);
            }

        } catch (error) {
            results.warnings.push({
                rule: 'frontend_directory_accessible',
                file: frontendDir,
                message: `Cannot fully access frontend directory: ${error.message}`
            });
        }
    }

    /**
     * Generate comprehensive audit summary
     */
    generateAuditSummary(auditResults) {
        let totalPassed = 0;
        let totalWarnings = 0;
        let totalViolations = 0;

        for (const categoryResults of Object.values(auditResults)) {
            totalPassed += categoryResults.passed.length;
            totalWarnings += categoryResults.warnings.length;
            totalViolations += categoryResults.violations.length;
        }

        const totalChecks = totalPassed + totalWarnings + totalViolations;
        const complianceScore = totalChecks > 0 ? ((totalPassed / totalChecks) * 100).toFixed(1) : 100;

        const priorityViolations = this.identifyPriorityViolations(auditResults);
        const recommendations = this.generateRecommendations(auditResults);

        return {
            totalPassed,
            totalWarnings,
            totalViolations,
            totalChecks,
            complianceScore: parseFloat(complianceScore),
            priorityViolations,
            recommendations,
            readyForDeployment: totalViolations === 0,
            readyForProduction: totalViolations === 0 && totalWarnings < 5
        };
    }

    /**
     * Identify high-priority violations that block deployment
     */
    identifyPriorityViolations(auditResults) {
        const priorityRules = [
            'handlers_only_import_from_current_directory',
            'handlers_use_wrapHandler_pattern',
            'all_required_helpers_included',
            'handlers_implement_proper_error_handling'
        ];

        const priorityViolations = [];

        for (const [category, results] of Object.entries(auditResults)) {
            for (const violation of results.violations) {
                if (priorityRules.includes(violation.rule)) {
                    priorityViolations.push({
                        category,
                        ...violation,
                        priority: 'HIGH'
                    });
                }
            }
        }

        return priorityViolations;
    }

    /**
     * Generate actionable recommendations
     */
    generateRecommendations(auditResults) {
        const recommendations = [];

        // Handler compliance recommendations
        const handlerViolations = auditResults.handler_compliance?.violations || [];
        if (handlerViolations.length > 0) {
            recommendations.push({
                category: 'handler_compliance',
                title: 'Fix Handler Pattern Violations',
                description: 'Update Lambda handlers to follow established patterns',
                actions: [
                    'Ensure handlers only import from current directory (./) or Node.js built-ins',
                    'Use wrapHandler pattern for all handler exports',
                    'Include all required helpers in handler directory',
                    'Implement proper try/catch error handling'
                ]
            });
        }

        // Deployment readiness recommendations
        const deploymentViolations = auditResults.deployment_readiness?.violations || [];
        if (deploymentViolations.length > 0) {
            recommendations.push({
                category: 'deployment_readiness',
                title: 'Prepare for Deployment',
                description: 'Ensure all required files and dependencies are included',
                actions: [
                    'Copy all helper files to Lambda deployment packages',
                    'Verify package.json includes all required dependencies',
                    'Test deployment package in isolated environment'
                ]
            });
        }

        return recommendations;
    }

    // Helper methods
    async findHandlerFiles(dir) {
        const files = [];
        try {
            const entries = await fs.readdir(dir, { withFileTypes: true });
            
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                
                if (entry.isDirectory()) {
                    const subFiles = await this.findHandlerFiles(fullPath);
                    files.push(...subFiles);
                } else if (this.isActualHandler(entry.name, fullPath)) {
                    files.push(fullPath);
                }
            }
        } catch (error) {
            // Directory not accessible
        }
        
        return files;
    }

    isActualHandler(fileName, fullPath) {
        // Only audit actual Lambda handlers, not utility files
        if (!fileName.endsWith('.js') || fileName.includes('test')) {
            return false;
        }

        // Skip helper/utility files
        const utilityFiles = [
            'lambdaWrapper.js',
            'dbOperations.js', 
            'responseUtil.js',
            'errorHandler.js',
            'validationUtil.js',
            'eventParser.js',
            'dbClient.js',
            'integrationManager.js',
            'healthManager.js',
            'instanceManager.js'
        ];

        if (utilityFiles.includes(fileName)) {
            return false;
        }

        // Skip directories that contain helpers
        if (fullPath.includes('/helpers/') || fullPath.includes('/services/')) {
            return false;
        }

        return true;
    }

    async findFilesRecursive(dir, extension) {
        const files = [];
        try {
            const entries = await fs.readdir(dir, { withFileTypes: true });
            
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                
                if (entry.isDirectory()) {
                    const subFiles = await this.findFilesRecursive(fullPath, extension);
                    files.push(...subFiles);
                } else if (entry.name.endsWith(extension)) {
                    files.push(fullPath);
                }
            }
        } catch (error) {
            // Directory not accessible
        }
        
        return files;
    }

    isPascalCaseWithUnderscores(fieldName) {
        // Check if field name follows PascalCase_With_Underscores pattern
        return /^[A-Z][a-zA-Z0-9]*(_[A-Z][a-zA-Z0-9]*)*$/.test(fieldName);
    }

    async auditContextFile(contextPath, results) {
        try {
            const content = await fs.readFile(contextPath, 'utf8');
            const fileName = path.basename(contextPath);
            
            if (content.includes('createContext') && content.includes('Provider')) {
                results.passed.push({
                    rule: 'contexts_follow_provider_pattern',
                    file: fileName,
                    message: 'Context follows proper provider pattern'
                });
            }
        } catch (error) {
            // File not readable
        }
    }

    async auditComponentFile(componentPath, results) {
        try {
            const content = await fs.readFile(componentPath, 'utf8');
            const fileName = path.basename(componentPath);
            
            if (content.includes('flowbite-react')) {
                results.passed.push({
                    rule: 'components_use_flowbite_react',
                    file: fileName,
                    message: 'Component uses Flowbite React'
                });
            }
        } catch (error) {
            // File not readable
        }
    }
}

module.exports = AuditorAgent;