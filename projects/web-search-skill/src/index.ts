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
  name: 'web-search',
  version: '0.1.0',
  description: 'Search the web using DuckDuckGo. Returns titles, URLs, and snippets. No API key required.',
  author: { name: 'Creator Zero', email: 'creator-zero@protonmail.com' },
  license: 'MIT',
  inputs: {
    type: 'object',
    properties: {
      query: { type: 'string', description: 'Search query' },
      count: {
        type: 'number',
        default: 5,
        minimum: 1,
        maximum: 10,
        description: 'Number of results (1-10)'
      }
    },
    required: ['query']
  },
  outputs: {
    type: 'object',
    properties: {
      results: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            url: { type: 'string' },
            snippet: { type: 'string' }
          }
        }
      },
      total: { type: 'number', description: 'Total results found' }
    }
  },
  execute: async (context: Context, inputs: any): Promise<any> => {
    context.logger.info(`Searching: "${inputs.query}"`);

    // Use DuckDuckGo Instant Answer API (no key required)
    const count = Math.min(inputs.count || 5, 10);
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(inputs.query)}&format=json&no_redirect=1&no_html=1`;

    try {
      const response = await fetch(url);
      const data: any = await response.json();

      // Parse DuckDuckGo response
      const results = [];

      // Abstract (summary)
      if (data.AbstractText) {
        results.push({
          title: data.Heading || data.AbstractSource,
          url: data.AbstractURL,
          snippet: data.AbstractText
        });
      }

      // Related Topics
      if (data.RelatedTopics) {
        for (const topic of data.RelatedTopics) {
          if (topic.FirstURL && topic.Text) {
            results.push({
              title: topic.FirstURL.split('/').pop().replace(/_/g, ' '),
              url: topic.FirstURL,
              snippet: topic.Text
            });
            if (results.length >= count) break;
          }
        }
      }

      return {
        results: results.slice(0, count),
        total: results.length
      };
    } catch (err: any) {
      context.logger.error(`Search failed: ${err.message}`);
      throw err;
    }
  }
};