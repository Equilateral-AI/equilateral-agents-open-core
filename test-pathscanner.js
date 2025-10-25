/**
 * Test PathScanningHelper on this repository
 */

const CodeAnalyzerAgent = require('./agent-packs/development/CodeAnalyzerAgent');

async function testCodeAnalyzer() {
    console.log('🧪 Testing CodeAnalyzerAgent with PathScanningHelper on this repository\n');
    console.log('Project path:', process.cwd());
    console.log('Expected: Should warn about missing src/ but still scan agent-packs/, equilateral-core/, etc.\n');
    console.log('='.repeat(80));

    try {
        const agent = new CodeAnalyzerAgent({ verbose: true });

        const result = await agent.executeTask({
            taskType: 'analyze',
            taskData: {
                projectPath: process.cwd()
            }
        });

        console.log('\n' + '='.repeat(80));
        console.log('📊 Analysis Result:');
        console.log('='.repeat(80));

        if (result.success) {
            console.log('✅ Analysis completed successfully');
            console.log('\nFiles analyzed:', result.data?.filesAnalyzed || 'N/A');
            console.log('Directories scanned:', result.metadata?.directoriesScanned?.join(', ') || 'N/A');

            if (result.data?.scanStats) {
                console.log('\n📈 Scan Statistics:');
                console.log('  Total files:', result.data.scanStats.totalFiles);
                console.log('  Has src/ directory:', result.data.scanStats.hasSrcDirectory);
                console.log('  Directories found:', Array.from(result.data.scanStats.directories || []).join(', '));

                if (result.data.scanStats.byDirectory) {
                    console.log('\n📂 Files by directory:');
                    for (const [dir, count] of result.data.scanStats.byDirectory.entries()) {
                        console.log(`    ${dir}: ${count} files`);
                    }
                }
            }

            if (result.warnings && result.warnings.length > 0) {
                console.log('\n⚠️  Warnings:');
                result.warnings.forEach(warning => console.log(`    - ${warning}`));
            }
        } else {
            console.log('❌ Analysis failed:', result.message);
        }

    } catch (error) {
        console.error('❌ Test failed with error:', error.message);
        console.error(error.stack);
    }
}

testCodeAnalyzer().catch(console.error);
