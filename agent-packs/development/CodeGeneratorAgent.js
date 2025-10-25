/**
 * Code Generator Agent - Open Core Edition
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
 * Basic code generation using templates and user-provided LLM endpoints.
 * Commercial tiers include intelligent code generation with advanced patterns.
 * BYOL Model: User provides LLM API key/endpoint, or uses free models
 */

const BaseAgent = require('../../equilateral-core/BaseAgent');
const PathScanningHelper = require('../../equilateral-core/PathScanningHelper');
const axios = require('axios');

class CodeGeneratorAgent extends BaseAgent {
    constructor(config = {}) {
        super('code-generator', {
            agentType: 'development',
            capabilities: ['template_generation', 'boilerplate_creation', 'basic_code_generation'],
            ...config
        });
        // Initialize path scanner for code generation
        this.pathScanner = new PathScanningHelper({
            verbose: config.verbose !== false,
            extensions: {
                javascript: ['.js', '.jsx', '.mjs', '.cjs'],
                typescript: ['.ts', '.tsx']
            },
            maxDepth: config.maxDepth || 10
        });
        
        // BYOL Configuration
        this.llmConfig = {
            endpoint: config.llmEndpoint || process.env.USER_LLM_ENDPOINT,
            apiKey: config.llmApiKey || process.env.USER_LLM_API_KEY,
            model: config.llmModel || process.env.USER_LLM_MODEL || 'free-tier-model',
            useFreeModel: !config.llmEndpoint && !process.env.USER_LLM_ENDPOINT
        };
        
        this.templates = new Map();
        this.loadBasicTemplates();
    }

    /**
     * Load basic code templates (no intelligence, just templates)
     */
    loadBasicTemplates() {
        this.templates.set('react-component', {
            pattern: `import React from 'react';

const {{componentName}} = ({{props}}) => {
    return (
        <div className="{{className}}">
            {{content}}
        </div>
    );
};

export default {{componentName}};`,
            variables: ['componentName', 'props', 'className', 'content']
        });

        this.templates.set('express-route', {
            pattern: `const express = require('express');
const router = express.Router();

// {{description}}
router.{{method}}('{{path}}', async (req, res) => {
    try {
        {{routeLogic}}
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;`,
            variables: ['description', 'method', 'path', 'routeLogic']
        });

        this.templates.set('aws-lambda', {
            pattern: `exports.handler = async (event, context) => {
    try {
        console.log('Event:', JSON.stringify(event, null, 2));
        
        {{lambdaLogic}}
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: '{{functionName}} executed successfully',
                requestId: context.awsRequestId
            })
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};`,
            variables: ['lambdaLogic', 'functionName']
        });
    }

    /**
     * Perform task - basic code generation
     */
    async performTask(taskType, taskData, taskContext) {
        switch (taskType) {
            case 'generate_from_template':
                return await this.generateFromTemplate(taskData);
            case 'generate_boilerplate':
                return await this.generateBoilerplate(taskData);
            case 'validate_standards':
                return await this.validateBasicStandards(taskData);
            case 'generate_with_llm':
                return await this.generateWithLLM(taskData);
            default:
                throw new Error(`Unknown task type: ${taskType}`);
        }
    }

    /**
     * Generate code from basic templates
     */
    async generateFromTemplate(taskData) {
        const { templateType, variables = {} } = taskData;
        
        if (!this.templates.has(templateType)) {
            throw new Error(`Template not found: ${templateType}`);
        }

        const template = this.templates.get(templateType);
        let code = template.pattern;

        // Simple variable substitution
        for (const [key, value] of Object.entries(variables)) {
            const regex = new RegExp(`{{${key}}}`, 'g');
            code = code.replace(regex, value || `// TODO: Replace ${key}`);
        }

        // Log generation
        await this.logActivity('code_generated_from_template', {
            template_type: templateType,
            variables: variables,
            code_length: code.length
        });

        return {
            generated_code: code,
            template_type: templateType,
            variables_used: Object.keys(variables),
            method: 'template_substitution'
        };
    }

    /**
     * Generate project boilerplate
     */
    async generateBoilerplate(taskData) {
        const { projectType, projectName, features = [] } = taskData;
        
        const boilerplates = {
            'node-express': {
                files: [
                    { name: 'package.json', template: 'package-json' },
                    { name: 'app.js', template: 'express-app' },
                    { name: 'routes/index.js', template: 'express-route' }
                ]
            },
            'react-app': {
                files: [
                    { name: 'src/App.js', template: 'react-component' },
                    { name: 'src/components/Header.js', template: 'react-component' },
                    { name: 'package.json', template: 'react-package-json' }
                ]
            },
            'aws-lambda': {
                files: [
                    { name: 'index.js', template: 'aws-lambda' },
                    { name: 'package.json', template: 'lambda-package-json' }
                ]
            }
        };

        if (!boilerplates[projectType]) {
            throw new Error(`Boilerplate not supported: ${projectType}`);
        }

        const generatedFiles = [];
        const boilerplate = boilerplates[projectType];

        for (const file of boilerplate.files) {
            const code = await this.generateFromTemplate({
                templateType: file.template,
                variables: { 
                    projectName,
                    ...taskData.variables
                }
            });

            generatedFiles.push({
                filename: file.name,
                content: code.generated_code
            });
        }

        await this.logActivity('boilerplate_generated', {
            project_type: projectType,
            project_name: projectName,
            files_generated: generatedFiles.length,
            features: features
        });

        return {
            project_type: projectType,
            project_name: projectName,
            files: generatedFiles,
            method: 'boilerplate_generation'
        };
    }

    /**
     * Basic code standards validation (no intelligence)
     */
    async validateBasicStandards(taskData) {
        const { code, language = 'javascript' } = taskData;
        const issues = [];

        // Basic validation rules (no intelligence)
        if (language === 'javascript') {
            if (!code.includes('try')) {
                issues.push({ type: 'missing_error_handling', message: 'Consider adding error handling' });
            }
            if (code.includes('var ')) {
                issues.push({ type: 'deprecated_syntax', message: 'Use let/const instead of var' });
            }
            if (!code.includes('//') && !code.includes('/*')) {
                issues.push({ type: 'missing_comments', message: 'Consider adding comments' });
            }
        }

        await this.logActivity('standards_validation', {
            language: language,
            code_length: code.length,
            issues_found: issues.length
        });

        return {
            language: language,
            issues: issues,
            passed: issues.length === 0,
            method: 'basic_rule_validation'
        };
    }

    /**
     * Generate code using user-provided LLM (BYOL model)
     */
    async generateWithLLM(taskData) {
        const { prompt, codeType = 'javascript', context = {} } = taskData;

        if (this.llmConfig.useFreeModel) {
            // Use free/basic model with limited capabilities
            return await this.generateWithFreeModel(prompt, codeType, context);
        }

        if (!this.llmConfig.endpoint || !this.llmConfig.apiKey) {
            throw new Error('LLM endpoint and API key required for advanced code generation. Configure USER_LLM_ENDPOINT and USER_LLM_API_KEY environment variables.');
        }

        try {
            const llmPrompt = this.buildCodeGenerationPrompt(prompt, codeType, context);
            
            const response = await axios.post(this.llmConfig.endpoint, {
                model: this.llmConfig.model,
                messages: [{ role: 'user', content: llmPrompt }],
                max_tokens: 2000,
                temperature: 0.3
            }, {
                headers: {
                    'Authorization': `Bearer ${this.llmConfig.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            const generatedCode = response.data.choices[0].message.content;

            await this.logActivity('llm_code_generation', {
                prompt_length: prompt.length,
                code_type: codeType,
                model: this.llmConfig.model,
                generated_length: generatedCode.length,
                user_provided_llm: true
            });

            return {
                generated_code: generatedCode,
                code_type: codeType,
                method: 'user_llm_generation',
                model_used: this.llmConfig.model,
                byol: true
            };

        } catch (error) {
            throw new Error(`LLM code generation failed: ${error.message}`);
        }
    }

    /**
     * Generate with free model (limited capabilities)
     */
    async generateWithFreeModel(prompt, codeType, context) {
        // Simulate basic free model - just template matching
        const templates = Array.from(this.templates.keys());
        const matchedTemplate = templates.find(t => 
            prompt.toLowerCase().includes(t.replace('-', ' '))
        );

        if (matchedTemplate) {
            return await this.generateFromTemplate({
                templateType: matchedTemplate,
                variables: { 
                    ...context,
                    generatedFromPrompt: prompt.substring(0, 50)
                }
            });
        }

        // Basic code structure generation
        const basicCode = `// Generated from prompt: ${prompt}
// Note: Using free tier - upgrade to commercial tier for advanced code generation

const ${context.functionName || 'generatedFunction'} = () => {
    // TODO: Implement logic based on: ${prompt}
    console.log('Generated with free model');
    return { success: true };
};`;

        await this.logActivity('free_model_generation', {
            prompt_length: prompt.length,
            code_type: codeType,
            method: 'free_template_matching'
        });

        return {
            generated_code: basicCode,
            code_type: codeType,
            method: 'free_model_generation',
            limitation_notice: 'Upgrade to Professional tier for advanced LLM-powered code generation',
            upgrade_available: true
        };
    }

    /**
     * Build LLM prompt for code generation
     */
    buildCodeGenerationPrompt(userPrompt, codeType, context) {
        return `Generate ${codeType} code for the following requirement:

${userPrompt}

Context: ${JSON.stringify(context, null, 2)}

Requirements:
- Use best practices for ${codeType}
- Include error handling
- Add appropriate comments
- Follow clean code principles

Generate only the code, no explanations.`;
    }

    /**
     * Add new template (for extensibility)
     */
    addTemplate(name, pattern, variables) {
        this.templates.set(name, { pattern, variables });
        console.log(`Added template: ${name}`);
    }

    /**
     * Get available templates
     */
    getAvailableTemplates() {
        const templateList = Array.from(this.templates.keys()).map(key => ({
            name: key,
            variables: this.templates.get(key).variables
        }));

        return {
            templates: templateList,
            count: templateList.length,
            byol_llm_configured: !this.llmConfig.useFreeModel,
            upgrade_available: this.llmConfig.useFreeModel
        };
    }
}

module.exports = CodeGeneratorAgent;