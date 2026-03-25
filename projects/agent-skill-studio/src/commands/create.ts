import fs from 'fs-extra';
import path from 'path';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { SkillManifest } from '../types/skill';

export async function createSkill(skillName: string, options: any) {
  const spinner = ora('Creating skill...').start();

  try {
    // Validate name
    if (!/^[a-z0-9-]+$/.test(skillName)) {
      throw new Error('Skill name must be lowercase alphanumeric with hyphens');
    }

    const targetDir = path.resolve(process.cwd(), skillName);

    if (await fs.pathExists(targetDir)) {
      throw new Error(`Directory ${skillName} already exists`);
    }

    // Prompt for metadata
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'description',
        message: 'Skill description:',
        default: `A useful OpenClaw skill`
      },
      {
        type: 'input',
        name: 'authorName',
        message: 'Author name:',
        default: 'Creator Zero'
      },
      {
        type: 'input',
        name: 'authorEmail',
        message: 'Author email:',
        default: 'creator-zero@protonmail.com'
      }
    ]);

    // Create directory structure
    await fs.ensureDir(targetDir);
    await fs.ensureDir(path.join(targetDir, 'src'));
    await fs.ensureDir(path.join(targetDir, 'tests'));

    // Generate skill.ts
    const skillContent = generateSkillCode(skillName, answers);
    await fs.writeFile(
      path.join(targetDir, 'src', 'index.ts'),
      skillContent
    );

    // Generate manifest (skill.json)
    const manifest: SkillManifest = {
      $schema: 'https://schemas.openclaw.ai/skill/v1.json',
      skill: {
        name: skillName,
        version: '0.1.0',
        description: answers.description,
        author: {
          name: answers.authorName,
          email: answers.authorEmail
        },
        license: 'MIT',
        inputs: {
          type: 'object',
          properties: {
            input: {
              type: 'string',
              description: 'Input to process'
            }
          },
          required: ['input']
        },
        outputs: {
          type: 'object',
          properties: {
            result: {
              type: 'string',
              description: 'Skill output'
            }
          }
        },
        execute: async () => ({ result: 'Hello from your new skill!' })
      }
    };

    await fs.writeJSON(
      path.join(targetDir, 'skill.json'),
      manifest,
      { spaces: 2 }
    );

    // Generate README
    await fs.writeFile(
      path.join(targetDir, 'README.md'),
      `# ${skillName}\n\n${answers.description}\n\n## Installation\n\n\`\`\`bash\nskill-studio install ./${skillName}\n\`\`\`\n\n## Usage\n\nTODO\n`
    );

    // Generate .gitignore
    await fs.writeFile(
      path.join(targetDir, '.gitignore'),
      'node_modules\ndist\n.DS_Store\n'
    );

    // Generate package.json for the skill
    const skillPackage = {
      name: `@creator-zero/${skillName}`,
      version: '0.1.0',
      main: 'dist/index.js',
      scripts: {
        build: 'tsc',
        test: 'jest'
      },
      dependencies: {},
      devDependencies: {
        typescript: '^5.3.0',
        '@types/node': '^20.0.0'
      }
    };
    await fs.writeJSON(
      path.join(targetDir, 'package.json'),
      skillPackage,
      { spaces: 2 }
    );

    // Generate tsconfig.json
    await fs.writeFile(
      path.join(targetDir, 'tsconfig.json'),
      JSON.stringify({
        extends: '../../tsconfig.json',
        compilerOptions: {
          outDir: './dist',
          rootDir: './src'
        },
        include: ['src/**/*']
      }, null, 2)
    );

    spinner.succeed(chalk.green(`Skill "${skillName}" created successfully!`));

    console.log(chalk.gray('\nNext steps:'));
    console.log(chalk.cyan(`  cd ${skillName}`));
    console.log(chalk.cyan('  npm install'));
    console.log(chalk.cyan('  npm run build'));
    console.log(chalk.cyan('  skill-studio test .'));
  } catch (error: any) {
    spinner.fail(chalk.red('Failed to create skill'));
    console.error(chalk.red(error.message));
    process.exit(1);
  }
}

function generateSkillCode(name: string, meta: any): string {
  return `import { Context, Skill } from 'agent-skill-studio';

export const skill: Skill = {
  name: '${name}',
  version: '0.1.0',
  description: \`${meta.description}\`,
  author: {
    name: '${meta.authorName}',
    email: '${meta.authorEmail}'
  },
  license: 'MIT',
  inputs: {
    type: 'object',
    properties: {
      input: {
        type: 'string',
        description: 'Input to process'
      }
    },
    required: ['input']
  },
  outputs: {
    type: 'object',
    properties: {
      result: {
        type: 'string',
        description: 'Skill output'
      },
      processedAt: {
        type: 'string',
        description: 'Timestamp'
      }
    }
  },
  execute: async (context: Context, inputs: any): Promise<any> => {
    context.logger.info(\`[${name}] Executing with: \${inputs.input}\`);

    // TODO: Implement your skill logic here
    const result = inputs.input.toUpperCase();

    return {
      result,
      processedAt: new Date().toISOString()
    };
  }
};
`;
}