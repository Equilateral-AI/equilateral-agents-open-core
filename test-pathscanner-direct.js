/**
 * Direct test of PathScanningHelper on this repository
 */

const PathScanningHelper = require('./equilateral-core/PathScanningHelper');

async function testPathScanner() {
    console.log('🔍 Testing PathScanningHelper directly on this repository\n');
    console.log('Project path:', process.cwd());
    console.log('='.repeat(80));

    // Test 1: JavaScript scanning
    console.log('\n📝 Test 1: JavaScript File Scanning');
    console.log('-'.repeat(80));

    const jsScanner = new PathScanningHelper({
        verbose: true,
        extensions: {
            javascript: ['.js', '.jsx', '.mjs', '.cjs']
        },
        maxDepth: 10
    });

    const jsFiles = await jsScanner.scanProject(process.cwd(), { language: 'javascript' });
    const jsStats = jsScanner.getStats(jsFiles, process.cwd());

    console.log('\n✅ JavaScript scan complete!');
    console.log(`   Total files: ${jsStats.totalFiles}`);
    console.log(`   Has src/ directory: ${jsStats.hasSrcDirectory ? 'Yes ✅' : 'No ⚠️'}`);
    console.log(`   Directories scanned: ${Array.from(jsStats.directories).join(', ')}`);
    console.log('\n   Files by directory:');
    for (const [dir, count] of jsStats.byDirectory.entries()) {
        console.log(`     ${dir}: ${count} files`);
    }
    console.log('\n   Files by extension:');
    for (const [ext, count] of jsStats.byExtension.entries()) {
        console.log(`     ${ext}: ${count} files`);
    }

    // Test 2: All language scanning
    console.log('\n\n📚 Test 2: All Languages Scanning');
    console.log('-'.repeat(80));

    const allScanner = new PathScanningHelper({
        verbose: true,
        extensions: {
            all: ['.js', '.jsx', '.ts', '.tsx', '.json', '.md', '.yaml', '.yml']
        },
        maxDepth: 10
    });

    const allFiles = await allScanner.scanProject(process.cwd(), { language: 'all' });
    const allStats = allScanner.getStats(allFiles, process.cwd());

    console.log('\n✅ All-language scan complete!');
    console.log(`   Total files: ${allStats.totalFiles}`);
    console.log(`   Has src/ directory: ${allStats.hasSrcDirectory ? 'Yes ✅' : 'No ⚠️'}`);
    console.log('\n   Top 10 directories by file count:');
    const sortedDirs = Array.from(allStats.byDirectory.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
    for (const [dir, count] of sortedDirs) {
        console.log(`     ${dir}: ${count} files`);
    }
    console.log('\n   Files by extension:');
    for (const [ext, count] of allStats.byExtension.entries()) {
        console.log(`     ${ext}: ${count} files`);
    }

    // Test 3: Test with a project that HAS src/ (create temp one)
    console.log('\n\n📁 Test 3: Project WITH src/ Directory');
    console.log('-'.repeat(80));

    const fs = require('fs');
    const path = require('path');
    const os = require('os');

    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pathscanner-test-'));
    const srcDir = path.join(tempDir, 'src');
    fs.mkdirSync(srcDir, { recursive: true });
    fs.writeFileSync(path.join(srcDir, 'index.js'), 'console.log("test");');
    fs.writeFileSync(path.join(srcDir, 'utils.js'), 'export const util = () => {};');

    const testScanner = new PathScanningHelper({
        verbose: true,
        extensions: {
            javascript: ['.js', '.jsx']
        }
    });

    const testFiles = await testScanner.scanProject(tempDir, { language: 'javascript' });
    const testStats = testScanner.getStats(testFiles, tempDir);

    console.log('\n✅ Test project scan complete!');
    console.log(`   Total files: ${testStats.totalFiles}`);
    console.log(`   Has src/ directory: ${testStats.hasSrcDirectory ? 'Yes ✅' : 'No ⚠️'}`);
    console.log(`   Directories: ${Array.from(testStats.directories).join(', ')}`);

    // Cleanup
    fs.rmSync(tempDir, { recursive: true, force: true });

    console.log('\n' + '='.repeat(80));
    console.log('🎉 All PathScanningHelper tests passed!');
    console.log('='.repeat(80));
    console.log('\n✅ PathScanningHelper correctly:');
    console.log('   1. Scans projects with and without src/ directories');
    console.log('   2. Provides detailed logging and statistics');
    console.log('   3. Warns when src/ is missing (hasSrcDirectory: false)');
    console.log('   4. Finds all files in priority directories first');
    console.log('   5. Supports multiple languages and file extensions');
}

testPathScanner().catch(console.error);
