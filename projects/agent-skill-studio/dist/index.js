#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const create_1 = require("./commands/create");
const list_1 = require("./commands/list");
const test_1 = require("./commands/test");
const package_1 = require("./commands/package");
const program = new commander_1.Command();
const banner = `
 _   _                  _____ _     _
| \\ | | _____  ___  _  |_   _| |__ | |__   ___ _ __ ___   ___
|  \\| |/ _ \\ \\/ / | | |  | | | '_ \\| '_ \\ / _ \\ '_ \` _ \\ / __|
| |\\  |  __/>  <| |_| |  | | | | | | | | |  __/ | | | | | (__
|_| \\_|\\___/_/\\_\\\\__,_|  |_| |_| |_|_| |_|\\___|_| |_| |_|\\___|
v0.1.0-alpha
`;
console.log(chalk_1.default.cyan.bold(banner));
console.log(chalk_1.default.white('Creator Zero · OpenClaw Skill Studio\n'));
program
    .name('skill-studio')
    .description('CLI tool for creating and managing OpenClaw agent skills')
    .version('0.1.0-alpha');
program.command('create <skill-name>')
    .description('Create a new skill from template')
    .option('-t, --template <template>', 'Template to use', 'basic')
    .action(create_1.createSkill);
program.command('list')
    .description('List all skills in current directory')
    .action(list_1.listSkills);
program.command('test <skill-name>')
    .description('Test a skill locally')
    .option('-i, --input <input>', 'Test input JSON', '{}')
    .action(test_1.testSkill);
program.command('package <skill-name>')
    .description('Package a skill for distribution')
    .option('-o, --output <dir>', 'Output directory', './dist')
    .action(package_1.packageSkill);
program.parse();
//# sourceMappingURL=index.js.map