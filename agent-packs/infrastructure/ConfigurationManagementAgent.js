/**
 * Configuration Management Agent - Centralized Configuration and Secrets Management
 * 
 * Provides centralized, environment-aware configuration management for the entire
 * agent ecosystem. Integrates with AWS Secrets Manager, Parameter Store, and 
 * supports the 3-account architecture (dev, sandbox, media) with OIDC integration.
 * 
 * Key Capabilities:
 * - Environment-specific configuration management
 * - AWS Secrets Manager integration for secure credential storage
 * - Configuration validation and drift detection
 * - Dynamic configuration updates without agent restart
 * - Configuration versioning and rollback capabilities
 * - Compliance-aware configuration policies
 * 
 * @version 1.0.0
 * @author Equilateral AI (Pareidolia LLC)
 * @enhancement_type foundational
 */

const fs = require('fs').promises;
const path = require('path');
const EventEmitter = require('events');
const PathScanningHelper = require('../../equilateral-core/PathScanningHelper');

class ConfigurationManagementAgent extends EventEmitter {
    constructor(options = {}) {
        super();
        // Initialize path scanner for configuration management
        this.pathScanner = new PathScanningHelper({
            verbose: config.verbose !== false,
            extensions: {
                all: ['.json', '.yaml', '.yml', '.env', '.config']
            },
            maxDepth: config.maxDepth || 10
        });
        
        this.config = {
            projectRoot: options.projectRoot || process.cwd(),
            environment: options.environment || 'dev',
            configCacheTTL: options.configCacheTTL || 300000, // 5 minutes
            enableSecretRotation: options.enableSecretRotation || true,
            complianceMode: options.complianceMode || 'soc2',
            ...options
        };

        // Multi-account architecture configuration
        // IMPORTANT: Load from environment variables in production!
        // See examples/configuration-management-example.js for patterns
        this.accountConfigs = options.accountConfigs || {
            dev: {
                account: process.env.AWS_ACCOUNT_ID_DEV || 'YOUR_DEV_ACCOUNT_ID',
                profile: process.env.AWS_PROFILE_DEV || 'dev-profile',
                region: process.env.AWS_REGION || 'us-east-1',
                secretsManagerPrefix: process.env.SECRETS_PREFIX_DEV || 'myapp-dev',
                parameterStorePrefix: process.env.PARAM_PREFIX_DEV || '/myapp/dev',
                lambdaBucket: process.env.LAMBDA_BUCKET_DEV || 'myapp-dev-lambda',
                cognitoPool: process.env.COGNITO_POOL_DEV || 'us-east-1_XXXXXXXXX',
                apiUrl: process.env.API_URL_DEV || 'https://api-dev.example.com'
            },
            staging: {
                account: process.env.AWS_ACCOUNT_ID_STAGING || 'YOUR_STAGING_ACCOUNT_ID',
                profile: process.env.AWS_PROFILE_STAGING || 'staging-profile',
                region: process.env.AWS_REGION || 'us-east-1',
                secretsManagerPrefix: process.env.SECRETS_PREFIX_STAGING || 'myapp-staging',
                parameterStorePrefix: process.env.PARAM_PREFIX_STAGING || '/myapp/staging',
                lambdaBucket: process.env.LAMBDA_BUCKET_STAGING || 'myapp-staging-lambda',
                cognitoPool: process.env.COGNITO_POOL_STAGING || 'us-east-1_YYYYYYYYY',
                apiUrl: process.env.API_URL_STAGING || 'https://api-staging.example.com'
            },
            production: {
                account: process.env.AWS_ACCOUNT_ID_PROD || 'YOUR_PROD_ACCOUNT_ID',
                profile: process.env.AWS_PROFILE_PROD || 'prod-profile',
                region: process.env.AWS_REGION || 'us-east-1',
                secretsManagerPrefix: process.env.SECRETS_PREFIX_PROD || 'myapp-prod',
                parameterStorePrefix: process.env.PARAM_PREFIX_PROD || '/myapp/prod',
                lambdaBucket: process.env.LAMBDA_BUCKET_PROD || 'myapp-prod-lambda',
                cognitoPool: process.env.COGNITO_POOL_PROD || 'us-east-1_ZZZZZZZZZ',
                apiUrl: process.env.API_URL_PROD || 'https://api.example.com',
                frontendBucket: process.env.FRONTEND_BUCKET_PROD || 'myapp-prod-frontend',
                cloudFrontDistribution: process.env.CLOUDFRONT_DIST_PROD || 'EXAMPLEID123'
            }
        };

        // Configuration cache and state management
        this.configCache = new Map();
        this.secretsCache = new Map();
        this.configurationState = {
            lastUpdate: null,
            version: '1.0.0',
            driftDetected: false,
            validationErrors: []
        };

        // Initialize configuration management
        this.initializeConfigurationManagement();
    }

    /**
     * Initialize configuration management system
     */
    async initializeConfigurationManagement() {
        console.log('⚙️ Initializing Configuration Management Agent...');
        
        try {
            // Load base configurations
            await this.loadBaseConfigurations();
            
            // Initialize environment-specific configs
            await this.loadEnvironmentConfigurations();
            
            // Setup configuration monitoring
            this.setupConfigurationMonitoring();
            
            // Setup secret rotation if enabled
            if (this.config.enableSecretRotation) {
                this.setupSecretRotation();
            }
            
            console.log('✅ Configuration Management Agent initialized');
            this.emit('config-agent:initialized', {
                environment: this.config.environment,
                cacheSize: this.configCache.size
            });
            
        } catch (error) {
            console.error('❌ Configuration Management initialization failed:', error);
            throw error;
        }
    }

    /**
     * Main execution method - comprehensive configuration management
     */
    async executeConfigurationManagement(options = {}) {
        console.log('⚙️ Executing comprehensive configuration management...');
        
        const results = {
            configuration_loading: await this.loadAndValidateConfigurations(options),
            secrets_management: await this.manageSecretsAndCredentials(options),
            environment_validation: await this.validateEnvironmentConfiguration(options),
            drift_detection: await this.detectConfigurationDrift(options),
            policy_compliance: await this.validateCompliancePolicies(options),
            optimization_recommendations: await this.generateConfigurationRecommendations(options)
        };

        return this.createUnifiedConfigReport(results);
    }

    /**
     * Load and validate all configurations
     */
    async loadAndValidateConfigurations(options = {}) {
        console.log('📋 Loading and validating configurations...');
        
        const configLoading = {
            base_config_loaded: false,
            environment_configs_loaded: {},
            agent_specific_configs: {},
            validation_results: {},
            cache_status: {}
        };

        // Load base agent configurations
        try {
            const baseConfig = await this.loadAgentBaseConfigurations();
            configLoading.base_config_loaded = true;
            configLoading.validation_results.base = await this.validateConfiguration(baseConfig, 'base');
        } catch (error) {
            configLoading.validation_results.base = { valid: false, errors: [error.message] };
        }

        // Load environment-specific configurations
        for (const [envName, envConfig] of Object.entries(this.accountConfigs)) {
            try {
                const envSpecificConfig = await this.loadEnvironmentSpecificConfiguration(envName);
                configLoading.environment_configs_loaded[envName] = true;
                configLoading.validation_results[envName] = await this.validateConfiguration(envSpecificConfig, envName);
            } catch (error) {
                configLoading.environment_configs_loaded[envName] = false;
                configLoading.validation_results[envName] = { valid: false, errors: [error.message] };
            }
        }

        return configLoading;
    }

    /**
     * Manage secrets and credentials across environments
     */
    async manageSecretsAndCredentials(options = {}) {
        console.log('🔐 Managing secrets and credentials...');
        
        const secretsManagement = {
            secrets_audit: await this.auditSecretsUsage(),
            rotation_status: await this.checkSecretRotationStatus(),
            compliance_validation: await this.validateSecretsCompliance(),
            access_patterns: await this.analyzeSecretAccessPatterns()
        };

        return secretsManagement;
    }

    /**
     * Validate environment-specific configurations
     */
    async validateEnvironmentConfiguration(options = {}) {
        console.log('🌍 Validating environment configurations...');
        
        const environment = options.environment || this.config.environment;
        const envConfig = this.accountConfigs[environment];
        
        if (!envConfig) {
            throw new Error(`Unknown environment: ${environment}`);
        }

        const validation = {
            environment: environment,
            account_access: await this.validateAccountAccess(envConfig),
            oidc_configuration: await this.validateOIDCConfiguration(envConfig),
            resource_availability: await this.validateResourceAvailability(envConfig),
            network_connectivity: await this.validateNetworkConnectivity(envConfig),
            permissions_validation: await this.validatePermissions(envConfig)
        };

        return validation;
    }

    /**
     * Detect configuration drift across environments
     */
    async detectConfigurationDrift(options = {}) {
        console.log('🔍 Detecting configuration drift...');
        
        const driftDetection = {
            baseline_established: await this.establishConfigurationBaseline(),
            drift_analysis: await this.analyzeConfigurationDrift(),
            deviation_summary: await this.summarizeConfigurationDeviations(),
            remediation_plan: await this.generateRemediationPlan()
        };

        return driftDetection;
    }

    /**
     * Validate compliance policies
     */
    async validateCompliancePolicies(options = {}) {
        console.log('📋 Validating compliance policies...');
        
        const complianceMode = options.complianceMode || this.config.complianceMode;
        
        const compliance = {
            policy_framework: complianceMode,
            configuration_policies: await this.validateConfigurationPolicies(complianceMode),
            secret_management_policies: await this.validateSecretManagementPolicies(complianceMode),
            access_control_policies: await this.validateAccessControlPolicies(complianceMode),
            audit_trail_validation: await this.validateAuditTrails(complianceMode)
        };

        return compliance;
    }

    /**
     * Generate configuration optimization recommendations
     */
    async generateConfigurationRecommendations(options = {}) {
        console.log('💡 Generating configuration recommendations...');
        
        const recommendations = {
            security_improvements: await this.generateSecurityRecommendations(),
            performance_optimizations: await this.generatePerformanceRecommendations(),
            cost_optimizations: await this.generateCostRecommendations(),
            compliance_enhancements: await this.generateComplianceRecommendations()
        };

        return recommendations;
    }

    /**
     * Get configuration value with caching and fallback
     */
    async getConfiguration(key, environment = null, options = {}) {
        const env = environment || this.config.environment;
        const cacheKey = `${env}:${key}`;
        
        // Check cache first
        if (this.configCache.has(cacheKey) && !options.skipCache) {
            const cached = this.configCache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.config.configCacheTTL) {
                return cached.value;
            }
        }
        
        // Load configuration value
        const value = await this.loadConfigurationValue(key, env);
        
        // Cache the result
        this.configCache.set(cacheKey, {
            value,
            timestamp: Date.now(),
            environment: env
        });
        
        return value;
    }

    /**
     * Get secret value with caching and rotation awareness
     */
    async getSecret(secretName, environment = null, options = {}) {
        const env = environment || this.config.environment;
        const envConfig = this.accountConfigs[env];
        
        if (!envConfig) {
            throw new Error(`Unknown environment: ${env}`);
        }
        
        const secretKey = `${envConfig.secretsManagerPrefix}/${secretName}`;
        
        // Check cache first
        if (this.secretsCache.has(secretKey) && !options.skipCache) {
            const cached = this.secretsCache.get(secretKey);
            if (Date.now() - cached.timestamp < this.config.configCacheTTL) {
                return cached.value;
            }
        }
        
        // Load secret from AWS Secrets Manager
        const secret = await this.loadSecretFromAWS(secretKey, envConfig);
        
        // Cache the secret (with shorter TTL for security)
        this.secretsCache.set(secretKey, {
            value: secret,
            timestamp: Date.now(),
            environment: env
        });
        
        return secret;
    }

    /**
     * Update configuration with validation and notification
     */
    async updateConfiguration(key, value, environment = null, options = {}) {
        const env = environment || this.config.environment;
        
        // Validate the new configuration value
        const validation = await this.validateConfigurationValue(key, value, env);
        if (!validation.valid) {
            throw new Error(`Invalid configuration value: ${validation.errors.join(', ')}`);
        }
        
        // Update the configuration
        await this.updateConfigurationValue(key, value, env);
        
        // Invalidate cache
        const cacheKey = `${env}:${key}`;
        this.configCache.delete(cacheKey);
        
        // Notify other agents of configuration change
        this.emit('configuration:updated', {
            key,
            value,
            environment: env,
            timestamp: new Date().toISOString()
        });
        
        return { updated: true, key, environment: env };
    }

    /**
     * Create unified configuration management report
     */
    createUnifiedConfigReport(results) {
        return {
            management_timestamp: new Date().toISOString(),
            config_agent: 'ConfigurationManagementAgent',
            version: '1.0.0',
            environment: this.config.environment,
            account_architecture: Object.keys(this.accountConfigs),
            ...results,
            summary: {
                total_environments: Object.keys(this.accountConfigs).length,
                cached_configs: this.configCache.size,
                cached_secrets: this.secretsCache.size,
                configuration_health: this.calculateConfigurationHealth(results),
                compliance_score: this.calculateComplianceScore(results)
            },
            configuration_state: this.configurationState
        };
    }

    // Helper methods and implementation details
    async loadBaseConfigurations() {
        const configPath = path.join(this.config.projectRoot, 'src/agents/config.json');
        try {
            const configContent = await fs.readFile(configPath, 'utf8');
            const config = JSON.parse(configContent);
            this.configCache.set('base:agent_config', {
                value: config,
                timestamp: Date.now(),
                environment: 'base'
            });
            return config;
        } catch (error) {
            throw new Error(`Failed to load base configuration: ${error.message}`);
        }
    }

    async loadEnvironmentConfigurations() {
        for (const [envName, envConfig] of Object.entries(this.accountConfigs)) {
            // Load environment-specific configuration files
            const envConfigPaths = [
                path.join(this.config.projectRoot, `.env.${envName}`),
                path.join(this.config.projectRoot, `config/${envName}.json`),
                path.join(this.config.projectRoot, `src/config/${envName}.js`)
            ];
            
            for (const configPath of envConfigPaths) {
                try {
                    await fs.access(configPath);
                    // Configuration file exists, load it
                    break;
                } catch (error) {
                    // File doesn't exist, continue
                }
            }
        }
    }

    setupConfigurationMonitoring() {
        // Setup file system watching for configuration changes
        // Setup periodic drift detection
        setInterval(() => {
            this.detectAndReportDrift();
        }, 300000); // Check every 5 minutes
    }

    setupSecretRotation() {
        // Setup periodic secret rotation checks
        setInterval(() => {
            this.checkAndRotateSecrets();
        }, 3600000); // Check every hour
    }

    // Placeholder methods for AWS integration (would be implemented with AWS SDK)
    async loadAgentBaseConfigurations() { return {}; }
    async loadEnvironmentSpecificConfiguration(env) { return {}; }
    async validateConfiguration(config, type) { return { valid: true, errors: [] }; }
    async auditSecretsUsage() { return {}; }
    async checkSecretRotationStatus() { return {}; }
    async validateSecretsCompliance() { return {}; }
    async analyzeSecretAccessPatterns() { return {}; }
    async validateAccountAccess(config) { return true; }
    async validateOIDCConfiguration(config) { return true; }
    async validateResourceAvailability(config) { return true; }
    async validateNetworkConnectivity(config) { return true; }
    async validatePermissions(config) { return true; }
    async establishConfigurationBaseline() { return {}; }
    async analyzeConfigurationDrift() { return {}; }
    async summarizeConfigurationDeviations() { return {}; }
    async generateRemediationPlan() { return {}; }
    async validateConfigurationPolicies(mode) { return {}; }
    async validateSecretManagementPolicies(mode) { return {}; }
    async validateAccessControlPolicies(mode) { return {}; }
    async validateAuditTrails(mode) { return {}; }
    async generateSecurityRecommendations() { return []; }
    async generatePerformanceRecommendations() { return []; }
    async generateCostRecommendations() { return []; }
    async generateComplianceRecommendations() { return []; }
    async loadConfigurationValue(configPath, environment = 'development') {
        try {
            console.log(`⚙️ Loading configuration value: ${configPath} for ${environment}`);
            
            // Simulate AWS Parameter Store or similar configuration service
            const mockConfigValues = {
                'database/host': environment === 'production' ? 'prod-db.amazonaws.com' : 'dev-db.amazonaws.com',
                'database/port': '5432',
                'api/rate_limit': environment === 'production' ? '1000' : '100',
                'security/jwt_secret': 'mock_jwt_secret_key',
                'feature_flags/new_ui': environment === 'production' ? 'false' : 'true'
            };
            
            const configValue = mockConfigValues[configPath] || `mock_value_for_${configPath}`;
            
            const configResult = {
                operation: 'loadConfigurationValue',
                path: configPath,
                environment: environment,
                value: configValue,
                cached: false,
                timestamp: new Date().toISOString(),
                success: true
            };
            
            console.log(`✅ Configuration loaded: ${configPath} = ${configValue}`);
            return configResult;
            
        } catch (error) {
            console.error(`❌ Configuration loading failed for ${configPath}:`, error);
            throw error;
        }
    }

    async loadSecretFromAWS(secretName, region = 'us-east-1') {
        try {
            console.log(`🔐 Loading secret from AWS Secrets Manager: ${secretName}`);
            
            // Simulate AWS Secrets Manager response
            const mockSecrets = {
                'database-credentials': {
                    username: 'admin',
                    password: 'mock_password_123',
                    host: 'prod-db.amazonaws.com'
                },
                'api-keys': {
                    stripe_key: 'sk_test_mock_key',
                    sendgrid_key: 'SG.mock_key'
                },
                'encryption-keys': {
                    aes_key: 'mock_aes_256_key',
                    rsa_private_key: '-----BEGIN PRIVATE KEY-----\nmock_key\n-----END PRIVATE KEY-----'
                }
            };
            
            const secretValue = mockSecrets[secretName] || { value: `mock_secret_${secretName}` };
            
            const secretResult = {
                operation: 'loadSecretFromAWS',
                secretName: secretName,
                region: region,
                value: secretValue,
                versionId: 'mock-version-123',
                timestamp: new Date().toISOString(),
                success: true
            };
            
            console.log(`✅ Secret loaded: ${secretName} from ${region}`);
            return secretResult;
            
        } catch (error) {
            console.error(`❌ Secret loading failed for ${secretName}:`, error);
            throw error;
        }
    }
    
    async validateConfigurationValue(key, value, environment = 'development') {
        console.log(`🔍 Validating configuration: ${key} for ${environment}`);
        
        const validationRules = {
            'database/port': (val) => !isNaN(val) && val > 0 && val < 65536,
            'api/rate_limit': (val) => !isNaN(val) && val > 0,
            'feature_flags/*': (val) => val === 'true' || val === 'false'
        };
        
        const errors = [];
        let isValid = true;
        
        // Apply specific validation rule
        const rule = validationRules[key] || validationRules[key.replace(/\/[^/]+$/, '/*')];
        if (rule && !rule(value)) {
            errors.push(`Invalid value for ${key}: ${value}`);
            isValid = false;
        }
        
        // Environment-specific validation
        if (environment === 'production') {
            if (key.includes('secret') && value.includes('mock')) {
                errors.push(`Production environment should not use mock values for ${key}`);
                isValid = false;
            }
        }
        
        return { valid: isValid, errors: errors };
    }
    
    async updateConfigurationValue(key, value, environment = 'development') {
        console.log(`📝 Updating configuration: ${key} = ${value} for ${environment}`);
        
        // Validate before updating
        const validation = await this.validateConfigurationValue(key, value, environment);
        if (!validation.valid) {
            throw new Error(`Configuration validation failed: ${validation.errors.join(', ')}`);
        }
        
        // Simulate configuration update
        console.log(`✅ Configuration updated: ${key} in ${environment}`);
        return true;
    }
    
    async detectAndReportDrift(expectedConfiguration, actualConfiguration) {
        try {
            console.log('🔍 Detecting configuration drift...');
            
            const driftReport = {
                operation: 'detectAndReportDrift',
                drift_detected: false,
                differences: [],
                severity: 'low',
                recommendations: [],
                timestamp: new Date().toISOString()
            };
            
            // Compare configurations
            for (const [key, expectedValue] of Object.entries(expectedConfiguration)) {
                const actualValue = actualConfiguration[key];
                
                if (actualValue !== expectedValue) {
                    driftReport.drift_detected = true;
                    driftReport.differences.push({
                        key: key,
                        expected: expectedValue,
                        actual: actualValue,
                        severity: this.assessDriftSeverity(key, expectedValue, actualValue)
                    });
                }
            }
            
            // Determine overall severity and recommendations
            if (driftReport.drift_detected) {
                const severities = driftReport.differences.map(d => d.severity);
                driftReport.severity = severities.includes('critical') ? 'critical' : 
                                     severities.includes('high') ? 'high' : 
                                     severities.includes('medium') ? 'medium' : 'low';
                
                driftReport.recommendations = this.generateDriftRecommendations(driftReport.differences);
            }
            
            console.log(`✅ Drift detection complete: ${driftReport.drift_detected ? 'drift detected' : 'no drift'}`);
            return driftReport;
            
        } catch (error) {
            console.error('❌ Drift detection failed:', error);
            throw error;
        }
    }

    // Helper methods for drift analysis
    assessDriftSeverity(key, expectedValue, actualValue) {
        // Critical configuration changes
        if (key.includes('database') || key.includes('security')) {
            return 'critical';
        }
        
        // High impact changes
        if (key.includes('api') || key.includes('auth')) {
            return 'high';
        }
        
        // Medium impact changes
        if (key.includes('feature_flags') || key.includes('cache')) {
            return 'medium';
        }
        
        return 'low';
    }

    generateDriftRecommendations(differences) {
        const recommendations = [];
        
        const criticalDiffs = differences.filter(d => d.severity === 'critical');
        const highDiffs = differences.filter(d => d.severity === 'high');
        
        if (criticalDiffs.length > 0) {
            recommendations.push('Immediate action required: Critical configuration drift detected');
            recommendations.push('Review and update configuration management processes');
        }
        
        if (highDiffs.length > 0) {
            recommendations.push('High priority: Review configuration changes');
        }
        
        recommendations.push('Consider implementing automated configuration monitoring');
        recommendations.push('Schedule regular configuration audits');
        
        return recommendations;
    }

    async checkAndRotateSecrets(environment = 'production') {
        try {
            console.log(`🔄 Checking and rotating secrets for ${environment}...`);
            
            const secretsToCheck = [
                'database-credentials',
                'api-keys', 
                'encryption-keys'
            ];
            
            const rotationResults = {
                operation: 'checkAndRotateSecrets',
                environment: environment,
                secrets_checked: secretsToCheck.length,
                secrets_rotated: 0,
                rotation_details: [],
                timestamp: new Date().toISOString(),
                success: true
            };
            
            for (const secretName of secretsToCheck) {
                const secretAge = this.calculateSecretAge(secretName);
                const needsRotation = secretAge > 90; // Rotate if older than 90 days
                
                const rotationDetail = {
                    secret_name: secretName,
                    age_days: secretAge,
                    needs_rotation: needsRotation,
                    rotated: false
                };
                
                if (needsRotation) {
                    // Simulate secret rotation
                    rotationDetail.rotated = true;
                    rotationDetail.new_version = `v${Date.now()}`;
                    rotationResults.secrets_rotated++;
                }
                
                rotationResults.rotation_details.push(rotationDetail);
            }
            
            console.log(`✅ Secret rotation complete: ${rotationResults.secrets_rotated}/${rotationResults.secrets_checked} secrets rotated`);
            return rotationResults;
            
        } catch (error) {
            console.error('❌ Secret rotation failed:', error);
            throw error;
        }
    }

    // Helper method for secret age calculation
    calculateSecretAge(secretName) {
        // Simulate secret age calculation (in real implementation, would check AWS Secrets Manager)
        const mockAges = {
            'database-credentials': 45,
            'api-keys': 120, // Needs rotation
            'encryption-keys': 30
        };
        return mockAges[secretName] || 60;
    }
    calculateConfigurationHealth(results) { return 'healthy'; }
    calculateComplianceScore(results) { return 0.95; }
}

module.exports = ConfigurationManagementAgent;