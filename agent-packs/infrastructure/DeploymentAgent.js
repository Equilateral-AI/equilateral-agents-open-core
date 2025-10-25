/**
 * Deployment Agent - Open Core Edition
 *
 * MIT License
 * Copyright (c) 2025 HappyHippo.ai
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * EquilateralAgents™ is a trademark of HappyHippo.ai
 *
 * Basic AWS deployment capabilities using user-provided credentials.
 * Commercial tiers include intelligent cost optimization and advanced deployment strategies.
 * BYOL Model: User provides AWS credentials and deployment configurations
 */

const BaseAgent = require('../../equilateral-core/BaseAgent');
const PathScanningHelper = require('../../equilateral-core/PathScanningHelper');
const AWS = require('aws-sdk');

class DeploymentAgent extends BaseAgent {
    constructor(config = {}) {
        super('deployment-agent', {
            agentType: 'infrastructure',
            capabilities: ['aws_deploy', 'basic_validation', 'simple_rollback', 'cost_estimation'],
            ...config
        });
        // Initialize path scanner for deployment
        this.pathScanner = new PathScanningHelper({
            verbose: config.verbose !== false,
            extensions: {
                all: ['.js', '.ts', '.json', '.yaml', '.yml']
            },
            maxDepth: config.maxDepth || 10
        });

        // BYOL AWS Configuration
        this.awsConfig = {
            region: config.awsRegion || process.env.AWS_REGION || 'us-east-1',
            accessKeyId: config.awsAccessKeyId || process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: config.awsSecretAccessKey || process.env.AWS_SECRET_ACCESS_KEY,
            useInstanceProfile: !config.awsAccessKeyId && !process.env.AWS_ACCESS_KEY_ID
        };

        this.initializeAWSClients();
        this.deploymentTemplates = new Map();
        this.loadBasicTemplates();
    }

    /**
     * Initialize AWS clients with user-provided credentials
     */
    initializeAWSClients() {
        const awsConfig = {
            region: this.awsConfig.region
        };

        if (!this.awsConfig.useInstanceProfile) {
            if (!this.awsConfig.accessKeyId || !this.awsConfig.secretAccessKey) {
                throw new Error('AWS credentials required. Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables.');
            }
            
            awsConfig.accessKeyId = this.awsConfig.accessKeyId;
            awsConfig.secretAccessKey = this.awsConfig.secretAccessKey;
        }

        AWS.config.update(awsConfig);

        this.cloudformation = new AWS.CloudFormation();
        this.lambda = new AWS.Lambda();
        this.s3 = new AWS.S3();
        this.apigateway = new AWS.APIGateway();
        this.pricing = new AWS.Pricing({ region: 'us-east-1' }); // Pricing API only in us-east-1
    }

    /**
     * Load basic deployment templates
     */
    loadBasicTemplates() {
        this.deploymentTemplates.set('lambda-function', {
            template: {
                AWSTemplateFormatVersion: '2010-09-09',
                Description: 'Basic Lambda function deployment',
                Parameters: {
                    FunctionName: { Type: 'String', Default: 'MyLambdaFunction' },
                    Runtime: { Type: 'String', Default: 'nodejs18.x' }
                },
                Resources: {
                    LambdaFunction: {
                        Type: 'AWS::Lambda::Function',
                        Properties: {
                            FunctionName: { Ref: 'FunctionName' },
                            Runtime: { Ref: 'Runtime' },
                            Handler: 'index.handler',
                            Role: { 'Fn::GetAtt': ['LambdaExecutionRole', 'Arn'] },
                            Code: { ZipFile: 'exports.handler = async (event) => ({ statusCode: 200, body: "Hello World" });' }
                        }
                    },
                    LambdaExecutionRole: {
                        Type: 'AWS::IAM::Role',
                        Properties: {
                            AssumeRolePolicyDocument: {
                                Version: '2012-10-17',
                                Statement: [{
                                    Effect: 'Allow',
                                    Principal: { Service: 'lambda.amazonaws.com' },
                                    Action: 'sts:AssumeRole'
                                }]
                            },
                            ManagedPolicyArns: ['arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole']
                        }
                    }
                }
            },
            estimatedCost: 5.0, // Basic monthly estimate
            deploymentTime: 300 // 5 minutes
        });

        this.deploymentTemplates.set('s3-static-site', {
            template: {
                AWSTemplateFormatVersion: '2010-09-09',
                Description: 'Basic S3 static website',
                Parameters: {
                    BucketName: { Type: 'String' }
                },
                Resources: {
                    S3Bucket: {
                        Type: 'AWS::S3::Bucket',
                        Properties: {
                            BucketName: { Ref: 'BucketName' },
                            WebsiteConfiguration: {
                                IndexDocument: 'index.html',
                                ErrorDocument: 'error.html'
                            },
                            PublicReadPolicy: {
                                Version: '2012-10-17',
                                Statement: [{
                                    Effect: 'Allow',
                                    Principal: '*',
                                    Action: 's3:GetObject',
                                    Resource: { 'Fn::Sub': '${S3Bucket}/*' }
                                }]
                            }
                        }
                    }
                }
            },
            estimatedCost: 2.0,
            deploymentTime: 120
        });
    }

    /**
     * Perform deployment task
     */
    async performTask(taskType, taskData, taskContext) {
        switch (taskType) {
            case 'deploy':
                return await this.deployStack(taskData);
            case 'validate_template':
                return await this.validateTemplate(taskData);
            case 'cost_analysis':
                return await this.performCostAnalysis(taskData);
            case 'rollback':
                return await this.rollbackDeployment(taskData);
            case 'health_check':
                return await this.performHealthCheck(taskData);
            default:
                throw new Error(`Unknown deployment task: ${taskType}`);
        }
    }

    /**
     * Deploy CloudFormation stack
     */
    async deployStack(taskData) {
        const { 
            stackName, 
            templateType, 
            parameters = {}, 
            environment = 'development',
            dryRun = false 
        } = taskData;

        try {
            // Get template
            const template = this.getDeploymentTemplate(templateType);
            if (!template) {
                throw new Error(`Template not found: ${templateType}`);
            }

            // Validate template first
            const validationResult = await this.validateCloudFormationTemplate(template.template);
            if (!validationResult.valid) {
                throw new Error(`Template validation failed: ${validationResult.error}`);
            }

            // Perform cost analysis
            const costAnalysis = await this.estimateDeploymentCost(template, parameters);

            // Check if this is a dry run
            if (dryRun) {
                return {
                    action: 'dry_run',
                    stack_name: stackName,
                    template_type: templateType,
                    validation: validationResult,
                    cost_analysis: costAnalysis,
                    deployment_time_estimate: template.deploymentTime,
                    would_deploy: true
                };
            }

            // Check if stack exists
            const stackExists = await this.checkStackExists(stackName);
            const operation = stackExists ? 'UPDATE' : 'CREATE';

            // Deploy stack
            const deployParams = {
                StackName: stackName,
                TemplateBody: JSON.stringify(template.template),
                Parameters: this.formatCloudFormationParameters(parameters),
                Capabilities: ['CAPABILITY_IAM'],
                Tags: [
                    { Key: 'Environment', Value: environment },
                    { Key: 'DeployedBy', Value: 'EquilateralAgents' },
                    { Key: 'TenantId', Value: this.tenantId }
                ]
            };

            let result;
            if (operation === 'CREATE') {
                result = await this.cloudformation.createStack(deployParams).promise();
            } else {
                result = await this.cloudformation.updateStack(deployParams).promise();
            }

            // Wait for deployment completion
            const finalStatus = await this.waitForStackCompletion(stackName, operation);

            await this.logActivity('deployment_completed', {
                stack_name: stackName,
                operation: operation,
                status: finalStatus,
                template_type: templateType,
                cost_estimate: costAnalysis.estimated_monthly_cost
            });

            return {
                action: 'deployed',
                stack_name: stackName,
                operation: operation,
                stack_id: result.StackId,
                status: finalStatus,
                template_type: templateType,
                cost_analysis: costAnalysis,
                validation: validationResult,
                deployment_time: template.deploymentTime
            };

        } catch (error) {
            throw new Error(`Deployment failed: ${error.message}`);
        }
    }

    /**
     * Validate CloudFormation template
     */
    async validateCloudFormationTemplate(template) {
        try {
            const result = await this.cloudformation.validateTemplate({
                TemplateBody: JSON.stringify(template)
            }).promise();

            return {
                valid: true,
                description: result.Description,
                parameters: result.Parameters || [],
                capabilities: result.Capabilities || []
            };
        } catch (error) {
            return {
                valid: false,
                error: error.message
            };
        }
    }

    /**
     * Perform basic cost analysis
     */
    async performCostAnalysis(taskData) {
        const { templateType, parameters = {}, environment = 'development' } = taskData;
        
        const template = this.getDeploymentTemplate(templateType);
        if (!template) {
            throw new Error(`Template not found: ${templateType}`);
        }

        const costAnalysis = await this.estimateDeploymentCost(template, parameters);
        
        // Apply environment-specific cost controls
        const costLimits = this.getEnvironmentCostLimits(environment);
        const withinLimits = costAnalysis.estimated_monthly_cost <= costLimits.monthly_limit;

        await this.logActivity('cost_analysis_performed', {
            template_type: templateType,
            environment: environment,
            estimated_cost: costAnalysis.estimated_monthly_cost,
            within_limits: withinLimits,
            cost_limit: costLimits.monthly_limit
        });

        return {
            template_type: templateType,
            environment: environment,
            cost_analysis: costAnalysis,
            cost_limits: costLimits,
            within_limits: withinLimits,
            recommendation: this.getCostRecommendation(costAnalysis, environment)
        };
    }

    /**
     * Estimate deployment cost (basic estimation)
     */
    async estimateDeploymentCost(template, parameters) {
        // Basic cost estimation (commercial tiers have ML-based precise estimation)
        const baseCost = template.estimatedCost || 10.0;
        
        // Simple scaling based on parameters
        let scalingFactor = 1.0;
        if (parameters.InstanceType === 't3.medium') scalingFactor = 1.5;
        if (parameters.InstanceType === 't3.large') scalingFactor = 2.0;

        const estimatedMonthlyCost = baseCost * scalingFactor;

        return {
            base_cost: baseCost,
            scaling_factor: scalingFactor,
            estimated_monthly_cost: estimatedMonthlyCost,
            currency: 'USD',
            estimation_method: 'basic_template_based',
            upgrade_note: 'Commercial tiers include ML-based precise cost estimation'
        };
    }

    /**
     * Basic rollback functionality
     */
    async rollbackDeployment(taskData) {
        const { stackName, targetVersion } = taskData;

        try {
            // Get stack events to find previous version
            const events = await this.cloudformation.describeStackEvents({
                StackName: stackName
            }).promise();

            // Simple rollback - just delete current stack if creation, or update to previous
            const stackStatus = await this.getStackStatus(stackName);
            
            if (stackStatus.includes('CREATE')) {
                // If stack was created, delete it
                await this.cloudformation.deleteStack({ StackName: stackName }).promise();
                const finalStatus = await this.waitForStackCompletion(stackName, 'DELETE');
                
                return {
                    action: 'rollback_delete',
                    stack_name: stackName,
                    status: finalStatus
                };
            } else {
                // For updates, this would require more sophisticated version tracking
                throw new Error('Update rollback requires commercial tier for version management');
            }

        } catch (error) {
            throw new Error(`Rollback failed: ${error.message}`);
        }
    }

    /**
     * Perform health check on deployed resources
     */
    async performHealthCheck(taskData) {
        const { stackName } = taskData;
        
        try {
            // Get stack resources
            const resources = await this.cloudformation.listStackResources({
                StackName: stackName
            }).promise();

            const healthChecks = [];
            
            for (const resource of resources.StackResourceSummaries) {
                let healthStatus = 'unknown';
                
                try {
                    switch (resource.ResourceType) {
                        case 'AWS::Lambda::Function':
                            healthStatus = await this.checkLambdaHealth(resource.PhysicalResourceId);
                            break;
                        case 'AWS::S3::Bucket':
                            healthStatus = await this.checkS3Health(resource.PhysicalResourceId);
                            break;
                        default:
                            healthStatus = resource.ResourceStatus === 'CREATE_COMPLETE' ? 'healthy' : 'unhealthy';
                    }
                } catch (err) {
                    healthStatus = 'error';
                }

                healthChecks.push({
                    resource_type: resource.ResourceType,
                    resource_id: resource.PhysicalResourceId,
                    status: resource.ResourceStatus,
                    health: healthStatus
                });
            }

            const overallHealth = healthChecks.every(hc => hc.health === 'healthy') ? 'healthy' : 'degraded';

            return {
                stack_name: stackName,
                overall_health: overallHealth,
                resource_health: healthChecks,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            throw new Error(`Health check failed: ${error.message}`);
        }
    }

    /**
     * Helper methods
     */
    getDeploymentTemplate(templateType) {
        return this.deploymentTemplates.get(templateType);
    }

    async checkStackExists(stackName) {
        try {
            await this.cloudformation.describeStacks({ StackName: stackName }).promise();
            return true;
        } catch (error) {
            return false;
        }
    }

    formatCloudFormationParameters(parameters) {
        return Object.entries(parameters).map(([key, value]) => ({
            ParameterKey: key,
            ParameterValue: String(value)
        }));
    }

    async waitForStackCompletion(stackName, operation, timeoutMinutes = 30) {
        const completionStates = {
            'CREATE': ['CREATE_COMPLETE', 'CREATE_FAILED'],
            'UPDATE': ['UPDATE_COMPLETE', 'UPDATE_FAILED'],
            'DELETE': ['DELETE_COMPLETE', 'DELETE_FAILED']
        };

        const targetStates = completionStates[operation];
        const timeout = Date.now() + (timeoutMinutes * 60 * 1000);

        while (Date.now() < timeout) {
            try {
                const status = await this.getStackStatus(stackName);
                if (targetStates.includes(status)) {
                    return status;
                }
                await this.sleep(30000); // Wait 30 seconds
            } catch (error) {
                if (operation === 'DELETE' && error.message.includes('does not exist')) {
                    return 'DELETE_COMPLETE';
                }
                throw error;
            }
        }

        throw new Error(`Stack operation timed out after ${timeoutMinutes} minutes`);
    }

    async getStackStatus(stackName) {
        const result = await this.cloudformation.describeStacks({ StackName: stackName }).promise();
        return result.Stacks[0].StackStatus;
    }

    getEnvironmentCostLimits(environment) {
        const limits = {
            'development': { monthly_limit: 20, warning_threshold: 15 },
            'staging': { monthly_limit: 50, warning_threshold: 40 },
            'production': { monthly_limit: 500, warning_threshold: 400 }
        };

        return limits[environment] || limits['development'];
    }

    getCostRecommendation(costAnalysis, environment) {
        const recommendations = [];
        
        if (costAnalysis.estimated_monthly_cost > this.getEnvironmentCostLimits(environment).warning_threshold) {
            recommendations.push('Consider optimizing resources for cost');
            recommendations.push('Review instance types and scaling policies');
        }

        if (environment === 'development' && costAnalysis.estimated_monthly_cost > 10) {
            recommendations.push('Use smaller instance types for development');
        }

        recommendations.push('Commercial tiers include intelligent cost optimization');

        return recommendations;
    }

    async checkLambdaHealth(functionName) {
        try {
            const result = await this.lambda.getFunction({ FunctionName: functionName }).promise();
            return result.Configuration.State === 'Active' ? 'healthy' : 'unhealthy';
        } catch (error) {
            return 'error';
        }
    }

    async checkS3Health(bucketName) {
        try {
            await this.s3.headBucket({ Bucket: bucketName }).promise();
            return 'healthy';
        } catch (error) {
            return 'error';
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Add custom deployment template
     */
    addDeploymentTemplate(name, template, estimatedCost = 10.0, deploymentTime = 300) {
        this.deploymentTemplates.set(name, {
            template,
            estimatedCost,
            deploymentTime
        });
        console.log(`Added deployment template: ${name}`);
    }

    /**
     * Get available templates
     */
    getAvailableTemplates() {
        const templates = Array.from(this.deploymentTemplates.keys()).map(key => ({
            name: key,
            estimated_cost: this.deploymentTemplates.get(key).estimatedCost,
            deployment_time: this.deploymentTemplates.get(key).deploymentTime
        }));

        return {
            templates,
            count: templates.length,
            aws_configured: !this.awsConfig.useInstanceProfile || !!process.env.AWS_REGION,
            upgrade_notes: [
                'Commercial tiers include advanced deployment strategies',
                'Professional tier includes intelligent cost optimization',
                'Enterprise tier includes blue-green deployments and canary releases'
            ]
        };
    }
}

module.exports = DeploymentAgent;