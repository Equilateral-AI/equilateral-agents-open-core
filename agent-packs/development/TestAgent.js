/**
 * Test Agent - Comprehensive UI Testing and Element Management
 * 
 * **Developed by Equilateral AI (Pareidolia LLC)**
 * 
 * Handles automated testing with intelligent UI element remapping,
 * test scenario management, and cross-browser compatibility validation.
 * 
 * Key Features:
 * - UI element remapping when components change
 * - Automated test scenario generation
 * - Cross-browser compatibility testing
 * - Visual regression detection
 * - Test maintenance automation
 */

const fs = require('fs');
const path = require('path');
const PathScanningHelper = require('../../equilateral-core/PathScanningHelper');

// Simple response utilities for consistent responses
const createSuccessResponse = (data, message, metadata = {}) => ({
    success: true,
    data,
    message,
    metadata: {
        ...metadata,
        timestamp: new Date().toISOString(),
        agent: 'TestAgent'
    }
});

const createErrorResponse = (message, code, details = {}) => ({
    success: false,
    message,
    error_code: code,
    error_details: details,
    timestamp: new Date().toISOString(),
    agent: 'TestAgent'
});

class TestAgent {
    constructor(config = {}) {
        this.projectRoot = config.projectRoot || process.cwd();
        this.testDirectory = path.join(this.projectRoot, 'tests');
        this.elementMapPath = path.join(this.testDirectory, 'element-mappings.json');
        this.testScenariosPath = path.join(this.testDirectory, 'test-scenarios.json');
        
        // Load Equilateral AI standards
        this.standards = this.loadEquilateralAIStandards();
        
        // Initialize test configurations
        this.testFrameworks = ['playwright', 'cypress', 'selenium'];
        this.browsers = ['chromium', 'firefox', 'webkit', 'chrome', 'edge'];
        
        // Element mapping strategies
        this.remappingStrategies = {
            'data-testid': { priority: 1, stable: true },
            'id': { priority: 2, stable: false },
            'class': { priority: 3, stable: false },
            'xpath': { priority: 4, stable: false },
            'text': { priority: 5, stable: false },
            'css': { priority: 6, stable: false }
        };
        
        // Initialize path scanner for UI testing
        this.pathScanner = new PathScanningHelper({
            verbose: config.verbose !== false,
            extensions: {
                javascript: ['.js', '.jsx', '.ts', '.tsx']
            },
            maxDepth: config.maxDepth || 10
        });

        this.ensureDirectoryStructure();
        this.initializeElementMappings();
    }

    /**
     * Load Equilateral AI testing standards
     */
    loadEquilateralAIStandards() {
        const standardsFiles = [
            'testing_principles.md',
            'development_principles.md',
            'api_design_standards.md'
        ];

        const standards = {};

        standardsFiles.forEach(file => {
            const filePath = path.join(this.projectRoot, 'EquilateralAgents-Open-Standards', file);
            if (fs.existsSync(filePath)) {
                standards[file.replace('.md', '')] = fs.readFileSync(filePath, 'utf8');
            }
        });

        return standards;
    }

    /**
     * Get agent capabilities
     */
    getCapabilities() {
        return [
            'ui-element-remapping',
            'test-scenario-generation',
            'cross-browser-testing',
            'visual-regression-detection',
            'test-maintenance-automation',
            'playwright-test-generation',
            'cypress-test-generation',
            'element-stability-analysis',
            'test-data-management',
            'accessibility-testing',
            'performance-testing',
            'mobile-responsive-testing',
            'component-testing',
            'integration-testing',
            'e2e-testing'
        ];
    }

    /**
     * Get supported operations
     */
    getSupportedOperations() {
        return [
            'remapUIElements',
            'generateTestScenarios',
            'executeTestSuite',
            'analyzeElementStability',
            'updateTestMappings',
            'generatePlaywrightTests',
            'generateCypressTests',
            'performVisualRegression',
            'validateAccessibility',
            'runCrossBrowserTests'
        ];
    }

    /**
     * CORE FEATURE: Remap UI elements when components change
     */
    async remapUIElements(context) {
        try {
            const { targetUrl, previousMappings, newComponentStructure } = context;
            
            console.log('🔄 Starting UI element remapping process...');
            
            // Load current element mappings
            const currentMappings = await this.loadElementMappings();
            
            // Analyze component changes
            const changeAnalysis = await this.analyzeComponentChanges(
                previousMappings || currentMappings,
                newComponentStructure
            );
            
            // Generate new mappings based on change analysis
            const newMappings = await this.generateUpdatedMappings(
                currentMappings,
                changeAnalysis,
                targetUrl
            );
            
            // Validate new mappings
            const validationResults = await this.validateElementMappings(newMappings, targetUrl);
            
            // Update test files with new mappings
            const updatedTests = await this.updateTestFiles(newMappings, validationResults);
            
            // Save updated mappings
            await this.saveElementMappings(newMappings);
            
            return createSuccessResponse(
                {
                    remappedElements: Object.keys(newMappings).length,
                    changesDetected: changeAnalysis.changes.length,
                    updatedTests: updatedTests.length,
                    validationResults,
                    newMappings
                },
                'UI element remapping completed successfully',
                {
                    targetUrl,
                    remappingStrategy: 'intelligent-fallback',
                    elementsProcessed: Object.keys(newMappings).length
                }
            );
            
        } catch (error) {
            console.error('UI element remapping failed:', error);
            return createErrorResponse(error.message, 'UI_REMAPPING_ERROR');
        }
    }

    /**
     * Analyze changes in component structure
     */
    async analyzeComponentChanges(previousMappings, newComponentStructure) {
        const changes = [];
        const addedElements = [];
        const removedElements = [];
        const modifiedElements = [];
        
        // Compare previous mappings with new structure
        for (const [elementId, previousData] of Object.entries(previousMappings)) {
            if (!newComponentStructure[elementId]) {
                removedElements.push({
                    elementId,
                    previousSelector: previousData.selector,
                    reason: 'Element not found in new structure'
                });
            } else if (this.hasElementChanged(previousData, newComponentStructure[elementId])) {
                modifiedElements.push({
                    elementId,
                    previousSelector: previousData.selector,
                    newStructure: newComponentStructure[elementId],
                    changeType: this.getChangeType(previousData, newComponentStructure[elementId])
                });
            }
        }
        
        // Find newly added elements
        for (const [elementId, newData] of Object.entries(newComponentStructure)) {
            if (!previousMappings[elementId]) {
                addedElements.push({
                    elementId,
                    newStructure: newData,
                    suggestedSelector: this.suggestOptimalSelector(newData)
                });
            }
        }
        
        return {
            changes: [...addedElements, ...modifiedElements, ...removedElements],
            addedElements,
            removedElements,
            modifiedElements,
            changesSummary: {
                added: addedElements.length,
                modified: modifiedElements.length,
                removed: removedElements.length
            }
        };
    }

    /**
     * Generate updated mappings with intelligent fallback strategies
     */
    async generateUpdatedMappings(currentMappings, changeAnalysis, targetUrl) {
        const updatedMappings = { ...currentMappings };
        
        // Handle modified elements with fallback strategies
        for (const modifiedElement of changeAnalysis.modifiedElements) {
            const fallbackSelectors = await this.generateFallbackSelectors(
                modifiedElement.elementId,
                modifiedElement.newStructure
            );
            
            updatedMappings[modifiedElement.elementId] = {
                primarySelector: fallbackSelectors[0],
                fallbackSelectors: fallbackSelectors.slice(1),
                lastUpdated: new Date().toISOString(),
                changeReason: modifiedElement.changeType,
                stability: this.calculateElementStability(fallbackSelectors)
            };
        }
        
        // Handle removed elements - mark as deprecated with alternatives
        for (const removedElement of changeAnalysis.removedElements) {
            const alternatives = await this.findAlternativeElements(
                removedElement.elementId,
                changeAnalysis.addedElements
            );
            
            updatedMappings[removedElement.elementId] = {
                status: 'deprecated',
                reason: removedElement.reason,
                alternatives,
                deprecatedAt: new Date().toISOString()
            };
        }
        
        // Add new elements
        for (const addedElement of changeAnalysis.addedElements) {
            updatedMappings[addedElement.elementId] = {
                primarySelector: addedElement.suggestedSelector,
                fallbackSelectors: await this.generateFallbackSelectors(
                    addedElement.elementId,
                    addedElement.newStructure
                ),
                createdAt: new Date().toISOString(),
                stability: 'new'
            };
        }
        
        return updatedMappings;
    }

    /**
     * Generate fallback selectors using multiple strategies
     */
    async generateFallbackSelectors(elementId, elementStructure) {
        const selectors = [];
        
        // Strategy 1: data-testid (most stable)
        if (elementStructure.testId) {
            selectors.push({
                type: 'data-testid',
                selector: `[data-testid="${elementStructure.testId}"]`,
                stability: 'high'
            });
        }
        
        // Strategy 2: Unique ID
        if (elementStructure.id) {
            selectors.push({
                type: 'id',
                selector: `#${elementStructure.id}`,
                stability: 'medium'
            });
        }
        
        // Strategy 3: Unique class combinations
        if (elementStructure.classes && elementStructure.classes.length > 0) {
            const uniqueClasses = elementStructure.classes.filter(cls => 
                !cls.includes('hover') && !cls.includes('active') && !cls.includes('focus')
            );
            if (uniqueClasses.length > 0) {
                selectors.push({
                    type: 'class',
                    selector: `.${uniqueClasses.join('.')}`,
                    stability: 'low'
                });
            }
        }
        
        // Strategy 4: Semantic role-based selector
        if (elementStructure.role) {
            selectors.push({
                type: 'role',
                selector: `[role="${elementStructure.role}"]`,
                stability: 'medium'
            });
        }
        
        // Strategy 5: Text-based (for buttons, links, etc.)
        if (elementStructure.text) {
            selectors.push({
                type: 'text',
                selector: `text="${elementStructure.text}"`,
                stability: 'low'
            });
        }
        
        // Strategy 6: XPath fallback
        if (elementStructure.xpath) {
            selectors.push({
                type: 'xpath',
                selector: elementStructure.xpath,
                stability: 'very-low'
            });
        }
        
        return selectors.sort((a, b) => this.getSelectorPriority(a.type) - this.getSelectorPriority(b.type));
    }

    /**
     * Update test files with new mappings
     */
    async updateTestFiles(newMappings, validationResults) {
        const updatedFiles = [];
        const testFiles = await this.findTestFiles();
        
        for (const testFile of testFiles) {
            try {
                const fileContent = fs.readFileSync(testFile, 'utf8');
                let updatedContent = fileContent;
                let hasChanges = false;
                
                // Update element selectors in test files
                for (const [elementId, mapping] of Object.entries(newMappings)) {
                    if (mapping.status === 'deprecated') {
                        // Add deprecation warnings
                        const deprecationComment = `// WARNING: Element '${elementId}' is deprecated. Consider using: ${mapping.alternatives.join(', ')}`;
                        updatedContent = this.addDeprecationWarning(updatedContent, elementId, deprecationComment);
                        hasChanges = true;
                    } else {
                        // Update with new primary selector
                        const oldSelectorPattern = this.findCurrentSelector(fileContent, elementId);
                        if (oldSelectorPattern) {
                            updatedContent = updatedContent.replace(
                                oldSelectorPattern,
                                mapping.primarySelector.selector
                            );
                            hasChanges = true;
                        }
                    }
                }
                
                // Add retry logic for unstable elements
                updatedContent = this.addRetryLogic(updatedContent, newMappings);
                
                if (hasChanges) {
                    fs.writeFileSync(testFile, updatedContent, 'utf8');
                    updatedFiles.push({
                        file: testFile,
                        changes: 'Updated element selectors and added retry logic'
                    });
                }
                
            } catch (error) {
                console.error(`Failed to update test file ${testFile}:`, error);
            }
        }
        
        return updatedFiles;
    }

    /**
     * Generate comprehensive test scenarios
     */
    async generateTestScenarios(context) {
        try {
            const { component, userFlows, testType = 'e2e' } = context;
            
            console.log(`🧪 Generating ${testType} test scenarios for ${component}...`);
            
            const scenarios = [];
            
            // Generate scenarios based on component type
            if (testType === 'component') {
                scenarios.push(...await this.generateComponentTestScenarios(component));
            } else if (testType === 'e2e') {
                scenarios.push(...await this.generateE2ETestScenarios(userFlows));
            } else if (testType === 'integration') {
                scenarios.push(...await this.generateIntegrationTestScenarios(component));
            }
            
            // Add accessibility test scenarios
            scenarios.push(...await this.generateAccessibilityTestScenarios(component));
            
            // Add performance test scenarios
            scenarios.push(...await this.generatePerformanceTestScenarios(component));
            
            // Save scenarios
            await this.saveTestScenarios(scenarios);
            
            return createSuccessResponse(
                { scenarios, totalScenarios: scenarios.length },
                `Generated ${scenarios.length} test scenarios for ${component}`,
                { testType, component }
            );
            
        } catch (error) {
            console.error('Test scenario generation failed:', error);
            return createErrorResponse(error.message, 'TEST_SCENARIO_GENERATION_ERROR');
        }
    }

    /**
     * Generate E2E test scenarios
     */
    async generateE2ETestScenarios(userFlows) {
        const scenarios = [];
        
        for (const flow of userFlows) {
            scenarios.push({
                name: flow.name || `E2E Test Scenario`,
                type: 'e2e',
                description: flow.description || 'End-to-end user flow test',
                baseUrl: '/super',
                steps: flow.steps || flow,
                assertions: [
                    { selector: '[data-testid="success-indicator"]', expectation: 'toBeVisible()' }
                ]
            });
        }
        
        return scenarios;
    }

    /**
     * Generate component test scenarios
     */
    async generateComponentTestScenarios(component) {
        return [{
            name: `${component} Component Test`,
            type: 'component',
            description: `Component functionality test for ${component}`,
            baseUrl: '/',
            steps: [
                { action: 'render', elementId: component, description: `Render ${component}` }
            ],
            assertions: [
                { selector: `[data-testid="${component}"]`, expectation: 'toBeVisible()' }
            ]
        }];
    }

    /**
     * Generate integration test scenarios
     */
    async generateIntegrationTestScenarios(component) {
        return [{
            name: `${component} Integration Test`,
            type: 'integration',
            description: `API integration test for ${component}`,
            baseUrl: '/',
            steps: [
                { action: 'api_call', elementId: 'endpoint', description: 'Call API endpoint' }
            ],
            assertions: [
                { selector: '[data-testid="api-response"]', expectation: 'toContainText("success")' }
            ]
        }];
    }

    /**
     * Generate accessibility test scenarios
     */
    async generateAccessibilityTestScenarios(component) {
        return [{
            name: `${component} Accessibility Test`,
            type: 'accessibility',
            description: `WCAG compliance test for ${component}`,
            baseUrl: '/',
            steps: [
                { action: 'axe_scan', elementId: component, description: 'Run accessibility scan' }
            ],
            assertions: [
                { selector: 'body', expectation: 'toPassAccessibilityTests()' }
            ]
        }];
    }

    /**
     * Generate performance test scenarios  
     */
    async generatePerformanceTestScenarios(component) {
        return [{
            name: `${component} Performance Test`,
            type: 'performance',
            description: `Performance benchmark for ${component}`,
            baseUrl: '/',
            steps: [
                { action: 'measure_performance', elementId: component, description: 'Measure load time' }
            ],
            assertions: [
                { selector: 'body', expectation: 'toLoadWithin(2000)' }
            ]
        }];
    }

    /**
     * Save test scenarios to file
     */
    async saveTestScenarios(scenarios) {
        try {
            const scenariosData = {
                generated_at: new Date().toISOString(),
                agent: 'TestAgent',
                total_scenarios: scenarios.length,
                scenarios
            };
            
            fs.writeFileSync(this.testScenariosPath, JSON.stringify(scenariosData, null, 2));
            console.log(`✅ Saved ${scenarios.length} test scenarios`);
        } catch (error) {
            console.error('Failed to save test scenarios:', error);
        }
    }

    /**
     * Generate Playwright test files
     */
    async generatePlaywrightTests(context) {
        try {
            const { scenarios, outputPath } = context;
            const testFiles = [];
            
            for (const scenario of scenarios) {
                const testContent = this.generatePlaywrightTestContent(scenario);
                const fileName = `${scenario.name.toLowerCase().replace(/\s+/g, '-')}.spec.js`;
                const filePath = path.join(outputPath || this.testDirectory, 'playwright', fileName);
                
                // Ensure directory exists
                fs.mkdirSync(path.dirname(filePath), { recursive: true });
                fs.writeFileSync(filePath, testContent, 'utf8');
                
                testFiles.push(filePath);
            }
            
            return createSuccessResponse(
                { generatedFiles: testFiles },
                `Generated ${testFiles.length} Playwright test files`,
                { framework: 'playwright' }
            );
            
        } catch (error) {
            console.error('Playwright test generation failed:', error);
            return createErrorResponse(error.message, 'PLAYWRIGHT_GENERATION_ERROR');
        }
    }

    /**
     * Generate Playwright test content with retry logic
     */
    generatePlaywrightTestContent(scenario) {
        return `/**
 * ${scenario.name} - Generated by Equilateral AI TestAgent
 * 
 * Test Type: ${scenario.type}
 * Description: ${scenario.description}
 */

const { test, expect } = require('@playwright/test');

test.describe('${scenario.name}', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('${scenario.baseUrl || '/'}');
    });

    ${scenario.steps.map(step => this.generatePlaywrightTestStep(step)).join('\n\n    ')}
});

/**
 * Utility function for element interaction with retry logic
 */
async function interactWithElement(page, selectors, action, options = {}) {
    for (const selector of selectors) {
        try {
            const element = page.locator(selector.selector);
            await expect(element).toBeVisible({ timeout: 5000 });
            
            switch (action) {
                case 'click':
                    await element.click(options);
                    break;
                case 'fill':
                    await element.fill(options.value);
                    break;
                case 'select':
                    await element.selectOption(options.value);
                    break;
                default:
                    throw new Error(\`Unknown action: \${action}\`);
            }
            return; // Success, exit retry loop
        } catch (error) {
            console.warn(\`Selector \${selector.selector} failed: \${error.message}\`);
            continue; // Try next selector
        }
    }
    throw new Error(\`All selectors failed for action: \${action}\`);
}`;
    }

    /**
     * Generate Playwright test step with element remapping support
     */
    generatePlaywrightTestStep(step) {
        const elementMappings = this.loadElementMappings();
        const elementId = step.elementId;
        const mapping = elementMappings[elementId];
        
        if (!mapping || mapping.status === 'deprecated') {
            return `
    test('${step.name}', async ({ page }) => {
        // WARNING: Element '${elementId}' may be deprecated or unavailable
        // Consider updating this test or using alternative selectors
        await expect(page.locator('${step.fallbackSelector || `[data-testid="${elementId}"]`}')).toBeVisible();
    });`;
        }
        
        const selectors = [mapping.primarySelector, ...(mapping.fallbackSelectors || [])];
        
        return `
    test('${step.name}', async ({ page }) => {
        ${step.description ? `// ${step.description}` : ''}
        const selectors = ${JSON.stringify(selectors, null, 8)};
        
        await interactWithElement(page, selectors, '${step.action}', ${JSON.stringify(step.options || {})});
        
        // Assertions
        ${step.assertions.map(assertion => `await expect(page.locator('${assertion.selector}')).${assertion.expectation};`).join('\n        ')}
    });`;
    }

    /**
     * Initialize directory structure
     */
    ensureDirectoryStructure() {
        const dirs = [
            this.testDirectory,
            path.join(this.testDirectory, 'playwright'),
            path.join(this.testDirectory, 'cypress'),
            path.join(this.testDirectory, 'unit'),
            path.join(this.testDirectory, 'integration'),
            path.join(this.testDirectory, 'e2e'),
            path.join(this.testDirectory, 'data')
        ];

        dirs.forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });
    }

    /**
     * Initialize element mappings file
     */
    initializeElementMappings() {
        if (!fs.existsSync(this.elementMapPath)) {
            const initialMappings = {
                _metadata: {
                    version: '1.0.0',
                    lastUpdated: new Date().toISOString(),
                    agent: 'TestAgent',
                    framework: 'equilateral-ai'
                }
            };
            fs.writeFileSync(this.elementMapPath, JSON.stringify(initialMappings, null, 2));
        }
    }

    /**
     * Load element mappings from file
     */
    loadElementMappings() {
        try {
            if (fs.existsSync(this.elementMapPath)) {
                return JSON.parse(fs.readFileSync(this.elementMapPath, 'utf8'));
            }
        } catch (error) {
            console.error('Failed to load element mappings:', error);
        }
        return {};
    }

    /**
     * Save element mappings to file
     */
    async saveElementMappings(mappings) {
        try {
            mappings._metadata = {
                ...mappings._metadata,
                lastUpdated: new Date().toISOString(),
                agent: 'TestAgent'
            };
            fs.writeFileSync(this.elementMapPath, JSON.stringify(mappings, null, 2));
            console.log('✅ Element mappings saved successfully');
        } catch (error) {
            console.error('Failed to save element mappings:', error);
            throw error;
        }
    }

    /**
     * Utility methods for selector management
     */
    getSelectorPriority(selectorType) {
        const priorities = {
            'data-testid': 1,
            'role': 2,
            'id': 3,
            'class': 4,
            'text': 5,
            'xpath': 6
        };
        return priorities[selectorType] || 999;
    }

    calculateElementStability(selectors) {
        const stabilityScores = {
            'data-testid': 10,
            'role': 8,
            'id': 6,
            'class': 4,
            'text': 3,
            'xpath': 1
        };
        
        const avgStability = selectors.reduce((sum, selector) => {
            return sum + (stabilityScores[selector.type] || 1);
        }, 0) / selectors.length;
        
        if (avgStability >= 8) return 'high';
        if (avgStability >= 6) return 'medium';
        if (avgStability >= 3) return 'low';
        return 'very-low';
    }

    /**
     * Find test files in project
     */
    async findTestFiles() {
        const testFiles = [];
        const extensions = ['.spec.js', '.test.js', '.spec.ts', '.test.ts'];
        
        const searchDirs = [
            this.testDirectory,
            path.join(this.projectRoot, 'src'),
            path.join(this.projectRoot, 'tests'),
            path.join(this.projectRoot, '__tests__')
        ];
        
        for (const dir of searchDirs) {
            if (fs.existsSync(dir)) {
                const files = this.findFilesRecursively(dir, extensions);
                testFiles.push(...files);
            }
        }
        
        return testFiles;
    }

    findFilesRecursively(dir, extensions) {
        const files = [];
        const items = fs.readdirSync(dir);
        
        for (const item of items) {
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                files.push(...this.findFilesRecursively(fullPath, extensions));
            } else if (extensions.some(ext => item.endsWith(ext))) {
                files.push(fullPath);
            }
        }
        
        return files;
    }
}

module.exports = TestAgent;