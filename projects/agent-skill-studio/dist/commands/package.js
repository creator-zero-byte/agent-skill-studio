"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.packageSkill = packageSkill;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const chalk_1 = __importDefault(require("chalk"));
const ora_1 = __importDefault(require("ora"));
async function packageSkill(skillName, options) {
    const skillPath = path_1.default.resolve(process.cwd(), skillName);
    const manifestPath = path_1.default.join(skillPath, 'skill.json');
    const outputDir = path_1.default.resolve(process.cwd(), options.output || './dist');
    const spinner = (0, ora_1.default)('Packaging skill...').start();
    try {
        // Validate skill
        const manifest = await fs_extra_1.default.readJSON(manifestPath);
        const skill = manifest.skill;
        // Check build
        const builtFile = path_1.default.join(skillPath, 'dist', 'index.js');
        if (!(await fs_extra_1.default.pathExists(builtFile))) {
            spinner.warn('Skill not built. Building first...');
            try {
                const { execSync } = require('child_process');
                execSync('npm run build', { cwd: skillPath, stdio: 'inherit' });
            }
            catch {
                throw new Error('Build failed. Ensure TypeScript compiles successfully.');
            }
        }
        // Create package manifest
        const packageDir = path_1.default.join(outputDir, `${skill.name}-${skill.version}`);
        await fs_extra_1.default.ensureDir(packageDir);
        // Copy built files
        await fs_extra_1.default.copy(path_1.default.join(skillPath, 'dist'), path_1.default.join(packageDir, 'dist'));
        await fs_extra_1.default.copy(path_1.default.join(skillPath, 'skill.json'), path_1.default.join(packageDir, 'skill.json'));
        // Copy README if exists
        const readmePath = path_1.default.join(skillPath, 'README.md');
        if (await fs_extra_1.default.pathExists(readmePath)) {
            await fs_extra_1.default.copy(readmePath, path_1.default.join(packageDir, 'README.md'));
        }
        // Copy license if exists
        const licensePath = path_1.default.join(skillPath, 'LICENSE');
        if (await fs_extra_1.default.pathExists(licensePath)) {
            await fs_extra_1.default.copy(licensePath, path_1.default.join(packageDir, 'LICENSE'));
        }
        // Create package metadata
        const packageMeta = {
            name: skill.name,
            version: skill.version,
            description: skill.description,
            author: skill.author,
            license: skill.license,
            publishedAt: new Date().toISOString(),
            openclaw: {
                minVersion: '1.0.0',
                compatible: true
            },
            files: [
                'dist/**/*',
                'skill.json',
                'README.md',
                'LICENSE'
            ]
        };
        await fs_extra_1.default.writeJSON(path_1.default.join(packageDir, 'package.json'), packageMeta, { spaces: 2 });
        // Create tar.gz (placeholder - would need tar command)
        // For MVP we just create the directory
        spinner.succeed(chalk_1.default.green(`Skill packaged successfully!`));
        console.log(chalk_1.default.gray(`\nPackage created at: ${packageDir}`));
        console.log(chalk_1.default.cyan('\nContents:'));
        console.log('  dist/          Compiled JavaScript');
        console.log('  skill.json     Skill manifest');
        console.log('  README.md      Documentation');
        console.log('  package.json   Package metadata');
        console.log('');
    }
    catch (error) {
        spinner.fail(chalk_1.default.red('Packaging failed'));
        console.error(chalk_1.default.red(error.message));
        process.exit(1);
    }
}
//# sourceMappingURL=package.js.map