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

export const skill: Skill = {
  name: 'sqlite-query',
  version: '0.1.0',
  description: 'Query SQLite databases. For demo uses in-memory store; production connects to real .db files.',
  author: { name: 'Creator Zero', email: 'creator-zero@protonmail.com' },
  license: 'MIT',
  inputs: {
    type: 'object',
    properties: {
      query: { type: 'string', description: 'SQL SELECT query' },
      data: {
        type: 'array',
        description: 'Optional: initial data rows (for in-memory demo)',
        items: { type: 'object' }
      }
    },
    required: ['query']
  },
  outputs: {
    type: 'object',
    properties: {
      rows: { type: 'array', items: { type: 'object' } },
      rowCount: { type: 'number' }
    }
  },
  execute: async (context: Context, inputs: any): Promise<any> => {
    context.logger.info(`Executing query: ${inputs.query}`);

    // Mock implementation: parse simple SELECT * from JSON array
    // In production, use better-sqlite3 or sqlite3
    try {
      const rows = inputs.data || [];
      const query = inputs.query.trim().toLowerCase();

      // Very simple parsing for demo only
      if (query.includes('select *')) {
        return { rows, rowCount: rows.length };
      }

      // Filter support: SELECT * WHERE field=value
      const whereMatch = query.match(/where\s+(\w+)=(\w+)/);
      if (whereMatch) {
        const [, field, value] = whereMatch;
        const filtered = rows.filter((row: any) => row[field] == value);
        return { rows: filtered, rowCount: filtered.length };
      }

      return { rows: [], rowCount: 0 };
    } catch (err: any) {
      context.logger.error(`Query failed: ${err.message}`);
      throw err;
    }
  }
};