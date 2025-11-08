#!/usr/bin/env node

/**
 * Test and document honeydolist.vip features
 * Built with EquilateralAgents methodology
 */

const { chromium } = require('playwright');

async function testHoneyDoList() {
    console.log('🧪 Testing honeydolist.vip...\n');

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        ignoreHTTPSErrors: true
    });
    const page = await context.newPage();

    try {
        // Navigate to app
        console.log('📍 Navigating to app.honeydolist.vip...');
        await page.goto('https://app.honeydolist.vip', { waitUntil: 'networkidle' });

        // Take screenshot of landing page
        await page.screenshot({ path: '.equilateral/honeydolist-landing.png', fullPage: true });
        console.log('✅ Landing page loaded\n');

        // Look for login or main features
        const pageContent = await page.content();
        const title = await page.title();
        console.log(`📄 Page title: ${title}`);

        // Check for login form
        const hasEmailInput = await page.locator('input[type="email"]').count() > 0;
        const hasPasswordInput = await page.locator('input[type="password"]').count() > 0;

        if (hasEmailInput && hasPasswordInput) {
            console.log('🔐 Login form detected. Attempting login...\n');

            // Fill login form
            await page.fill('input[type="email"]', 'James.ford@happyhippo.ai');
            await page.fill('input[type="password"]', '123_GOtime');

            // Find and click login button
            const loginButton = page.locator('button:has-text("Log"), button:has-text("Sign")').first();
            await loginButton.click();

            // Wait for navigation
            await page.waitForLoadState('networkidle');
            await page.screenshot({ path: '.equilateral/honeydolist-dashboard.png', fullPage: true });

            console.log('✅ Logged in successfully\n');

            // Explore the app
            console.log('🔍 Exploring app features...\n');

            // Get current URL
            const currentUrl = page.url();
            console.log(`📍 Current URL: ${currentUrl}`);

            // Look for main features/navigation
            const headings = await page.locator('h1, h2, h3').allTextContents();
            console.log('📋 Headings found:');
            headings.forEach(h => console.log(`   - ${h}`));
            console.log('');

            // Look for lists, tasks, or to-do items
            const lists = await page.locator('ul, ol').count();
            console.log(`📝 Found ${lists} lists on page\n`);

            // Look for buttons/actions
            const buttons = await page.locator('button').allTextContents();
            console.log('🔘 Buttons/Actions:');
            buttons.slice(0, 10).forEach(b => console.log(`   - ${b}`));
            if (buttons.length > 10) {
                console.log(`   ... and ${buttons.length - 10} more`);
            }
            console.log('');

            // Try to identify key features
            const bodyText = await page.locator('body').textContent();

            const features = {
                hasTasks: bodyText.toLowerCase().includes('task') || bodyText.toLowerCase().includes('todo'),
                hasLists: bodyText.toLowerCase().includes('list'),
                hasProjects: bodyText.toLowerCase().includes('project'),
                hasCalendar: bodyText.toLowerCase().includes('calendar') || bodyText.toLowerCase().includes('date'),
                hasCollaboration: bodyText.toLowerCase().includes('share') || bodyText.toLowerCase().includes('team'),
                hasNotifications: bodyText.toLowerCase().includes('notification') || bodyText.toLowerCase().includes('alert')
            };

            console.log('✨ Detected features:');
            Object.entries(features).forEach(([feature, present]) => {
                if (present) {
                    console.log(`   ✅ ${feature}`);
                }
            });
            console.log('');

            // Take final screenshot
            await page.screenshot({ path: '.equilateral/honeydolist-features.png', fullPage: true });

            console.log('📸 Screenshots saved to .equilateral/\n');

        } else {
            console.log('ℹ️  No login form detected - might be a different layout\n');

            // Explore without login
            const headings = await page.locator('h1, h2, h3').allTextContents();
            console.log('📋 Headings on landing page:');
            headings.forEach(h => console.log(`   - ${h}`));
        }

    } catch (error) {
        console.error('❌ Error testing app:', error.message);
        await page.screenshot({ path: '.equilateral/honeydolist-error.png', fullPage: true });
    } finally {
        await browser.close();
    }

    console.log('✅ Test complete!\n');
}

testHoneyDoList().catch(console.error);
