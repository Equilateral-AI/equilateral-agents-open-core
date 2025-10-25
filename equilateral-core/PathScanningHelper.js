/**
 * Path Scanning Helper - Centralized path scanning logic for all agents
 *
 * MIT License
 * Copyright (c) 2025 HappyHippo.ai
 *
 * Ensures all agents scan the correct source directories including src/
 * Provides consistent logging and configuration across all agents
 */

const fs = require('fs').promises;
const path = require('path');

class PathScanningHelper {
    constructor(config = {}) {
        // Common source directory patterns to prioritize
        this.sourceDirs = config.sourceDirs || [
            'src',
            'lib',
            'app',
            'source',
            'server',
            'client',
            'api',
            'services',
            'controllers',
            'models',
            'routes',
            'components',
            'pages'
        ];

        // Directories to always skip
        this.skipDirs = config.skipDirs || [
            'node_modules',
            '.git',
            'dist',
            'build',
            '.next',
            'coverage',
            'out',
            'target',
            '.vscode',
            '.idea',
            '__pycache__',
            'vendor',
            'tmp',
            'temp'
        ];

        // Extensions to scan by language
        this.extensions = config.extensions || {
            javascript: ['.js', '.jsx', '.mjs', '.cjs'],
            typescript: ['.ts', '.tsx'],
            python: ['.py'],
            java: ['.java'],
            go: ['.go'],
            rust: ['.rs'],
            all: ['.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.go', '.rs', '.c', '.cpp', '.h', '.hpp']
        };

        this.verbose = config.verbose !== false;
        this.maxDepth = config.maxDepth || 10;
        this.followSymlinks = config.followSymlinks || false;
    }

    /**
     * Scan project directory for code files
     * Always scans src/ first if it exists
     */
    async scanProject(projectPath, options = {}) {
        const language = options.language || 'all';
        const extensions = this.extensions[language] || this.extensions.all;

        this.log(`🔍 Scanning project: ${projectPath}`);
        this.log(`📝 Language filter: ${language}`);
        this.log(`📦 Extensions: ${extensions.join(', ')}`);

        const files = [];
        const scannedDirs = new Set();

        // First, explicitly check for and scan common source directories
        const priorityDirs = await this.findPrioritySourceDirs(projectPath);

        if (priorityDirs.length > 0) {
            this.log(`✅ Found priority source directories: ${priorityDirs.join(', ')}`);

            for (const dir of priorityDirs) {
                const dirPath = path.join(projectPath, dir);
                this.log(`  📂 Scanning ${dir}/...`);
                const dirFiles = await this.scanDirectory(dirPath, extensions, 0, scannedDirs);
                files.push(...dirFiles);
                this.log(`    ✓ Found ${dirFiles.length} files in ${dir}/`);
            }
        } else {
            this.log(`⚠️  No standard source directories found (src/, lib/, app/, etc.)`);
        }

        // Then scan remaining directories (avoid re-scanning)
        this.log(`📂 Scanning remaining project directories...`);
        const remainingFiles = await this.scanDirectory(
            projectPath,
            extensions,
            0,
            scannedDirs,
            true // skipIfScanned
        );
        files.push(...remainingFiles);

        this.log(`✅ Scan complete: ${files.length} files found`);
        this.logScanSummary(files, projectPath);

        return files;
    }

    /**
     * Find priority source directories (src/, lib/, app/, etc.)
     */
    async findPrioritySourceDirs(projectPath) {
        const found = [];

        for (const sourceDir of this.sourceDirs) {
            const dirPath = path.join(projectPath, sourceDir);
            try {
                const stats = await fs.stat(dirPath);
                if (stats.isDirectory()) {
                    found.push(sourceDir);
                }
            } catch (error) {
                // Directory doesn't exist, skip
            }
        }

        return found;
    }

    /**
     * Recursively scan directory for code files
     */
    async scanDirectory(dirPath, extensions, depth = 0, scannedDirs = new Set(), skipIfScanned = false) {
        const files = [];

        // Prevent infinite recursion
        if (depth > this.maxDepth) {
            this.log(`⚠️  Max depth (${this.maxDepth}) reached: ${dirPath}`);
            return files;
        }

        // Avoid scanning same directory twice
        const normalizedPath = path.resolve(dirPath);
        if (scannedDirs.has(normalizedPath)) {
            if (skipIfScanned) {
                return files;
            }
        }
        scannedDirs.add(normalizedPath);

        try {
            const entries = await fs.readdir(dirPath, { withFileTypes: true });

            for (const entry of entries) {
                const fullPath = path.join(dirPath, entry.name);

                if (entry.isDirectory()) {
                    // Skip directories in skip list
                    if (this.shouldSkipDirectory(entry.name)) {
                        continue;
                    }

                    // Skip hidden directories
                    if (entry.name.startsWith('.') && entry.name !== '.') {
                        continue;
                    }

                    // Recursively scan subdirectory
                    const subFiles = await this.scanDirectory(
                        fullPath,
                        extensions,
                        depth + 1,
                        scannedDirs,
                        false
                    );
                    files.push(...subFiles);

                } else if (entry.isFile()) {
                    // Check if file extension matches
                    if (this.matchesExtension(entry.name, extensions)) {
                        files.push(fullPath);
                    }
                } else if (entry.isSymbolicLink() && this.followSymlinks) {
                    // Handle symlinks if enabled
                    try {
                        const stats = await fs.stat(fullPath);
                        if (stats.isDirectory()) {
                            const subFiles = await this.scanDirectory(
                                fullPath,
                                extensions,
                                depth + 1,
                                scannedDirs,
                                false
                            );
                            files.push(...subFiles);
                        } else if (stats.isFile() && this.matchesExtension(entry.name, extensions)) {
                            files.push(fullPath);
                        }
                    } catch (error) {
                        this.log(`⚠️  Failed to follow symlink: ${fullPath}`);
                    }
                }
            }
        } catch (error) {
            this.log(`❌ Error scanning directory ${dirPath}: ${error.message}`);
        }

        return files;
    }

    /**
     * Check if directory should be skipped
     */
    shouldSkipDirectory(dirName) {
        return this.skipDirs.includes(dirName);
    }

    /**
     * Check if file extension matches
     */
    matchesExtension(fileName, extensions) {
        return extensions.some(ext => fileName.endsWith(ext));
    }

    /**
     * Log scan summary
     */
    logScanSummary(files, projectPath) {
        if (!this.verbose) return;

        const byDir = new Map();

        files.forEach(file => {
            const relPath = path.relative(projectPath, file);
            const dir = path.dirname(relPath).split(path.sep)[0] || '.';

            if (!byDir.has(dir)) {
                byDir.set(dir, 0);
            }
            byDir.set(dir, byDir.get(dir) + 1);
        });

        this.log('\n📊 Files by directory:');
        const sortedDirs = Array.from(byDir.entries()).sort((a, b) => b[1] - a[1]);
        sortedDirs.forEach(([dir, count]) => {
            this.log(`  ${dir}/: ${count} files`);
        });

        // Check if src/ was scanned
        if (!byDir.has('src')) {
            this.log('\n⚠️  WARNING: No files found in src/ directory!');
            this.log('   If your project has a src/ directory, it may not have been scanned correctly.');
            this.log(`   Project path: ${projectPath}`);
        }
    }

    /**
     * Log message if verbose mode enabled
     */
    log(message) {
        if (this.verbose) {
            console.log(message);
        }
    }

    /**
     * Get scan statistics
     */
    getStats(files, projectPath) {
        const stats = {
            totalFiles: files.length,
            byDirectory: new Map(),
            byExtension: new Map(),
            directories: new Set(),
            hasSrcDirectory: false
        };

        files.forEach(file => {
            const relPath = path.relative(projectPath, file);
            const dir = path.dirname(relPath).split(path.sep)[0] || '.';
            const ext = path.extname(file);

            stats.directories.add(dir);

            if (dir === 'src') {
                stats.hasSrcDirectory = true;
            }

            if (!stats.byDirectory.has(dir)) {
                stats.byDirectory.set(dir, 0);
            }
            stats.byDirectory.set(dir, stats.byDirectory.get(dir) + 1);

            if (!stats.byExtension.has(ext)) {
                stats.byExtension.set(ext, 0);
            }
            stats.byExtension.set(ext, stats.byExtension.get(ext) + 1);
        });

        return stats;
    }
}

module.exports = PathScanningHelper;
