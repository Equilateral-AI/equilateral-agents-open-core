/**
 * Test SecurityScannerAgent with PathScanningHelper
 */

const SecurityScannerAgent = require('./agent-packs/security/SecurityScannerAgent');

async function testSecurityScanner() {
    console.log('🔒 Testing SecurityScannerAgent with PathScanningHelper on this repository\n');
    console.log('Project path:', process.cwd());
    console.log('Expected: Should scan all JavaScript files for vulnerabilities\n');
    console.log('='.repeat(80));

    try {
        const agent = new SecurityScannerAgent({ verbose: true });

        const result = await agent.executeTask({
            taskType: 'scan-vulnerabilities',
            taskData: {
                projectPath: process.cwd()
            }
        });

        console.log('\n' + '='.repeat(80));
        console.log('🔒 Security Scan Result:');
        console.log('='.repeat(80));

        if (result.success) {
            console.log('✅ Security scan completed successfully\n');

            const data = result.data;

            console.log('📊 Scan Summary:');
            console.log('  Files scanned:', data.filesScanned || 'N/A');
            console.log('  Vulnerabilities found:', data.vulnerabilitiesFound || 0);

            if (data.scanStats) {
                console.log('\n📈 Path Scanning Statistics:');
                console.log('  Total files:', data.scanStats.totalFiles);
                console.log('  Has src/ directory:', data.scanStats.hasSrcDirectory);
                console.log('  Directories scanned:', Array.from(data.scanStats.directories || []).join(', '));
            }

            if (data.vulnerabilities && data.vulnerabilities.length > 0) {
                console.log('\n⚠️  Vulnerabilities Found:');
                data.vulnerabilities.slice(0, 5).forEach((vuln, i) => {
                    console.log(`\n  ${i + 1}. ${vuln.severity.toUpperCase()}: ${vuln.type}`);
                    console.log(`     File: ${vuln.file}`);
                    console.log(`     Description: ${vuln.description}`);
                });

                if (data.vulnerabilities.length > 5) {
                    console.log(`\n  ... and ${data.vulnerabilities.length - 5} more vulnerabilities`);
                }
            }

            if (data.secretsFound > 0) {
                console.log(`\n🔑 Secrets found: ${data.secretsFound}`);
            }

        } else {
            console.log('❌ Security scan failed:', result.message);
            console.log('Error details:', result.error);
        }

    } catch (error) {
        console.error('❌ Test failed with error:', error.message);
        console.error(error.stack);
    }
}

testSecurityScanner().catch(console.error);
