import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { SkillManifest } from '../types/skill';

export async function testSkill(skillName: string, options: any) {
  const skillPath = path.resolve(process.cwd(), skillName);
  const manifestPath = path.join(skillPath, 'skill.json');

  console.log(chalk.cyan(`Testing skill: ${skillName}`));

  try {
    const manifest = await fs.readJSON(manifestPath) as SkillManifest;
    const skill = manifest.skill;

    // Check if built
    const builtPath = path.join(skillPath, 'dist', 'index.js');
    const isBuilt = await fs.pathExists(builtPath);

    if (!isBuilt) {
      console.log(chalk.yellow('Skill not built. Building...'));
      const { execSync } = require('child_process');
      try {
        execSync('npm run build', { cwd: skillPath, stdio: 'inherit' });
      } catch {
        console.log(chalk.yellow('Build failed or npm not available. Trying direct TypeScript...'));
        // For now, we'll just try to require from src
      }
    }

    // Try to load the skill module (compiled JS)
    let skillImpl: any;
    try {
      if (isBuilt) {
        // Load compiled module
        skillImpl = require(builtPath);
        // The module should export a 'skill' object
        skillImpl = skillImpl.skill || skillImpl.default || skillImpl;
      } else {
        // Fallback: try to transpile on the fly (simplified)
        console.log(chalk.yellow('Skill not built. Building first...'));
        const { execSync } = require('child_process');
        try {
          execSync('npm run build', { cwd: skillPath, stdio: 'inherit' });
          skillImpl = require(builtPath);
          skillImpl = skillImpl.skill || skillImpl.default || skillImpl;
        } catch {
          throw new Error('Could not build or load skill');
        }
      }
    } catch (err) {
      console.error(chalk.red('Failed to load skill module:'), err);
      process.exit(1);
    }

    // Prepare context
    const context = {
      skillName: skill.name,
      workspace: skillPath,
      logger: {
        info: (msg: string) => console.log(chalk.gray(`[INFO] ${msg}`)),
        error: (msg: string) => console.error(chalk.red(`[ERROR] ${msg}`)),
        warn: (msg: string) => console.warn(chalk.yellow(`[WARN] ${msg}`))
      }
    };

    // Parse input
    let inputs: any = {};
    if (options.input && options.input !== '{}') {
      try {
        inputs = JSON.parse(options.input);
      } catch {
        console.log(chalk.yellow('Invalid JSON input, using empty object'));
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
    console.log(chalk.gray('\nExecuting...\n'));
    const start = Date.now();
    const result = await skillImpl.execute(context, inputs);
    const duration = Date.now() - start;

    console.log(chalk.green('\n✓ Execution complete'));
    console.log(chalk.gray(`  Duration: ${duration}ms`));
    console.log(chalk.cyan('\nResult:'));
    console.log(JSON.stringify(result, null, 2));
    console.log('');

  } catch (err: any) {
    console.error(chalk.red('Test failed:'), err.message);
    process.exit(1);
  }
}

// Simple extraction for MVP - in real version we'd compile TypeScript
function extractExecuteFunction(source: string): any {
  // This is a hack - in production we'd use proper transpilation
  const match = source.match(/execute:\s*async\s*\([^)]*\)\s*=>\s*{([\s\S]*?)}/);
  if (!match) {
    throw new Error('Could not find execute function');
  }

  // Return a mock function that just logs
  return {
    execute: async (context: any, inputs: any) => {
      console.log('Executing skill with inputs:', inputs);
      return { result: 'Mock output (install TypeScript for real execution)' };
    }
  };
}