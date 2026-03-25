import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';

export async function packageSkill(skillName: string, options: any) {
  const skillPath = path.resolve(process.cwd(), skillName);
  const manifestPath = path.join(skillPath, 'skill.json');
  const outputDir = path.resolve(process.cwd(), options.output || './dist');

  const spinner = ora('Packaging skill...').start();

  try {
    // Validate skill
    const manifest = await fs.readJSON(manifestPath);
    const skill = manifest.skill;

    // Check build
    const builtFile = path.join(skillPath, 'dist', 'index.js');
    if (!(await fs.pathExists(builtFile))) {
      spinner.warn('Skill not built. Building first...');
      try {
        const { execSync } = require('child_process');
        execSync('npm run build', { cwd: skillPath, stdio: 'inherit' });
      } catch {
        throw new Error('Build failed. Ensure TypeScript compiles successfully.');
      }
    }

    // Create package manifest
    const packageDir = path.join(outputDir, `${skill.name}-${skill.version}`);
    await fs.ensureDir(packageDir);

    // Copy built files
    await fs.copy(path.join(skillPath, 'dist'), path.join(packageDir, 'dist'));
    await fs.copy(path.join(skillPath, 'skill.json'), path.join(packageDir, 'skill.json'));

    // Copy README if exists
    const readmePath = path.join(skillPath, 'README.md');
    if (await fs.pathExists(readmePath)) {
      await fs.copy(readmePath, path.join(packageDir, 'README.md'));
    }

    // Copy license if exists
    const licensePath = path.join(skillPath, 'LICENSE');
    if (await fs.pathExists(licensePath)) {
      await fs.copy(licensePath, path.join(packageDir, 'LICENSE'));
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

    await fs.writeJSON(
      path.join(packageDir, 'package.json'),
      packageMeta,
      { spaces: 2 }
    );

    // Create tar.gz (placeholder - would need tar command)
    // For MVP we just create the directory

    spinner.succeed(chalk.green(`Skill packaged successfully!`));
    console.log(chalk.gray(`\nPackage created at: ${packageDir}`));
    console.log(chalk.cyan('\nContents:'));
    console.log('  dist/          Compiled JavaScript');
    console.log('  skill.json     Skill manifest');
    console.log('  README.md      Documentation');
    console.log('  package.json   Package metadata');
    console.log('');
  } catch (error: any) {
    spinner.fail(chalk.red('Packaging failed'));
    console.error(chalk.red(error.message));
    process.exit(1);
  }
}