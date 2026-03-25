import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';

export async function listSkills() {
  const cwd = process.cwd();
  const entries = await fs.readdir(cwd, { withFileTypes: true });

  const skillDirs = entries.filter(e => e.isDirectory()).map(e => e.name);

  if (skillDirs.length === 0) {
    console.log(chalk.yellow('No skills found in current directory.'));
    return;
  }

  const skills = [];

  for (const dir of skillDirs) {
    const manifestPath = path.join(cwd, dir, 'skill.json');
    try {
      const manifest = await fs.readJSON(manifestPath);
      skills.push({
        name: manifest.skill.name,
        version: manifest.skill.version,
        description: manifest.skill.description,
        path: path.join(cwd, dir)
      });
    } catch {
      // Not a skill directory
    }
  }

  if (skills.length === 0) {
    console.log(chalk.yellow('No skills found. Use `skill-studio create <name>` to create one.'));
    return;
  }

  console.log(chalk.cyan.bold(`\nFound ${skills.length} skill(s):\n`));
  console.log(chalk.gray('  NAME                     VERSION    DESCRIPTION'));
  console.log(chalk.gray('  ────────────────────────────────────────────────────────────────'));

  for (const skill of skills) {
    const namePad = skill.name.padEnd(24);
    const versionPad = skill.version.padEnd(10);
    const description = skill.description.length > 40
      ? skill.description.substring(0, 37) + '...'
      : skill.description;
    console.log(chalk.white(`  ${namePad}${versionPad}${description}`));
  }

  console.log('');
}