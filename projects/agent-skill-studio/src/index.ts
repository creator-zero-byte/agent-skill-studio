#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { createSkill } from './commands/create';
import { listSkills } from './commands/list';
import { testSkill } from './commands/test';
import { packageSkill } from './commands/package';

const program = new Command();

const banner = `
 _   _                  _____ _     _
| \\ | | _____  ___  _  |_   _| |__ | |__   ___ _ __ ___   ___
|  \\| |/ _ \\ \\/ / | | |  | | | '_ \\| '_ \\ / _ \\ '_ \` _ \\ / __|
| |\\  |  __/>  <| |_| |  | | | | | | | | |  __/ | | | | | (__
|_| \\_|\\___/_/\\_\\\\__,_|  |_| |_| |_|_| |_|\\___|_| |_| |_|\\___|
v0.1.0-alpha
`;

console.log(chalk.cyan.bold(banner));
console.log(chalk.white('Creator Zero · OpenClaw Skill Studio\n'));

program
  .name('skill-studio')
  .description('CLI tool for creating and managing OpenClaw agent skills')
  .version('0.1.0-alpha');

program.command('create <skill-name>')
  .description('Create a new skill from template')
  .option('-t, --template <template>', 'Template to use', 'basic')
  .action(createSkill);

program.command('list')
  .description('List all skills in current directory')
  .action(listSkills);

program.command('test <skill-name>')
  .description('Test a skill locally')
  .option('-i, --input <input>', 'Test input JSON', '{}')
  .action(testSkill);

program.command('package <skill-name>')
  .description('Package a skill for distribution')
  .option('-o, --output <dir>', 'Output directory', './dist')
  .action(packageSkill);

program.parse();