"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.skill = void 0;
exports.skill = {
    name: 'http-request',
    version: '0.1.0',
    description: 'Make HTTP requests to any API. Fetch data, POST forms, handle auth.',
    author: { name: 'Creator Zero', email: 'creator-zero@protonmail.com' },
    license: 'MIT',
    inputs: {
        type: 'object',
        properties: {
            url: { type: 'string', description: 'Target URL' },
            method: { type: 'string', enum: ['GET', 'POST', 'PUT', 'DELETE'], default: 'GET' },
            headers: { type: 'object', description: 'HTTP headers', additionalProperties: { type: 'string' } },
            body: { type: 'object', description: 'Request body (for POST/PUT)' }
        },
        required: ['url']
    },
    outputs: {
        type: 'object',
        properties: {
            status: { type: 'number', description: 'HTTP status code' },
            headers: { type: 'object', description: 'Response headers' },
            data: { type: 'any', description: 'Response body (parsed JSON if applicable)' },
            ok: { type: 'boolean', description: 'Whether request succeeded' }
        }
    },
    execute: async (context, inputs) => {
        const http = require('http').request;
        const https = require('https').request;
        const { URL } = require('url');
        const url = new URL(inputs.url);
        const isHttps = url.protocol === 'https:';
        const lib = isHttps ? https : http;
        const options = {
            hostname: url.hostname,
            port: url.port || (isHttps ? 443 : 80),
            path: url.pathname + url.search,
            method: inputs.method || 'GET',
            headers: inputs.headers || {}
        };
        context.logger.info(`Making ${options.method} request to ${inputs.url}`);
        return new Promise((resolve, reject) => {
            const req = lib(options, (res) => {
                let chunks = [];
                res.on('data', (chunk) => chunks.push(chunk));
                res.on('end', () => {
                    const buffer = Buffer.concat(chunks);
                    let data;
                    try {
                        const contentType = res.headers['content-type'] || '';
                        if (contentType.includes('application/json')) {
                            data = JSON.parse(buffer.toString());
                        }
                        else {
                            data = buffer.toString();
                        }
                    }
                    catch (e) {
                        data = buffer.toString();
                    }
                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        data,
                        ok: res.statusCode >= 200 && res.statusCode < 400
                    });
                });
            });
            req.on('error', reject);
            if (inputs.body && ['POST', 'PUT', 'PATCH'].includes(options.method)) {
                const bodyStr = JSON.stringify(inputs.body);
                req.setHeader('Content-Type', 'application/json');
                req.setHeader('Content-Length', Buffer.byteLength(bodyStr));
                req.write(bodyStr);
            }
            req.end();
        });
    }
};
//# sourceMappingURL=index.js.map