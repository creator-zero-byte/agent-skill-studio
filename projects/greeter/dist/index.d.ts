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
    author: {
        name: string;
        email: string;
    };
    license: string;
    inputs: any;
    outputs: any;
    execute: (context: Context, inputs: any) => Promise<any>;
}
export declare const skill: Skill;
//# sourceMappingURL=index.d.ts.map