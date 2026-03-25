export interface Skill {
  name: string;
  version: string;
  description: string;
  author: {
    name: string;
    email: string;
  };
  license: string;
  inputs: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
  outputs: {
    type: string;
    properties: Record<string, any>;
  };
  execute: (context: Context, inputs: any) => Promise<any>;
}

export interface Context {
  skillName: string;
  workspace: string;
  logger: {
    info: (msg: string) => void;
    error: (msg: string) => void;
    warn: (msg: string) => void;
  };
}

export interface SkillManifest {
  $schema: string;
  skill: Skill;
  hooks?: {
    preInstall?: () => Promise<void>;
    postInstall?: () => Promise<void>;
  };
}