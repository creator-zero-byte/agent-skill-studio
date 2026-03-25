"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testSkill = testSkill;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const chalk_1 = __importDefault(require("chalk"));
async function testSkill(skillName, options) {
    const skillPath = path_1.default.resolve(process.cwd(), skillName);
    const manifestPath = path_1.default.join(skillPath, 'skill.json');
    console.log(chalk_1.default.cyan(`Testing skill: ${skillName}`));
    try {
        const manifest = await fs_extra_1.default.readJSON(manifestPath);
        const skill = manifest.skill;
        // Check if built
        const builtPath = path_1.default.join(skillPath, 'dist', 'index.js');
        const isBuilt = await fs_extra_1.default.pathExists(builtPath);
        if (!isBuilt) {
            console.log(chalk_1.default.yellow('Skill not built. Building...'));
            const { execSync } = require('child_process');
            try {
                execSync('npm run build', { cwd: skillPath, stdio: 'inherit' });
            }
            catch {
                console.log(chalk_1.default.yellow('Build failed or npm not available. Trying direct TypeScript...'));
                // For now, we'll just try to require from src
            }
        }
        // Try to load the skill module (compiled JS)
        let skillImpl;
        try {
            if (isBuilt) {
                // Load compiled module
                skillImpl = require(builtPath);
                // The module should export a 'skill' object
                skillImpl = skillImpl.skill || skillImpl.default || skillImpl;
            }
            else {
                // Fallback: try to transpile on the fly (simplified)
                console.log(chalk_1.default.yellow('Skill not built. Building first...'));
                const { execSync } = require('child_process');
                try {
                    execSync('npm run build', { cwd: skillPath, stdio: 'inherit' });
                    skillImpl = require(builtPath);
                    skillImpl = skillImpl.skill || skillImpl.default || skillImpl;
                }
                catch {
                    throw new Error('Could not build or load skill');
                }
            }
        }
        catch (err) {
            console.error(chalk_1.default.red('Failed to load skill module:'), err);
            process.exit(1);
        }
        // Prepare context
        const context = {
            skillName: skill.name,
            workspace: skillPath,
            logger: {
                info: (msg) => console.log(chalk_1.default.gray(`[INFO] ${msg}`)),
                error: (msg) => console.error(chalk_1.default.red(`[ERROR] ${msg}`)),
                warn: (msg) => console.warn(chalk_1.default.yellow(`[WARN] ${msg}`))
            }
        };
        // Parse input
        let inputs = {};
        if (options.input && options.input !== '{}') {
            try {
                inputs = JSON.parse(options.input);
            }
            catch {
                console.log(chalk_1.default.yellow('Invalid JSON input, using empty object'));
            }
        }
        // Validate inputs against schema (basic)
        if (skill.inputs.required) {
            for (const req of skill.inputs.required) {
                if (!(req in inputs)) {
                    throw new Error(`Missing required input: ${req}`);
                }
            }
        }
        // Execute
        console.log(chalk_1.default.gray('\nExecuting...\n'));
        const start = Date.now();
        const result = await skillImpl.execute(context, inputs);
        const duration = Date.now() - start;
        console.log(chalk_1.default.green('\n✓ Execution complete'));
        console.log(chalk_1.default.gray(`  Duration: ${duration}ms`));
        console.log(chalk_1.default.cyan('\nResult:'));
        console.log(JSON.stringify(result, null, 2));
        console.log('');
    }
    catch (err) {
        console.error(chalk_1.default.red('Test failed:'), err.message);
        process.exit(1);
    }
}
// Simple extraction for MVP - in real version we'd compile TypeScript
function extractExecuteFunction(source) {
    // This is a hack - in production we'd use proper transpilation
    const match = source.match(/execute:\s*async\s*\([^)]*\)\s*=>\s*{([\s\S]*?)}/);
    if (!match) {
        throw new Error('Could not find execute function');
    }
    // Return a mock function that just logs
    return {
        execute: async (context, inputs) => {
            console.log('Executing skill with inputs:', inputs);
            return { result: 'Mock output (install TypeScript for real execution)' };
        }
    };
}
//# sourceMappingURL=test.js.map