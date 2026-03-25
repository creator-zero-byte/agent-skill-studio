import { Context, Skill } from '../types/skill';

export const basicSkill: Skill = {
  name: '{{skillName}}',
  version: '0.1.0',
  description: 'A basic OpenClaw skill',
  author: {
    name: '{{authorName}}',
    email: '{{authorEmail}}'
  },
  license: 'MIT',
  inputs: {
    type: 'object',
    properties: {
      message: {
        type: 'string',
        description: 'Input message to process'
      }
    },
    required: ['message']
  },
  outputs: {
    type: 'object',
    properties: {
      result: {
        type: 'string',
        description: 'Processed result'
      },
      timestamp: {
        type: 'string',
        description: 'Execution timestamp'
      }
    }
  },
  execute: async (context: Context, inputs: any): Promise<any> => {
    console.log(`[{{skillName}}] Received:`, inputs.message);

    // Your skill logic here
    const result = `Processed: ${inputs.message}`;

    return {
      result,
      timestamp: new Date().toISOString()
    };
  }
};