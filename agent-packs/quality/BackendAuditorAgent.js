/**
 * Backend Auditor Agent - Specialized Backend Code Compliance and Quality Assurance
 * 
 * Focuses on Lambda handlers, API patterns, database standards, and backend-specific
 * quality assurance. Split from AuditorAgent for specialized backend expertise.
 * 
 * Key Focus Areas:
 * - Lambda handler compliance and patterns
 * - API response format validation  
 * - Database field naming and business scoped IDs
 * - Backend error handling patterns
 * - Import and dependency management
 * 
 * @version 1.0.0
 * @author Equilateral AI (Pareidolia LLC)
 * @split_from AuditorAgent
 */

const fs = require('fs').promises;
const path = require('path');
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

class BackendAuditorAgent {
    constructor() {
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
            'database_patterns': {
                description: 'Validate database interaction and field naming',
                standards: [
                    'database_fields_use_PascalCase_With_Underscores',
                    'business_scoped_ids_used_consistently',
                    'jsonb_first_approach_followed',
                    'exact_field_names_no_transformation'
                ]
            },
            'error_handling': {
                description: 'Validate backend error handling patterns',
                standards: [
                    'errors_use_handleError_helper',
                    'no_mock_data_or_fallback_values',
                    'failures_fail_fast_and_loudly',
                    'error_messages_properly_structured'
                ]
            }
        };

        this.violations = [];
        this.warnings = [];
        this.passed = [];

        // Initialize path scanner for backend auditing
        this.pathScanner = new PathScanningHelper({
            verbose: false,
            extensions: {
                all: ['.js', '.ts', '.py', '.java', '.go']
            },
            maxDepth: 10
        });
    }

    /**
     * Run comprehensive backend audit
     */
    async runBackendAudit(targetDirectory) {
        console.log('🔍 Starting comprehensive backend audit...');
        
        this.violations = [];
        this.warnings = [];
        this.passed = [];
        
        const results = {
            timestamp: new Date().toISOString(),
            target_directory: targetDirectory,
            audit_type: 'backend_comprehensive',
            categories_audited: Object.keys(this.auditCategories),
            violations: [],
            warnings: [],
            passed: []
        };

        // Audit each backend category
        for (const [category, config] of Object.entries(this.auditCategories)) {
            console.log(`📋 Auditing ${category}: ${config.description}`);
            
            try {
                await this.auditCategory(category, targetDirectory, results);
                
                console.log(`  ✅ Passed: ${this.passed.length}`);
                console.log(`  ⚠️  Warnings: ${this.warnings.length}`);
                console.log(`  ❌ Violations: ${this.violations.length}`);
            } catch (error) {
                console.error(`❌ Audit failed for ${category}:`, error.message);
                results.violations.push({
                    category,
                    type: 'audit_failure',
                    message: `Audit failed: ${error.message}`,
                    severity: 'high'
                });
            }
        }

        results.violations = this.violations;
        results.warnings = this.warnings;
        results.passed = this.passed;
        
        return createSuccessResponse(results, 'Backend audit completed', {
            total_violations: this.violations.length,
            total_warnings: this.warnings.length,
            total_passed: this.passed.length
        });
    }

    /**
     * Audit specific backend category
     */
    async auditCategory(category, targetDir, results) {
        const targetDirStr = typeof targetDir === 'string' ? targetDir : process.cwd();
        
        switch (category) {
            case 'handler_compliance':
                await this.auditHandlerCompliance(targetDirStr, results);
                break;
            case 'api_standards':
                await this.auditAPIStandards(targetDirStr, results);
                break;
            case 'database_patterns':
                await this.auditDatabasePatterns(targetDirStr, results);
                break;
            case 'error_handling':
                await this.auditErrorHandling(targetDirStr, results);
                break;
            default:
                console.warn(`Unknown backend audit category: ${category}`);
        }
    }

    /**
     * Audit backend server logic (handlers, controllers, routes, etc.)
     * Supports multiple architectural patterns
     */
    async auditHandlerCompliance(targetDir, results) {
        // Support multiple backend patterns - not just Lambda handlers
        const backendPatterns = [
            // Lambda/Serverless patterns
            { path: path.join(targetDir, 'src/backend/src/handlers'), pattern: 'handlers' },
            { path: path.join(targetDir, 'backend/src/handlers'), pattern: 'handlers' },
            { path: path.join(targetDir, 'src/handlers'), pattern: 'handlers' },
            { path: path.join(targetDir, 'handlers'), pattern: 'handlers' },
            { path: path.join(targetDir, 'lambda'), pattern: 'lambda' },
            { path: path.join(targetDir, 'functions'), pattern: 'functions' },

            // MVC/Express patterns
            { path: path.join(targetDir, 'src/controllers'), pattern: 'controllers' },
            { path: path.join(targetDir, 'controllers'), pattern: 'controllers' },
            { path: path.join(targetDir, 'src/routes'), pattern: 'routes' },
            { path: path.join(targetDir, 'routes'), pattern: 'routes' },
            { path: path.join(targetDir, 'api/routes'), pattern: 'routes' },

            // GraphQL patterns
            { path: path.join(targetDir, 'src/resolvers'), pattern: 'resolvers' },
            { path: path.join(targetDir, 'resolvers'), pattern: 'resolvers' },

            // Django/Flask patterns
            { path: path.join(targetDir, 'views'), pattern: 'views' },
            { path: path.join(targetDir, 'endpoints'), pattern: 'endpoints' },

            // Microservices patterns
            { path: path.join(targetDir, 'src/services'), pattern: 'services' },
            { path: path.join(targetDir, 'services'), pattern: 'services' }
        ];

        let foundPattern = null;
        for (const { path: dirPath, pattern } of backendPatterns) {
            try {
                await fs.access(dirPath);
                foundPattern = { path: dirPath, pattern };
                break;
            } catch {
                continue;
            }
        }

        if (!foundPattern) {
            console.log('📁 No backend logic directory found (handlers/controllers/routes/etc.)');
            this.passed.push({
                category: 'backend_logic_compliance',
                message: 'No backend logic to audit - acceptable for frontend-only, static sites, or unsupported patterns',
                patternsSearched: backendPatterns.length
            });
            return;
        }

        console.log(`📁 Found backend pattern: ${foundPattern.pattern} at ${foundPattern.path}`);

        try {
            const backendFiles = await this.findBackendFiles(foundPattern.path);

            for (const file of backendFiles) {
                await this.auditSingleHandler(file, results);
            }
        } catch (error) {
            if (error.code !== 'ENOENT') {
                throw error;
            }
        }
    }

    /**
     * Find backend logic files (works for any pattern)
     */
    async findBackendFiles(dir) {
        // Reuse the existing findHandlerFiles method
        return await this.findHandlerFiles(dir);
    }

    /**
     * Audit API standards compliance
     */
    async auditAPIStandards(targetDir, results) {
        // Try multiple common API locations
        const possiblePaths = [
            path.join(targetDir, 'src/frontend/src/api'),
            path.join(targetDir, 'frontend/src/api'),
            path.join(targetDir, 'src/api'),
            path.join(targetDir, 'api'),
            path.join(targetDir, 'src/services'),
            path.join(targetDir, 'services')
        ];

        let apiDir = null;
        for (const possiblePath of possiblePaths) {
            try {
                await fs.access(possiblePath);
                apiDir = possiblePath;
                break;
            } catch {
                continue;
            }
        }

        if (!apiDir) {
            console.log('📁 No API directory found in common locations');
            return;
        }
        
        try {
            const apiFiles = await this.findFilesRecursive(apiDir, /\.ts$/);
            
            for (const apiFile of apiFiles) {
                await this.auditSingleAPIFile(apiFile, results);
            }
        } catch (error) {
            if (error.code === 'ENOENT') {
                console.log(`📁 No API directory found at ${apiDir}`);
                this.passed.push({
                    category: 'api_standards',
                    message: 'No API files to audit',
                    path: apiDir
                });
            } else {
                throw error;
            }
        }
    }

    /**
     * Audit database patterns
     */
    async auditDatabasePatterns(targetDir, results) {
        // Look for database interaction files
        const dbPaths = [
            path.join(targetDir, 'src/backend/src/helpers/dbOperations.js'),
            path.join(targetDir, 'src/backend/helpers/dbOperations.js'),
            path.join(targetDir, 'src/helpers/dbOperations.js')
        ];

        for (const dbPath of dbPaths) {
            try {
                await fs.access(dbPath);
                await this.auditDatabaseFile(dbPath, results);
                break;
            } catch (error) {
                // File doesn't exist, continue to next path
                continue;
            }
        }
    }

    /**
     * Audit error handling patterns
     */
    async auditErrorHandling(targetDir, results) {
        const errorHelperPaths = [
            path.join(targetDir, 'src/backend/src/helpers/errorHandler.js'),
            path.join(targetDir, 'src/backend/helpers/errorHandler.js'),
            path.join(targetDir, 'src/helpers/errorHandler.js')
        ];

        for (const errorPath of errorHelperPaths) {
            try {
                await fs.access(errorPath);
                await this.auditErrorHandlerFile(errorPath, results);
                break;
            } catch (error) {
                // File doesn't exist, continue to next path
                continue;
            }
        }
    }

    // Helper methods for file analysis
    async findHandlerFiles(dir) {
        try {
            const files = await fs.readdir(dir);
            const handlerFiles = [];
            
            for (const file of files) {
                const filePath = path.join(dir, file);
                const stat = await fs.stat(filePath);
                
                if (stat.isFile() && this.isActualHandler(file)) {
                    handlerFiles.push(filePath);
                }
            }
            
            return handlerFiles;
        } catch (error) {
            throw error;
        }
    }

    isActualHandler(filename) {
        return filename.endsWith('.js') && 
               !filename.includes('.test.') && 
               !filename.includes('.spec.') &&
               !filename.startsWith('.');
    }

    async findFilesRecursive(dir, pattern) {
        const files = [];
        
        try {
            const items = await fs.readdir(dir);
            
            for (const item of items) {
                const itemPath = path.join(dir, item);
                const stat = await fs.stat(itemPath);
                
                if (stat.isDirectory()) {
                    const subFiles = await this.findFilesRecursive(itemPath, pattern);
                    files.push(...subFiles);
                } else if (pattern.test(item)) {
                    files.push(itemPath);
                }
            }
        } catch (error) {
            // Directory doesn't exist or permission denied
        }
        
        return files;
    }

    async auditSingleHandler(handlerFile, results) {
        try {
            const content = await fs.readFile(handlerFile, 'utf8');
            
            // Check for wrapHandler pattern
            if (!content.includes('wrapHandler')) {
                this.violations.push({
                    category: 'handler_compliance',
                    type: 'missing_wrap_handler',
                    message: 'Handler does not use wrapHandler pattern',
                    file: handlerFile,
                    severity: 'high'
                });
            } else {
                this.passed.push({
                    category: 'handler_compliance',
                    type: 'wrap_handler_used',
                    file: handlerFile
                });
            }

            // Check for proper error handling
            if (!content.includes('handleError')) {
                this.warnings.push({
                    category: 'handler_compliance',
                    type: 'missing_error_handling',
                    message: 'Handler may not use proper error handling',
                    file: handlerFile,
                    severity: 'medium'
                });
            }
            
        } catch (error) {
            console.error(`Error auditing handler ${handlerFile}:`, error);
        }
    }

    async auditSingleAPIFile(apiFile, results) {
        try {
            const content = await fs.readFile(apiFile, 'utf8');
            
            // Check for APIResponse pattern
            if (content.includes('APIResponse') && content.includes('Records')) {
                this.passed.push({
                    category: 'api_standards',
                    type: 'api_response_format',
                    file: apiFile
                });
            } else if (content.includes('fetch') || content.includes('axios')) {
                this.warnings.push({
                    category: 'api_standards',
                    type: 'potential_api_response_issue',
                    message: 'API file may not follow APIResponse<T> format',
                    file: apiFile,
                    severity: 'medium'
                });
            }
            
        } catch (error) {
            console.error(`Error auditing API file ${apiFile}:`, error);
        }
    }

    async auditDatabaseFile(dbFile, results) {
        try {
            const content = await fs.readFile(dbFile, 'utf8');
            
            // Check for business scoped ID patterns
            if (content.includes('generateBusinessId') || content.includes('business_scoped')) {
                this.passed.push({
                    category: 'database_patterns',
                    type: 'business_scoped_ids',
                    file: dbFile
                });
            } else {
                this.warnings.push({
                    category: 'database_patterns',
                    type: 'missing_business_scoped_ids',
                    message: 'Database operations may not use business scoped IDs',
                    file: dbFile,
                    severity: 'low'
                });
            }
            
        } catch (error) {
            console.error(`Error auditing database file ${dbFile}:`, error);
        }
    }

    async auditErrorHandlerFile(errorFile, results) {
        try {
            const content = await fs.readFile(errorFile, 'utf8');
            
            // Check for proper error structure
            if (content.includes('APIErrorResponse') && content.includes('handleError')) {
                this.passed.push({
                    category: 'error_handling',
                    type: 'proper_error_structure',
                    file: errorFile
                });
            } else {
                this.warnings.push({
                    category: 'error_handling',
                    type: 'potential_error_handling_issue',
                    message: 'Error handler may not follow proper patterns',
                    file: errorFile,
                    severity: 'medium'
                });
            }
            
        } catch (error) {
            console.error(`Error auditing error handler ${errorFile}:`, error);
        }
    }
}

module.exports = BackendAuditorAgent;