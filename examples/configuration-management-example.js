/**
 * Configuration Management Agent - Example Usage
 *
 * This example shows how to configure the ConfigurationManagementAgent
 * for your own multi-account AWS architecture.
 *
 * IMPORTANT: Never hardcode credentials or account numbers in production.
 * Use environment variables, AWS Systems Manager Parameter Store, or
 * AWS Secrets Manager for sensitive configuration.
 */

const ConfigurationManagementAgent = require('../agent-packs/infrastructure/ConfigurationManagementAgent');

// Example 1: Basic usage with environment-specific configuration
async function basicExample() {
    // Configuration should be loaded from environment variables or config service
    const accountConfigs = {
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

    const agent = new ConfigurationManagementAgent({
        environment: process.env.NODE_ENV || 'dev',
        accountConfigs: accountConfigs,
        enableSecretRotation: true,
        complianceMode: 'soc2'
    });

    // Get environment-specific configuration
    const dbConfig = await agent.getConfiguration('database/connection', 'dev');
    console.log('Database config:', dbConfig);

    // Get secret (from AWS Secrets Manager)
    const apiKey = await agent.getSecret('api-keys/external-service', 'dev');
    console.log('API key retrieved (not shown)');

    // Validate configuration compliance
    const complianceReport = await agent.validateCompliance('dev');
    console.log('Compliance report:', complianceReport);
}

// Example 2: Using with environment variables (.env file)
async function environmentVariableExample() {
    /**
     * Create a .env file in your project root:
     *
     * # AWS Configuration
     * AWS_ACCOUNT_ID_DEV=123456789012
     * AWS_PROFILE_DEV=my-dev-profile
     * AWS_REGION=us-east-1
     *
     * # Secrets Manager
     * SECRETS_PREFIX_DEV=myapp-dev
     *
     * # Lambda
     * LAMBDA_BUCKET_DEV=myapp-dev-lambda-bucket
     *
     * # API
     * API_URL_DEV=https://api-dev.myapp.com
     *
     * # Cognito
     * COGNITO_POOL_DEV=us-east-1_AbCdEfGhI
     */

    require('dotenv').config();

    const agent = new ConfigurationManagementAgent({
        environment: 'dev',
        // Account configs will be loaded from environment variables
        loadFromEnvironment: true
    });

    console.log('Agent initialized with environment variables');
}

// Example 3: Configuration validation and drift detection
async function driftDetectionExample() {
    const agent = new ConfigurationManagementAgent({
        environment: 'dev',
        enableDriftDetection: true
    });

    // Validate configuration consistency
    const validation = await agent.validateConfiguration('dev');

    if (validation.driftDetected) {
        console.warn('Configuration drift detected:');
        console.warn(validation.driftDetails);
    }

    // Get configuration diff
    const diff = await agent.getConfigurationDiff('expected-config.json', 'actual-config.json');
    console.log('Configuration differences:', diff);
}

// Example 4: Multi-environment deployment
async function multiEnvironmentExample() {
    const agent = new ConfigurationManagementAgent({
        enableSecretRotation: true
    });

    // Deploy to multiple environments
    for (const env of ['dev', 'staging', 'production']) {
        console.log(`\nValidating ${env} environment...`);

        const validation = await agent.validateEnvironment(env);

        if (!validation.valid) {
            console.error(`${env} validation failed:`, validation.errors);
            continue;
        }

        console.log(`${env} environment validated successfully`);
    }
}

// Example 5: Secret rotation
async function secretRotationExample() {
    const agent = new ConfigurationManagementAgent({
        environment: 'dev',
        enableSecretRotation: true,
        secretRotationInterval: 86400000 // 24 hours
    });

    // Check secret rotation status
    const rotationStatus = await agent.getSecretRotationStatus();
    console.log('Secrets requiring rotation:', rotationStatus.needsRotation);

    // Manually trigger rotation for a specific secret
    await agent.rotateSecret('database/password', 'dev');
    console.log('Secret rotated successfully');
}

// Run examples (uncomment to test)
if (require.main === module) {
    console.log('Configuration Management Agent - Examples\n');
    console.log('='.repeat(50));
    console.log('\nIMPORTANT: Update the configuration values before running!\n');
    console.log('See the example functions for patterns on how to:');
    console.log('  1. Use environment variables');
    console.log('  2. Load from config files');
    console.log('  3. Integrate with AWS Secrets Manager');
    console.log('  4. Validate configurations');
    console.log('  5. Detect configuration drift');
    console.log('\n' + '='.repeat(50));

    // Uncomment to run:
    // basicExample().catch(console.error);
    // environmentVariableExample().catch(console.error);
    // driftDetectionExample().catch(console.error);
    // multiEnvironmentExample().catch(console.error);
    // secretRotationExample().catch(console.error);
}

module.exports = {
    basicExample,
    environmentVariableExample,
    driftDetectionExample,
    multiEnvironmentExample,
    secretRotationExample
};
