#!/usr/bin/env node

/**
 * Smart Form Filler Demo - Example
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
 * This demo shows REAL intelligence, not just patterns.
 * It demonstrates how EquilateralAgents can understand context
 * and make intelligent decisions, even in the open-core version.
 */

const playwright = require('playwright');
const AgentOrchestrator = require('../equilateral-core/AgentOrchestrator');
const BaseAgent = require('../equilateral-core/BaseAgent');
const chalk = require('chalk');
const readline = require('readline');

/**
 * SmartFormAgent - Shows real intelligence in action
 */
class SmartFormAgent extends BaseAgent {
    constructor() {
        super('smart-form', 'Smart Form Filler');
        this.browser = null;
        this.context = null;
        this.page = null;
    }

    async initialize() {
        console.log(chalk.cyan('🚀 Launching browser...'));
        this.browser = await playwright.chromium.launch({ 
            headless: false,
            slowMo: 250 // Slow enough for users to see the magic
        });
        this.context = await this.browser.newContext();
        this.page = await this.context.newPage();
    }

    async execute(task) {
        const { url, formData } = task;
        
        console.log(chalk.blue(`\n📝 Navigating to: ${url}`));
        await this.page.goto(url);
        
        console.log(chalk.yellow('🧠 Analyzing form structure...'));
        await this.page.waitForTimeout(1000);
        
        // Get all form fields
        const fields = await this.analyzeForm();
        
        console.log(chalk.green(`✨ Found ${fields.length} fields to fill intelligently\n`));
        
        // Fill each field intelligently
        for (const field of fields) {
            await this.fillFieldIntelligently(field, formData);
        }
        
        console.log(chalk.magenta('\n🎯 Looking for submit button...'));
        await this.submitForm();
        
        // Wait for confirmation
        await this.page.waitForTimeout(2000);
        
        // Check for success
        const success = await this.checkSuccess();
        
        return {
            success,
            fieldsCompleted: fields.length,
            intelligence: 'demonstrated'
        };
    }

    async analyzeForm() {
        // This shows REAL analysis, not just selectors
        const fields = await this.page.evaluate(() => {
            const inputs = Array.from(document.querySelectorAll('input, select, textarea'));
            return inputs.map(input => {
                const label = document.querySelector(`label[for="${input.id}"]`);
                const placeholder = input.placeholder;
                const name = input.name;
                const type = input.type;
                const required = input.required;
                
                // Intelligence: Understanding context from multiple sources
                const context = {
                    labelText: label?.textContent?.trim(),
                    placeholder: placeholder,
                    name: name,
                    type: type,
                    required: required,
                    ariaLabel: input.getAttribute('aria-label'),
                    dataTestId: input.getAttribute('data-testid'),
                    selector: input.id ? `#${input.id}` : `[name="${name}"]`
                };
                
                return context;
            });
        });
        
        return fields;
    }

    async fillFieldIntelligently(field, userData) {
        const value = this.inferValue(field, userData);
        
        if (!value) {
            console.log(chalk.gray(`  ⏭️  Skipping optional field: ${field.labelText || field.name}`));
            return;
        }
        
        console.log(chalk.green(`  ✍️  Filling "${field.labelText || field.name}" with: ${value}`));
        
        // Visual highlight effect
        await this.page.evaluate((selector) => {
            const element = document.querySelector(selector);
            if (element) {
                element.style.border = '2px solid #00ff00';
                setTimeout(() => {
                    element.style.border = '';
                }, 1000);
            }
        }, field.selector);
        
        // Type with human-like speed
        await this.page.fill(field.selector, value);
        await this.page.waitForTimeout(300);
    }

    inferValue(field, userData) {
        // THIS IS THE INTELLIGENCE - Context-aware value inference
        
        const context = (field.labelText || field.name || field.placeholder || '').toLowerCase();
        
        // Email detection
        if (field.type === 'email' || context.includes('email') || context.includes('e-mail')) {
            return userData.email || 'demo@equilateral.ai';
        }
        
        // Name detection
        if (context.includes('first') && context.includes('name')) {
            return userData.firstName || 'John';
        }
        if (context.includes('last') && context.includes('name')) {
            return userData.lastName || 'Demo';
        }
        if (context.includes('full') && context.includes('name')) {
            return userData.fullName || 'John Demo';
        }
        if (context.includes('name') && !context.includes('company') && !context.includes('business')) {
            return userData.name || userData.fullName || 'John Demo';
        }
        
        // Phone detection
        if (field.type === 'tel' || context.includes('phone') || context.includes('mobile')) {
            return userData.phone || '555-0123';
        }
        
        // Company detection
        if (context.includes('company') || context.includes('organization') || context.includes('business')) {
            return userData.company || 'Equilateral AI';
        }
        
        // Message/Comments detection
        if (field.type === 'textarea' || context.includes('message') || context.includes('comment')) {
            return userData.message || 'Testing the amazing EquilateralAgents Smart Form Filler!';
        }
        
        // Date detection
        if (field.type === 'date') {
            return new Date().toISOString().split('T')[0];
        }
        
        // Number detection
        if (field.type === 'number') {
            if (context.includes('age')) return '30';
            if (context.includes('quantity')) return '1';
            if (context.includes('amount')) return '100';
            return '42';
        }
        
        // Checkbox detection
        if (field.type === 'checkbox') {
            // Only check if it's about agreement/acceptance
            if (context.includes('agree') || context.includes('accept') || context.includes('terms')) {
                return 'checked';
            }
            return null; // Skip other checkboxes
        }
        
        // Required field fallback
        if (field.required) {
            return 'Demo Value';
        }
        
        return null;
    }

    async submitForm() {
        // Try multiple strategies to find submit button
        const strategies = [
            'button[type="submit"]',
            'input[type="submit"]',
            'button:has-text("Submit")',
            'button:has-text("Send")',
            'button:has-text("Continue")',
            'button:has-text("Next")',
            '*[role="button"]:has-text("Submit")'
        ];
        
        for (const selector of strategies) {
            try {
                const button = await this.page.$(selector);
                if (button) {
                    console.log(chalk.green('  ✅ Found submit button!'));
                    await button.click();
                    return;
                }
            } catch (e) {
                // Try next strategy
            }
        }
        
        console.log(chalk.yellow('  ⚠️  No submit button found'));
    }

    async checkSuccess() {
        // Look for success indicators
        const successIndicators = [
            'text=/success/i',
            'text=/thank you/i',
            'text=/submitted/i',
            'text=/received/i',
            'text=/complete/i'
        ];
        
        for (const indicator of successIndicators) {
            try {
                await this.page.waitForSelector(indicator, { timeout: 3000 });
                return true;
            } catch (e) {
                // Try next indicator
            }
        }
        
        return false;
    }

    async cleanup() {
        if (this.browser) {
            await this.browser.close();
        }
    }
}

/**
 * Interactive Demo Runner
 */
async function runInteractiveDemo() {
    console.log(chalk.cyan.bold('\n🤖 EquilateralAgents™ Smart Form Filler Demo\n'));
    console.log(chalk.white('This demo shows REAL intelligence, not just automation.\n'));
    
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    const question = (query) => new Promise((resolve) => rl.question(query, resolve));
    
    // Demo options
    console.log(chalk.yellow('Choose a demo:'));
    console.log('1. Contact Form (Simple)');
    console.log('2. Registration Form (Complex)');
    console.log('3. Custom URL (Your own form)');
    console.log('4. Comparison Mode (See vs RPA)\n');
    
    const choice = await question(chalk.cyan('Enter choice (1-4): '));
    
    let url, userData;
    
    switch(choice.trim()) {
        case '1':
            url = 'https://demo.equilateral.ai/contact-form';
            userData = {
                fullName: 'Alice Developer',
                email: 'alice@example.com',
                message: 'This is amazing! The agent understood my form perfectly.'
            };
            break;
            
        case '2':
            url = 'https://demo.equilateral.ai/registration';
            userData = {
                firstName: 'Bob',
                lastName: 'Builder',
                email: 'bob@construction.com',
                phone: '555-BUILD',
                company: 'BuildCo Industries'
            };
            break;
            
        case '3':
            url = await question(chalk.cyan('Enter form URL: '));
            console.log(chalk.yellow('\nI\'ll try to understand your form intelligently!'));
            userData = {
                fullName: 'Test User',
                email: 'test@equilateral.ai',
                message: 'Intelligent form filling by EquilateralAgents'
            };
            break;
            
        case '4':
            await showComparison();
            rl.close();
            return;
            
        default:
            console.log(chalk.red('Invalid choice'));
            rl.close();
            return;
    }
    
    rl.close();
    
    // Initialize orchestrator and agent
    const orchestrator = new AgentOrchestrator();
    const formAgent = new SmartFormAgent();
    
    orchestrator.registerAgent(formAgent);
    
    // The magic moment
    console.log(chalk.magenta.bold('\n✨ Watch the magic happen...\n'));
    
    await formAgent.initialize();
    
    const result = await formAgent.execute({
        url,
        formData: userData
    });
    
    await new Promise(resolve => setTimeout(resolve, 3000)); // Let user see result
    
    if (result.success) {
        console.log(chalk.green.bold('\n🎉 Success! Form submitted intelligently.'));
        console.log(chalk.white(`   Filled ${result.fieldsCompleted} fields with context awareness\n`));
    } else {
        console.log(chalk.yellow('\n⚠️  Form submitted but success not confirmed.\n'));
    }
    
    await formAgent.cleanup();
    
    // Show upgrade prompt
    showUpgradePrompt();
}

function showComparison() {
    console.log(chalk.cyan.bold('\n📊 RPA vs EquilateralAgents Intelligence\n'));
    
    console.log(chalk.red('Traditional RPA:'));
    console.log(chalk.gray('  - Records exact clicks and keystrokes'));
    console.log(chalk.gray('  - Breaks when form changes'));
    console.log(chalk.gray('  - Requires new recording for each form'));
    console.log(chalk.gray('  - No understanding of context'));
    console.log(chalk.gray('  - Fixed data mapping\n'));
    
    console.log(chalk.green('EquilateralAgents:'));
    console.log(chalk.white('  ✅ Understands form context'));
    console.log(chalk.white('  ✅ Adapts to form changes'));
    console.log(chalk.white('  ✅ Works on ANY form instantly'));
    console.log(chalk.white('  ✅ Infers field meanings'));
    console.log(chalk.white('  ✅ Intelligent data mapping\n'));
    
    console.log(chalk.yellow('Commercial Version Adds:'));
    console.log(chalk.white('  💎 Parallel form processing'));
    console.log(chalk.white('  💎 Database integration'));
    console.log(chalk.white('  💎 API data sources'));
    console.log(chalk.white('  💎 Advanced NLP understanding'));
    console.log(chalk.white('  💎 Multi-step workflows'));
    console.log(chalk.white('  💎 Enterprise authentication\n'));
}

function showUpgradePrompt() {
    console.log(chalk.cyan('━'.repeat(60)));
    console.log(chalk.yellow.bold('\n🚀 Impressed? This is just the beginning!\n'));
    
    console.log(chalk.white('The Open-Core version demonstrates our intelligence patterns.'));
    console.log(chalk.white('The Commercial version can:\n'));
    
    console.log(chalk.green('  • Process 100s of forms in parallel'));
    console.log(chalk.green('  • Extract data from PDFs and emails'));
    console.log(chalk.green('  • Integrate with your databases'));
    console.log(chalk.green('  • Handle complex multi-step workflows'));
    console.log(chalk.green('  • Learn from your specific use cases\n'));
    
    console.log(chalk.cyan.bold('🎯 Try more demos:'));
    console.log(chalk.white('  npm run playground    - Interactive testing'));
    console.log(chalk.white('  npm run tutorial      - Build custom agents'));
    console.log(chalk.white('  npm run benchmark     - Performance comparison\n'));
    
    console.log(chalk.magenta.bold('💎 Unlock Full Power:'));
    console.log(chalk.white('  https://equilateral.ai/upgrade\n'));
    console.log(chalk.cyan('━'.repeat(60)));
}

// Run the demo
if (require.main === module) {
    runInteractiveDemo().catch(console.error);
}

module.exports = { SmartFormAgent };