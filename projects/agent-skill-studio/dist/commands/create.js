"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSkill = createSkill;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const inquirer_1 = __importDefault(require("inquirer"));
const chalk_1 = __importDefault(require("chalk"));
const ora_1 = __importDefault(require("ora"));
async function createSkill(skillName, options) {
    const spinner = (0, ora_1.default)('Creating skill...').start();
    try {
        // Validate name
        if (!/^[a-z0-9-]+$/.test(skillName)) {
            throw new Error('Skill name must be lowercase alphanumeric with hyphens');
        }
        const targetDir = path_1.default.resolve(process.cwd(), skillName);
        if (await fs_extra_1.default.pathExists(targetDir)) {
            throw new Error(`Directory ${skillName} already exists`);
        }
        // Prompt for metadata
        const answers = await inquirer_1.default.prompt([
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
        await fs_extra_1.default.ensureDir(targetDir);
        await fs_extra_1.default.ensureDir(path_1.default.join(targetDir, 'src'));
        await fs_extra_1.default.ensureDir(path_1.default.join(targetDir, 'tests'));
        // Generate skill.ts
        const skillContent = generateSkillCode(skillName, answers);
        await fs_extra_1.default.writeFile(path_1.default.join(targetDir, 'src', 'index.ts'), skillContent);
        // Generate manifest (skill.json)
        const manifest = {
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
        await fs_extra_1.default.writeJSON(path_1.default.join(targetDir, 'skill.json'), manifest, { spaces: 2 });
        // Generate README
        await fs_extra_1.default.writeFile(path_1.default.join(targetDir, 'README.md'), `# ${skillName}\n\n${answers.description}\n\n## Installation\n\n\`\`\`bash\nskill-studio install ./${skillName}\n\`\`\`\n\n## Usage\n\nTODO\n`);
        // Generate .gitignore
        await fs_extra_1.default.writeFile(path_1.default.join(targetDir, '.gitignore'), 'node_modules\ndist\n.DS_Store\n');
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
        await fs_extra_1.default.writeJSON(path_1.default.join(targetDir, 'package.json'), skillPackage, { spaces: 2 });
        // Generate tsconfig.json
        await fs_extra_1.default.writeFile(path_1.default.join(targetDir, 'tsconfig.json'), JSON.stringify({
            extends: '../../tsconfig.json',
            compilerOptions: {
                outDir: './dist',
                rootDir: './src'
            },
            include: ['src/**/*']
        }, null, 2));
        spinner.succeed(chalk_1.default.green(`Skill "${skillName}" created successfully!`));
        console.log(chalk_1.default.gray('\nNext steps:'));
        console.log(chalk_1.default.cyan(`  cd ${skillName}`));
        console.log(chalk_1.default.cyan('  npm install'));
        console.log(chalk_1.default.cyan('  npm run build'));
        console.log(chalk_1.default.cyan('  skill-studio test .'));
    }
    catch (error) {
        spinner.fail(chalk_1.default.red('Failed to create skill'));
        console.error(chalk_1.default.red(error.message));
        process.exit(1);
    }
}
function generateSkillCode(name, meta) {
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
//# sourceMappingURL=create.js.map