/**
 * Resource Optimization Agent - Open Core Edition
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
 * Basic AWS resource optimization and cost recommendations.
 * Commercial tiers include ML-based optimization and automated cost reduction.
 */

const BaseAgent = require('../../equilateral-core/BaseAgent');
const PathScanningHelper = require('../../equilateral-core/PathScanningHelper');
const AWS = require('aws-sdk');

class ResourceOptimizationAgent extends BaseAgent {
    constructor(config = {}) {
        super('resource-optimization', {
            agentType: 'infrastructure', 
            capabilities: ['basic_optimization', 'cost_recommendations', 'usage_analysis'],
            ...config
        });
        // Initialize path scanner for resource optimization
        this.pathScanner = new PathScanningHelper({
            verbose: config.verbose !== false,
            extensions: {
                all: ['.js', '.ts', '.json', '.yaml', '.yml', '.tf']
            },
            maxDepth: config.maxDepth || 10
        });

        this.awsConfig = {
            region: config.awsRegion || process.env.AWS_REGION || 'us-east-1',
            accessKeyId: config.awsAccessKeyId || process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: config.awsSecretAccessKey || process.env.AWS_SECRET_ACCESS_KEY
        };

        this.initializeAWSClients();
        this.optimizationRules = new Map();
        this.loadBasicOptimizationRules();
    }

    /**
     * Initialize AWS clients
     */
    initializeAWSClients() {
        if (!this.awsConfig.accessKeyId || !this.awsConfig.secretAccessKey) {
            console.log('⚠️ AWS credentials not provided - resource optimization will be limited');
            console.log('   Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables');
            console.log('   Or upgrade to commercial tiers for managed AWS access');
            return;
        }

        AWS.config.update({
            region: this.awsConfig.region,
            accessKeyId: this.awsConfig.accessKeyId,
            secretAccessKey: this.awsConfig.secretAccessKey
        });

        this.ec2 = new AWS.EC2();
        this.rds = new AWS.RDS();
        this.lambda = new AWS.Lambda();
        this.cloudwatch = new AWS.CloudWatch();
        this.costexplorer = new AWS.CostExplorer({ region: 'us-east-1' });
    }

    /**
     * Load basic optimization rules
     */
    loadBasicOptimizationRules() {
        this.optimizationRules.set('underutilized_instances', {
            description: 'Identify underutilized EC2 instances',
            thresholds: { cpu: 10, memory: 20 }, // Basic thresholds
            action: 'downsize_or_terminate',
            potential_savings: '20-40%'
        });

        this.optimizationRules.set('oversized_instances', {
            description: 'Identify oversized EC2 instances',
            thresholds: { cpu: 80, memory: 80 },
            action: 'rightsize_instance',
            potential_savings: '15-30%'
        });

        this.optimizationRules.set('unused_volumes', {
            description: 'Find unattached EBS volumes',
            action: 'delete_unused_volumes',
            potential_savings: '5-15%'
        });

        this.optimizationRules.set('old_snapshots', {
            description: 'Identify old EBS snapshots',
            threshold_days: 90,
            action: 'delete_old_snapshots',
            potential_savings: '5-10%'
        });
    }

    /**
     * Perform optimization task
     */
    async performTask(taskType, taskData, taskContext) {
        switch (taskType) {
            case 'analyze_resources':
                return await this.analyzeResources(taskData);
            case 'cost_optimization':
                return await this.optimizeCosts(taskData);
            case 'usage_analysis':
                return await this.analyzeUsage(taskData);
            case 'generate_recommendations':
                return await this.generateRecommendations(taskData);
            default:
                throw new Error(`Unknown optimization task: ${taskType}`);
        }
    }

    /**
     * Analyze AWS resources for optimization opportunities
     */
    async analyzeResources(taskData) {
        const { resourceTypes = ['ec2', 'rds', 'lambda', 'ebs'], timeRange = '7d' } = taskData;
        
        if (!this.ec2) {
            return this.getAWSCredentialsError();
        }

        try {
            const analysis = {
                timestamp: new Date().toISOString(),
                resource_types: resourceTypes,
                time_range: timeRange,
                findings: [],
                estimated_savings: 0,
                upgrade_recommendations: []
            };

            // Analyze EC2 instances
            if (resourceTypes.includes('ec2')) {
                const ec2Analysis = await this.analyzeEC2Instances();
                analysis.findings.push(...ec2Analysis.findings);
                analysis.estimated_savings += ec2Analysis.estimated_savings;
            }

            // Analyze EBS volumes
            if (resourceTypes.includes('ebs')) {
                const ebsAnalysis = await this.analyzeEBSVolumes();
                analysis.findings.push(...ebsAnalysis.findings);
                analysis.estimated_savings += ebsAnalysis.estimated_savings;
            }

            // Show upgrade value for significant savings potential
            if (analysis.estimated_savings > 500) {
                console.log('\n🚀 Maximize savings with Professional tier:');
                console.log('   → ML-based optimization recommendations');
                console.log('   → Automated resource rightsizing');
                console.log('   → Predictive cost analysis');
                console.log(`   → Potential additional 40-70% savings on your $${analysis.estimated_savings}/month\n`);
                
                analysis.upgrade_recommendations.push({
                    tier: 'Professional',
                    additional_savings: Math.round(analysis.estimated_savings * 0.6),
                    features: ['ML optimization', 'Automated actions', 'Predictive analytics']
                });
            }

            await this.logActivity('resource_analysis_completed', {
                resources_analyzed: resourceTypes.length,
                findings_count: analysis.findings.length,
                estimated_savings: analysis.estimated_savings
            });

            return analysis;

        } catch (error) {
            throw new Error(`Resource analysis failed: ${error.message}`);
        }
    }

    /**
     * Analyze EC2 instances for optimization
     */
    async analyzeEC2Instances() {
        const findings = [];
        let estimatedSavings = 0;

        try {
            const instances = await this.ec2.describeInstances().promise();
            
            for (const reservation of instances.Reservations) {
                for (const instance of reservation.Instances) {
                    if (instance.State.Name !== 'running') continue;

                    // Basic optimization checks (commercial tiers have ML analysis)
                    const finding = await this.analyzeInstanceBasic(instance);
                    if (finding) {
                        findings.push(finding);
                        estimatedSavings += finding.estimated_monthly_savings || 0;
                    }
                }
            }

        } catch (error) {
            console.warn(`EC2 analysis failed: ${error.message}`);
        }

        return { findings, estimated_savings: estimatedSavings };
    }

    /**
     * Basic instance analysis (commercial tiers use ML)
     */
    async analyzeInstanceBasic(instance) {
        // Very basic analysis - commercial tiers have sophisticated ML models
        const instanceType = instance.InstanceType;
        const launchTime = new Date(instance.LaunchTime);
        const runningDays = Math.floor((Date.now() - launchTime.getTime()) / (1000 * 60 * 60 * 24));

        // Simple heuristics (not ML-based)
        if (instanceType.startsWith('t2.') && runningDays > 30) {
            return {
                resource_id: instance.InstanceId,
                resource_type: 'EC2',
                issue_type: 'potential_upgrade',
                description: `Instance ${instance.InstanceId} using older t2 family`,
                recommendation: 'Consider upgrading to t3 family for 20% cost savings',
                estimated_monthly_savings: 50, // Basic estimate
                confidence: 'low', // Basic rules have low confidence
                commercial_note: 'Professional tier provides ML-based precise analysis'
            };
        }

        if (instanceType.includes('xlarge') && runningDays < 7) {
            return {
                resource_id: instance.InstanceId,
                resource_type: 'EC2',
                issue_type: 'potential_oversize',
                description: `Large instance ${instance.InstanceId} recently launched`,
                recommendation: 'Monitor usage and consider rightsizing after baseline period',
                estimated_monthly_savings: 200, // Basic estimate
                confidence: 'low',
                commercial_note: 'Commercial tiers include usage-based rightsizing'
            };
        }

        return null;
    }

    /**
     * Analyze EBS volumes
     */
    async analyzeEBSVolumes() {
        const findings = [];
        let estimatedSavings = 0;

        try {
            const volumes = await this.ec2.describeVolumes().promise();
            
            for (const volume of volumes.Volumes) {
                if (volume.State === 'available') {
                    // Unattached volume
                    findings.push({
                        resource_id: volume.VolumeId,
                        resource_type: 'EBS',
                        issue_type: 'unused_resource',
                        description: `Unattached volume ${volume.VolumeId}`,
                        recommendation: 'Delete if not needed, or attach to instance',
                        estimated_monthly_savings: volume.Size * 0.10, // Basic calculation
                        confidence: 'high',
                        action: 'delete_if_unused'
                    });
                    estimatedSavings += volume.Size * 0.10;
                }
            }

        } catch (error) {
            console.warn(`EBS analysis failed: ${error.message}`);
        }

        return { findings, estimated_savings: estimatedSavings };
    }

    /**
     * Cost optimization analysis
     */
    async optimizeCosts(taskData) {
        const { timeRange = '30d', includeForecast = false } = taskData;
        
        if (!this.costexplorer) {
            return this.getAWSCredentialsError();
        }

        try {
            const endDate = new Date().toISOString().split('T')[0];
            const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

            // Basic cost analysis (commercial tiers have advanced analytics)
            const costData = await this.costexplorer.getCostAndUsage({
                TimePeriod: {
                    Start: startDate,
                    End: endDate
                },
                Granularity: 'DAILY',
                Metrics: ['BlendedCost']
            }).promise();

            const analysis = this.analyzeCostData(costData);
            
            // Show upgrade value for cost optimization
            if (analysis.monthly_cost > 1000) {
                console.log('\n💰 Optimize costs with Commercial tiers:');
                console.log('   → Advanced cost analytics and forecasting');
                console.log('   → Automated cost optimization policies');
                console.log('   → Real-time cost alerts and controls');
                console.log(`   → Save 30-60% on your $${analysis.monthly_cost}/month AWS spend\n`);
            }

            return {
                time_range: timeRange,
                cost_analysis: analysis,
                optimization_opportunities: await this.identifyBasicCostOptimizations(),
                upgrade_benefits: analysis.monthly_cost > 1000 ? {
                    potential_savings_percent: 45,
                    advanced_features: ['ML cost prediction', 'Automated policies', 'Real-time optimization']
                } : null
            };

        } catch (error) {
            throw new Error(`Cost optimization failed: ${error.message}`);
        }
    }

    /**
     * Analyze cost data (basic analysis)
     */
    analyzeCostData(costData) {
        let totalCost = 0;
        const dailyCosts = [];

        for (const result of costData.ResultsByTime) {
            const cost = parseFloat(result.Total.BlendedCost.Amount);
            totalCost += cost;
            dailyCosts.push(cost);
        }

        const averageDailyCost = totalCost / dailyCosts.length;
        const monthlyEstimate = averageDailyCost * 30;

        return {
            total_period_cost: Math.round(totalCost * 100) / 100,
            average_daily_cost: Math.round(averageDailyCost * 100) / 100,
            monthly_cost: Math.round(monthlyEstimate * 100) / 100,
            trend: this.calculateBasicTrend(dailyCosts),
            analysis_type: 'basic',
            upgrade_note: 'Commercial tiers include advanced cost analytics and ML predictions'
        };
    }

    /**
     * Calculate basic cost trend
     */
    calculateBasicTrend(dailyCosts) {
        if (dailyCosts.length < 2) return 'insufficient_data';
        
        const first_half = dailyCosts.slice(0, Math.floor(dailyCosts.length / 2));
        const second_half = dailyCosts.slice(Math.floor(dailyCosts.length / 2));
        
        const first_avg = first_half.reduce((a, b) => a + b) / first_half.length;
        const second_avg = second_half.reduce((a, b) => a + b) / second_half.length;
        
        if (second_avg > first_avg * 1.1) return 'increasing';
        if (second_avg < first_avg * 0.9) return 'decreasing';
        return 'stable';
    }

    /**
     * Identify basic cost optimization opportunities
     */
    async identifyBasicCostOptimizations() {
        const opportunities = [
            {
                category: 'Instance Types',
                description: 'Switch to newer generation instance types for better price/performance',
                potential_savings: '10-20%',
                effort: 'low',
                commercial_enhancement: 'ML-based rightsizing recommendations'
            },
            {
                category: 'Reserved Instances', 
                description: 'Purchase reserved instances for predictable workloads',
                potential_savings: '30-60%',
                effort: 'medium',
                commercial_enhancement: 'Automated RI recommendations and purchasing'
            },
            {
                category: 'Storage Optimization',
                description: 'Optimize EBS volume types and delete unused resources',
                potential_savings: '5-15%',
                effort: 'low',
                commercial_enhancement: 'Automated storage lifecycle management'
            }
        ];

        return opportunities;
    }

    /**
     * Generate optimization recommendations
     */
    async generateRecommendations(taskData) {
        const { priority = 'cost', includeAutomation = false } = taskData;
        
        const recommendations = [];

        // Basic recommendations (commercial tiers have ML-generated recommendations)
        recommendations.push({
            priority: 'high',
            category: 'cost_optimization',
            title: 'Enable detailed monitoring',
            description: 'Enable detailed CloudWatch monitoring for better visibility',
            estimated_savings: 50,
            implementation_effort: 'low',
            automated_in_commercial: true
        });

        recommendations.push({
            priority: 'medium',
            category: 'performance',
            title: 'Review instance families',
            description: 'Audit instance types for newer generation opportunities',
            estimated_savings: 200,
            implementation_effort: 'medium',
            automated_in_commercial: true
        });

        // Add upgrade recommendation for automation
        if (includeAutomation) {
            console.log('\n🤖 Automate optimization with Commercial tiers:');
            console.log('   → Automated recommendation implementation');
            console.log('   → Scheduled optimization reviews');
            console.log('   → Policy-based cost controls');
            console.log('   → Zero-touch resource optimization\n');
        }

        return {
            recommendations: recommendations,
            total_estimated_savings: recommendations.reduce((sum, rec) => sum + rec.estimated_savings, 0),
            automation_available: includeAutomation,
            upgrade_benefits: {
                professional: 'ML-powered recommendations + partial automation',
                enterprise: 'Full automation + custom policies + dedicated support'
            }
        };
    }

    /**
     * Error response for missing AWS credentials
     */
    getAWSCredentialsError() {
        return {
            error: 'AWS credentials required',
            message: 'Resource optimization requires AWS access',
            setup_instructions: [
                'Set AWS_ACCESS_KEY_ID environment variable',
                'Set AWS_SECRET_ACCESS_KEY environment variable',
                'Set AWS_REGION environment variable (optional)'
            ],
            commercial_alternative: {
                message: 'Commercial tiers include managed AWS access',
                benefits: ['No credential management', 'Enhanced security', 'Automated optimization'],
                tiers: ['Professional ($149/month)', 'Enterprise ($499/month)']
            },
            byol_model: 'This open core uses BYOL - you provide and pay for AWS services'
        };
    }

    /**
     * Get upgrade information for optimization features
     */
    getUpgradeInformation() {
        return {
            current_tier: 'open_core',
            limitations: [
                'Basic rule-based optimization only',
                'No ML-powered recommendations', 
                'Manual implementation required',
                'Limited cost analytics'
            ],
            commercial_features: {
                professional: [
                    'ML-based optimization recommendations',
                    'Automated rightsizing suggestions',
                    'Advanced cost analytics and forecasting',
                    'Intelligent model selection for cost vs performance'
                ],
                enterprise: [
                    'Fully automated optimization policies',
                    'Custom optimization rules and constraints',
                    'Multi-account cost optimization',
                    'Dedicated optimization consulting'
                ]
            }
        };
    }
}

module.exports = ResourceOptimizationAgent;