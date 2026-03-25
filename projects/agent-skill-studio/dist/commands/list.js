"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listSkills = listSkills;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const chalk_1 = __importDefault(require("chalk"));
async function listSkills() {
    const cwd = process.cwd();
    const entries = await fs_extra_1.default.readdir(cwd, { withFileTypes: true });
    const skillDirs = entries.filter(e => e.isDirectory()).map(e => e.name);
    if (skillDirs.length === 0) {
        console.log(chalk_1.default.yellow('No skills found in current directory.'));
        return;
    }
    const skills = [];
    for (const dir of skillDirs) {
        const manifestPath = path_1.default.join(cwd, dir, 'skill.json');
        try {
            const manifest = await fs_extra_1.default.readJSON(manifestPath);
            skills.push({
                name: manifest.skill.name,
                version: manifest.skill.version,
                description: manifest.skill.description,
                path: path_1.default.join(cwd, dir)
            });
        }
        catch {
            // Not a skill directory
        }
    }
    if (skills.length === 0) {
        console.log(chalk_1.default.yellow('No skills found. Use `skill-studio create <name>` to create one.'));
        return;
    }
    console.log(chalk_1.default.cyan.bold(`\nFound ${skills.length} skill(s):\n`));
    console.log(chalk_1.default.gray('  NAME                     VERSION    DESCRIPTION'));
    console.log(chalk_1.default.gray('  ────────────────────────────────────────────────────────────────'));
    for (const skill of skills) {
        const namePad = skill.name.padEnd(24);
        const versionPad = skill.version.padEnd(10);
        const description = skill.description.length > 40
            ? skill.description.substring(0, 37) + '...'
            : skill.description;
        console.log(chalk_1.default.white(`  ${namePad}${versionPad}${description}`));
    }
    console.log('');
}
//# sourceMappingURL=list.js.map