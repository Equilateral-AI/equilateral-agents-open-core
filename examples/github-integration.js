#!/usr/bin/env node

/**
 * GitHub Integration Example
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
 * Example showing GitHub Actions/PR integration with EquilateralAgents
 */

const { AgentOrchestrator } = require('../equilateral-core/AgentOrchestrator');
const CodeAnalyzerAgent = require('../agent-packs/development/CodeAnalyzerAgent');
const SecurityScannerAgent = require('../agent-packs/security/SecurityScannerAgent');

/**
 * GitHub-aware agent that can comment on PRs
 */
class GitHubCodeAnalyzerAgent extends CodeAnalyzerAgent {
    constructor(config = {}) {
        super({
            ...config,
            agentId: 'github-code-analyzer'
        });
        this.githubToken = config.githubToken || process.env.GITHUB_TOKEN;
        this.githubContext = config.githubContext || {};
    }

    async executeTask(task) {
        const result = await super.executeTask(task);

        // If running in GitHub Actions, add annotations
        if (process.env.GITHUB_ACTIONS) {
            this.createGitHubAnnotations(result);
        }

        // If PR context available, prepare comment
        if (this.githubContext.pull_request) {
            result.prComment = this.formatPRComment(result);
        }

        return result;
    }

    createGitHubAnnotations(result) {
        if (result.issues && result.issues.length > 0) {
            result.issues.forEach(issue => {
                const level = issue.severity === 'critical' ? 'error' : 'warning';
                console.log(`::${level} file=${issue.file},line=${issue.line || 1}::${issue.message}`);
            });
        }
    }

    formatPRComment(result) {
        let comment = `## 🤖 EquilateralAgents Code Analysis\n\n`;

        // Summary section
        comment += `### Summary\n`;
        comment += `- 📊 Files analyzed: ${result.fileCount || 1}\n`;
        comment += `- ⚠️ Issues found: ${result.summary?.totalIssues || 0}\n`;
        comment += `- 🚨 Critical: ${result.summary?.criticalIssues || 0}\n`;
        comment += `- 📝 Warnings: ${result.summary?.warnings || 0}\n\n`;

        // Issues detail
        if (result.issues && result.issues.length > 0) {
            comment += `### Issues\n\n`;
            result.issues.forEach(issue => {
                const emoji = issue.severity === 'critical' ? '🔴' : '🟡';
                comment += `${emoji} **${issue.file}** - ${issue.message}\n`;
            });
            comment += '\n';
        }

        // AI insights if available
        if (result.aiRecommendations) {
            comment += `### 🧠 AI Insights\n`;
            comment += `${result.aiRecommendations}\n\n`;
        }

        // Footer
        comment += `---\n`;
        comment += `*Analyzed by [EquilateralAgents](https://github.com/marketplace/equilateral-agents)*`;

        if (this.hasAI()) {
            comment += ` • *AI-Enhanced with ${this.llmProvider.provider}*`;
        }

        return comment;
    }
}

/**
 * Simulate GitHub Actions environment
 */
function setupGitHubEnvironment() {
    // These would normally be set by GitHub Actions
    if (!process.env.GITHUB_ACTIONS) {
        console.log('📋 Simulating GitHub Actions environment...\n');

        process.env.GITHUB_REPOSITORY = 'user/repo';
        process.env.GITHUB_SHA = 'abc123def456';
        process.env.GITHUB_REF = 'refs/pull/42/merge';
        process.env.GITHUB_EVENT_NAME = 'pull_request';

        // Simulated GitHub context
        return {
            pull_request: {
                number: 42,
                title: 'Add new feature',
                head: { sha: 'abc123' },
                base: { sha: 'def456' }
            },
            repository: {
                owner: 'user',
                name: 'repo'
            }
        };
    }

    // In real GitHub Actions, parse the event
    try {
        const eventPath = process.env.GITHUB_EVENT_PATH;
        return require(eventPath);
    } catch {
        return {};
    }
}

/**
 * Main GitHub integration demo
 */
async function runGitHubIntegration() {
    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║          EquilateralAgents™ GitHub Integration Demo          ║
║                    PR Analysis & Automation                   ║
╚═══════════════════════════════════════════════════════════════╝
`);

    // Setup GitHub environment
    const githubContext = setupGitHubEnvironment();

    // Show context
    console.log('🔧 GitHub Context:');
    console.log(`Repository: ${process.env.GITHUB_REPOSITORY}`);
    console.log(`Event: ${process.env.GITHUB_EVENT_NAME}`);
    if (githubContext.pull_request) {
        console.log(`PR #${githubContext.pull_request.number}: ${githubContext.pull_request.title}`);
    }
    console.log();

    // Create orchestrator with GitHub context
    const orchestrator = new AgentOrchestrator({
        projectPath: process.cwd(),
        metadata: {
            source: 'github',
            repository: process.env.GITHUB_REPOSITORY,
            sha: process.env.GITHUB_SHA,
            pr: githubContext.pull_request?.number
        }
    });

    // Register GitHub-aware agents
    const codeAnalyzer = new GitHubCodeAnalyzerAgent({
        githubContext,
        enableAI: !!process.env.LLM_PROVIDER
    });

    const securityScanner = new SecurityScannerAgent({
        enableAI: !!process.env.LLM_PROVIDER
    });

    orchestrator.registerAgent(codeAnalyzer);
    orchestrator.registerAgent(securityScanner);

    // Custom workflow for PRs
    orchestrator.getWorkflowDefinition = (type) => {
        if (type === 'pr-review') {
            return {
                tasks: [
                    {
                        agentId: 'github-code-analyzer',
                        taskType: 'analyze',
                        taskData: {
                            projectPath: './examples',
                            prNumber: githubContext.pull_request?.number
                        }
                    },
                    {
                        agentId: 'security-scanner',
                        taskType: 'scan',
                        taskData: {
                            projectPath: './examples',
                            reportFormat: 'github'
                        }
                    }
                ]
            };
        }
        return { tasks: [] };
    };

    // Start orchestrator
    await orchestrator.start();

    console.log('🚀 Running PR Review Workflow\n');

    try {
        const result = await orchestrator.executeWorkflow('pr-review');

        // Display results
        console.log('\n📊 Analysis Results:\n');
        console.log('═'.repeat(60));

        result.results.forEach(taskResult => {
            const agentResult = taskResult.result;

            // Show formatted PR comment
            if (agentResult.prComment) {
                console.log('\n📝 PR Comment Preview:');
                console.log('─'.repeat(60));
                console.log(agentResult.prComment);
                console.log('─'.repeat(60));
            }

            // Show GitHub annotations
            if (process.env.GITHUB_ACTIONS) {
                console.log('\n🏷️ GitHub Annotations created');
            }
        });

        // Simulate posting to GitHub API
        if (githubContext.pull_request) {
            console.log('\n💬 Would post comment to PR #' + githubContext.pull_request.number);
            console.log('   (In production, this would use GitHub API)\n');

            // Show API call example
            console.log('📡 Example API call:');
            console.log('```javascript');
            console.log(`await github.rest.issues.createComment({
  owner: '${githubContext.repository?.owner || 'user'}',
  repo: '${githubContext.repository?.name || 'repo'}',
  issue_number: ${githubContext.pull_request.number},
  body: prComment
});`);
            console.log('```\n');
        }

        // Set GitHub Actions outputs
        if (process.env.GITHUB_ACTIONS) {
            const summary = result.results[0].result.summary;
            console.log(`::set-output name=issues::${summary?.totalIssues || 0}`);
            console.log(`::set-output name=critical::${summary?.criticalIssues || 0}`);
            console.log(`::set-output name=warnings::${summary?.warnings || 0}`);
        }

    } catch (error) {
        console.error('❌ Workflow failed:', error.message);

        // Set failure in GitHub Actions
        if (process.env.GITHUB_ACTIONS) {
            console.log(`::error::${error.message}`);
            process.exit(1);
        }
    }

    await orchestrator.stop();

    // Show GitHub Actions usage
    console.log('\n📚 GitHub Actions Usage:');
    console.log('═'.repeat(60));
    console.log('Add to your workflow:');
    console.log();
    console.log('```yaml');
    console.log('- uses: equilateral-ai/agents-action@v1');
    console.log('  with:');
    console.log('    workflow-type: pr-review');
    console.log('    llm-provider: github  # or openai, anthropic');
    console.log('  env:');
    console.log('    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}');
    console.log('```\n');

    console.log('🔗 Links:');
    console.log('   • GitHub Marketplace: github.com/marketplace/equilateral-agents');
    console.log('   • Documentation: docs.equilateral.ai/github');
    console.log('   • Examples: github.com/equilateral-ai/examples\n');
}

// Export for testing
module.exports = {
    GitHubCodeAnalyzerAgent,
    setupGitHubEnvironment
};

// Run if executed directly
if (require.main === module) {
    runGitHubIntegration().catch(console.error);
}