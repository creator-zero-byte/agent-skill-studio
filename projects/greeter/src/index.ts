export interface Context {
  skillName: string;
  workspace: string;
  logger: {
    info: (msg: string) => void;
    error: (msg: string) => void;
    warn: (msg: string) => void;
  };
}

export interface Skill {
  name: string;
  version: string;
  description: string;
  author: { name: string; email: string };
  license: string;
  inputs: any;
  outputs: any;
  execute: (context: Context, inputs: any) => Promise<any>;
}

const greetings = {
  cheerful: ['Hello', 'Hi there', 'Greetings', 'Welcome'],
  formal: ['Good day', 'Dear', 'Respected'],
  sarcastic: ['Oh, it\'s you', 'Well, look who decided to show up', 'Great, another meeting']
};

export const skill: Skill = {
  name: 'greeter',
  version: '0.1.0',
  description: 'A friendly greeting skill that responds to names',
  author: { name: 'Creator Zero', email: 'creator-zero@protonmail.com' },
  license: 'MIT',
  inputs: {
    type: 'object',
    properties: {
      name: { type: 'string', description: 'Name of the person to greet' },
      mood: { type: 'string', description: 'Optional: cheerful, formal, sarcastic', default: 'cheerful' }
    },
    required: ['name']
  },
  outputs: {
    type: 'object',
    properties: {
      greeting: { type: 'string', description: 'The greeting message' },
      timestamp: { type: 'string', description: 'When the greeting was generated' }
    }
  },
  execute: async (context: Context, inputs: any): Promise<any> => {
    context.logger.info(`Greeting ${inputs.name} with ${inputs.mood} mood`);

    const moodGreetings = greetings[inputs.mood as keyof typeof greetings] || greetings.cheerful;
    const greetingPrefix = moodGreetings[Math.floor(Math.random() * moodGreetings.length)];
    const punctuation = inputs.mood === 'sarcastic' ? '...' : '!';

    return {
      greeting: `${greetingPrefix}${punctuation} ${inputs.name}`,
      timestamp: new Date().toISOString()
    };
  }
};