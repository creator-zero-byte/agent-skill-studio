"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.skill = void 0;
exports.skill = {
    name: 'weather',
    version: '0.1.0',
    description: 'Get current weather and forecast for any location (mock implementation for demo)',
    author: { name: 'Creator Zero', email: 'creator-zero@protonmail.com' },
    license: 'MIT',
    inputs: {
        type: 'object',
        properties: {
            location: { type: 'string', description: 'City name or "lat,lon"' },
            days: { type: 'number', default: 3, description: 'Forecast days' }
        },
        required: ['location']
    },
    outputs: {
        type: 'object',
        properties: {
            location: { type: 'string' },
            temperature: { type: 'number' },
            description: { type: 'string' },
            forecast: { type: 'array', items: { type: 'object' } }
        }
    },
    execute: async (context, inputs) => {
        context.logger.info(`Getting weather for ${inputs.location}`);
        // Mock data - in real version would call Open-Meteo API
        const mockTemp = 15 + Math.floor(Math.random() * 15);
        const conditions = ['Sunny', 'Partly cloudy', 'Cloudy', 'Light rain', 'Clear'];
        const condition = conditions[Math.floor(Math.random() * conditions.length)];
        const forecast = [];
        for (let i = 0; i < inputs.days; i++) {
            forecast.push({
                date: new Date(Date.now() + i * 86400000).toISOString().split('T')[0],
                temp_high: mockTemp + Math.floor(Math.random() * 5),
                temp_low: mockTemp - Math.floor(Math.random() * 5),
                description: conditions[Math.floor(Math.random() * conditions.length)]
            });
        }
        return {
            location: inputs.location,
            temperature: mockTemp,
            description: condition,
            forecast,
            updatedAt: new Date().toISOString()
        };
    }
};
//# sourceMappingURL=index.js.map