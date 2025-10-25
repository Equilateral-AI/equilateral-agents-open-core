/**
 * PathScanningHelper Tests
 *
 * Tests to verify src/ directory is always scanned correctly
 */

const PathScanningHelper = require('../equilateral-core/PathScanningHelper');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

describe('PathScanningHelper', () => {
    let tempDir;
    let scanner;

    beforeEach(async () => {
        // Create temp directory for tests
        tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'pathscanner-test-'));

        // Initialize scanner
        scanner = new PathScanningHelper({
            verbose: false  // Disable logging during tests
        });
    });

    afterEach(async () => {
        // Clean up temp directory
        await fs.rm(tempDir, { recursive: true, force: true });
    });

    describe('Standard Project Structure', () => {
        test('should scan src/ directory', async () => {
            // Create standard project structure
            await fs.mkdir(path.join(tempDir, 'src'), { recursive: true });
            await fs.writeFile(path.join(tempDir, 'src', 'index.js'), 'console.log("test");');
            await fs.writeFile(path.join(tempDir, 'src', 'utils.js'), 'export const util = () => {};');

            const files = await scanner.scanProject(tempDir, { language: 'javascript' });
            const stats = scanner.getStats(files, tempDir);

            expect(files.length).toBe(2);
            expect(stats.hasSrcDirectory).toBe(true);
            expect(Array.from(stats.directories)).toContain('src');
        });

        test('should scan nested src/ files', async () => {
            // Create nested src structure
            await fs.mkdir(path.join(tempDir, 'src', 'components'), { recursive: true });
            await fs.mkdir(path.join(tempDir, 'src', 'utils'), { recursive: true });

            await fs.writeFile(path.join(tempDir, 'src', 'index.js'), '');
            await fs.writeFile(path.join(tempDir, 'src', 'components', 'Header.js'), '');
            await fs.writeFile(path.join(tempDir, 'src', 'utils', 'helpers.js'), '');

            const files = await scanner.scanProject(tempDir, { language: 'javascript' });

            expect(files.length).toBe(3);
            expect(files.some(f => f.includes('src/index.js'))).toBe(true);
            expect(files.some(f => f.includes('src/components/Header.js'))).toBe(true);
            expect(files.some(f => f.includes('src/utils/helpers.js'))).toBe(true);
        });

        test('should scan multiple priority directories', async () => {
            // Create src/ and lib/
            await fs.mkdir(path.join(tempDir, 'src'), { recursive: true });
            await fs.mkdir(path.join(tempDir, 'lib'), { recursive: true });

            await fs.writeFile(path.join(tempDir, 'src', 'index.js'), '');
            await fs.writeFile(path.join(tempDir, 'lib', 'helper.js'), '');

            const files = await scanner.scanProject(tempDir, { language: 'javascript' });
            const stats = scanner.getStats(files, tempDir);

            expect(files.length).toBe(2);
            expect(stats.hasSrcDirectory).toBe(true);
            expect(Array.from(stats.directories)).toContain('src');
            expect(Array.from(stats.directories)).toContain('lib');
        });
    });

    describe('Edge Cases', () => {
        test('should warn when src/ directory is missing', async () => {
            // Create project without src/
            await fs.mkdir(path.join(tempDir, 'app'), { recursive: true });
            await fs.writeFile(path.join(tempDir, 'app', 'index.js'), '');

            const files = await scanner.scanProject(tempDir, { language: 'javascript' });
            const stats = scanner.getStats(files, tempDir);

            expect(stats.hasSrcDirectory).toBe(false);
            expect(Array.from(stats.directories)).not.toContain('src');
        });

        test('should skip node_modules', async () => {
            // Create src/ and node_modules/
            await fs.mkdir(path.join(tempDir, 'src'), { recursive: true });
            await fs.mkdir(path.join(tempDir, 'node_modules', 'package'), { recursive: true });

            await fs.writeFile(path.join(tempDir, 'src', 'index.js'), '');
            await fs.writeFile(path.join(tempDir, 'node_modules', 'package', 'index.js'), '');

            const files = await scanner.scanProject(tempDir, { language: 'javascript' });

            expect(files.length).toBe(1);
            expect(files[0]).toContain('src/index.js');
            expect(files.some(f => f.includes('node_modules'))).toBe(false);
        });

        test('should skip .git directory', async () => {
            await fs.mkdir(path.join(tempDir, 'src'), { recursive: true });
            await fs.mkdir(path.join(tempDir, '.git', 'objects'), { recursive: true });

            await fs.writeFile(path.join(tempDir, 'src', 'index.js'), '');
            await fs.writeFile(path.join(tempDir, '.git', 'config'), '');

            const files = await scanner.scanProject(tempDir, { language: 'javascript' });

            expect(files.length).toBe(1);
            expect(files[0]).toContain('src/index.js');
            expect(files.some(f => f.includes('.git'))).toBe(false);
        });

        test('should skip dist and build directories', async () => {
            await fs.mkdir(path.join(tempDir, 'src'), { recursive: true });
            await fs.mkdir(path.join(tempDir, 'dist'), { recursive: true });
            await fs.mkdir(path.join(tempDir, 'build'), { recursive: true });

            await fs.writeFile(path.join(tempDir, 'src', 'index.js'), '');
            await fs.writeFile(path.join(tempDir, 'dist', 'index.js'), '');
            await fs.writeFile(path.join(tempDir, 'build', 'index.js'), '');

            const files = await scanner.scanProject(tempDir, { language: 'javascript' });

            expect(files.length).toBe(1);
            expect(files[0]).toContain('src/index.js');
            expect(files.some(f => f.includes('dist'))).toBe(false);
            expect(files.some(f => f.includes('build'))).toBe(false);
        });

        test('should handle empty src/ directory', async () => {
            await fs.mkdir(path.join(tempDir, 'src'), { recursive: true });

            const files = await scanner.scanProject(tempDir, { language: 'javascript' });
            const stats = scanner.getStats(files, tempDir);

            expect(files.length).toBe(0);
            // src/ directory exists but has no files
            expect(stats.hasSrcDirectory).toBe(false);
        });

        test('should handle deep nesting', async () => {
            const deepPath = path.join(tempDir, 'src', 'a', 'b', 'c', 'd', 'e');
            await fs.mkdir(deepPath, { recursive: true });
            await fs.writeFile(path.join(deepPath, 'deep.js'), '');

            const files = await scanner.scanProject(tempDir, { language: 'javascript' });

            expect(files.length).toBe(1);
            expect(files[0]).toContain('src/a/b/c/d/e/deep.js');
        });
    });

    describe('Language Filtering', () => {
        beforeEach(async () => {
            await fs.mkdir(path.join(tempDir, 'src'), { recursive: true });

            // Create files with different extensions
            await fs.writeFile(path.join(tempDir, 'src', 'index.js'), '');
            await fs.writeFile(path.join(tempDir, 'src', 'index.ts'), '');
            await fs.writeFile(path.join(tempDir, 'src', 'index.py'), '');
            await fs.writeFile(path.join(tempDir, 'src', 'index.java'), '');
            await fs.writeFile(path.join(tempDir, 'src', 'README.md'), '');
        });

        test('should filter JavaScript files only', async () => {
            const files = await scanner.scanProject(tempDir, { language: 'javascript' });

            expect(files.length).toBe(1);
            expect(files[0]).toContain('index.js');
        });

        test('should filter TypeScript files only', async () => {
            const files = await scanner.scanProject(tempDir, { language: 'typescript' });

            expect(files.length).toBe(1);
            expect(files[0]).toContain('index.ts');
        });

        test('should filter Python files only', async () => {
            const files = await scanner.scanProject(tempDir, { language: 'python' });

            expect(files.length).toBe(1);
            expect(files[0]).toContain('index.py');
        });

        test('should scan all code files', async () => {
            const files = await scanner.scanProject(tempDir, { language: 'all' });

            expect(files.length).toBe(4);  // .js, .ts, .py, .java (not .md)
            expect(files.some(f => f.endsWith('.js'))).toBe(true);
            expect(files.some(f => f.endsWith('.ts'))).toBe(true);
            expect(files.some(f => f.endsWith('.py'))).toBe(true);
            expect(files.some(f => f.endsWith('.java'))).toBe(true);
            expect(files.some(f => f.endsWith('.md'))).toBe(false);
        });
    });

    describe('Statistics', () => {
        beforeEach(async () => {
            await fs.mkdir(path.join(tempDir, 'src'), { recursive: true });
            await fs.mkdir(path.join(tempDir, 'lib'), { recursive: true });
            await fs.mkdir(path.join(tempDir, 'test'), { recursive: true });

            await fs.writeFile(path.join(tempDir, 'src', 'a.js'), '');
            await fs.writeFile(path.join(tempDir, 'src', 'b.js'), '');
            await fs.writeFile(path.join(tempDir, 'lib', 'c.js'), '');
            await fs.writeFile(path.join(tempDir, 'test', 'd.js'), '');
        });

        test('should provide accurate file counts by directory', async () => {
            const files = await scanner.scanProject(tempDir, { language: 'javascript' });
            const stats = scanner.getStats(files, tempDir);

            expect(stats.totalFiles).toBe(4);
            expect(stats.byDirectory.get('src')).toBe(2);
            expect(stats.byDirectory.get('lib')).toBe(1);
            expect(stats.byDirectory.get('test')).toBe(1);
        });

        test('should track all scanned directories', async () => {
            const files = await scanner.scanProject(tempDir, { language: 'javascript' });
            const stats = scanner.getStats(files, tempDir);

            const dirs = Array.from(stats.directories);
            expect(dirs).toContain('src');
            expect(dirs).toContain('lib');
            expect(dirs).toContain('test');
        });

        test('should track file extensions', async () => {
            await fs.writeFile(path.join(tempDir, 'src', 'e.ts'), '');

            const files = await scanner.scanProject(tempDir, { language: 'all' });
            const stats = scanner.getStats(files, tempDir);

            expect(stats.byExtension.get('.js')).toBe(4);
            expect(stats.byExtension.get('.ts')).toBe(1);
        });
    });

    describe('Custom Configuration', () => {
        test('should use custom source directories', async () => {
            const customScanner = new PathScanningHelper({
                verbose: false,
                sourceDirs: ['custom-src', 'my-lib']
            });

            await fs.mkdir(path.join(tempDir, 'custom-src'), { recursive: true });
            await fs.writeFile(path.join(tempDir, 'custom-src', 'index.js'), '');

            const files = await customScanner.scanProject(tempDir, { language: 'javascript' });

            expect(files.length).toBe(1);
            expect(files[0]).toContain('custom-src/index.js');
        });

        test('should use custom skip directories', async () => {
            const customScanner = new PathScanningHelper({
                verbose: false,
                skipDirs: ['node_modules', '.git', 'custom-skip']
            });

            await fs.mkdir(path.join(tempDir, 'src'), { recursive: true });
            await fs.mkdir(path.join(tempDir, 'custom-skip'), { recursive: true });

            await fs.writeFile(path.join(tempDir, 'src', 'index.js'), '');
            await fs.writeFile(path.join(tempDir, 'custom-skip', 'index.js'), '');

            const files = await customScanner.scanProject(tempDir, { language: 'javascript' });

            expect(files.length).toBe(1);
            expect(files[0]).toContain('src/index.js');
            expect(files.some(f => f.includes('custom-skip'))).toBe(false);
        });

        test('should respect max depth limit', async () => {
            const shallowScanner = new PathScanningHelper({
                verbose: false,
                maxDepth: 2
            });

            const deepPath = path.join(tempDir, 'src', 'a', 'b', 'c', 'd');
            await fs.mkdir(deepPath, { recursive: true });
            await fs.writeFile(path.join(deepPath, 'deep.js'), '');
            await fs.writeFile(path.join(tempDir, 'src', 'shallow.js'), '');

            const files = await shallowScanner.scanProject(tempDir, { language: 'javascript' });

            // Should only find shallow.js (maxDepth=2 means tempDir -> src -> file)
            expect(files.length).toBe(1);
            expect(files[0]).toContain('shallow.js');
        });
    });

    describe('Monorepo Support', () => {
        test('should scan monorepo packages with src/', async () => {
            // Create monorepo structure
            await fs.mkdir(path.join(tempDir, 'packages', 'frontend', 'src'), { recursive: true });
            await fs.mkdir(path.join(tempDir, 'packages', 'backend', 'src'), { recursive: true });

            await fs.writeFile(path.join(tempDir, 'packages', 'frontend', 'src', 'index.js'), '');
            await fs.writeFile(path.join(tempDir, 'packages', 'backend', 'src', 'index.js'), '');

            const files = await scanner.scanProject(tempDir, { language: 'javascript' });

            expect(files.length).toBe(2);
            expect(files.some(f => f.includes('frontend/src/index.js'))).toBe(true);
            expect(files.some(f => f.includes('backend/src/index.js'))).toBe(true);
        });
    });
});
