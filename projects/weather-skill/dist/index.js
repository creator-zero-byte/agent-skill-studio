"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.skill = void 0;
exports.skill = {
    name: 'weather',
    version: '0.1.0',
    description: 'Get current weather and forecast using Open-Meteo API (free, no key). Supports city names and coordinates.',
    author: { name: 'Creator Zero', email: 'creator-zero@protonmail.com' },
    license: 'MIT',
    inputs: {
        type: 'object',
        properties: {
            location: {
                type: 'string',
                description: 'City name (e.g., "Beijing") or coordinates "lat,lon" (e.g., "39.9042,116.4074")'
            },
            type: {
                type: 'string',
                enum: ['current', 'forecast'],
                default: 'current',
                description: 'Weather type to fetch'
            },
            days: {
                type: 'number',
                default: 3,
                minimum: 1,
                maximum: 7,
                description: 'Number of forecast days (1-7)'
            }
        },
        required: ['location']
    },
    outputs: {
        type: 'object',
        properties: {
            location: { type: 'string' },
            current: {
                type: 'object',
                properties: {
                    temperature: { type: 'number' },
                    windspeed: { type: 'number' },
                    weathercode: { type: 'number' }
                }
            },
            forecast: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        date: { type: 'string' },
                        temperature_min: { type: 'number' },
                        temperature_max: { type: 'number' },
                        weathercode: { type: 'number' }
                    }
                }
            }
        }
    },
    execute: async (context, inputs) => {
        context.logger.info(`Fetching weather for ${inputs.location}`);
        // Parse location: either "lat,lon" or city name
        let lat, lon;
        const loc = inputs.location;
        if (loc.includes(',') && !isNaN(parseFloat(loc.split(',')[0]))) {
            [lat, lon] = loc.split(',').map(Number);
        }
        else {
            // For demo, map known cities to coordinates
            // In production, use Nominatim geocoding API
            const cityCoords = {
                'beijing': { lat: 39.9042, lon: 116.4074 },
                'shanghai': { lat: 31.2304, lon: 121.4737 },
                'new york': { lat: 40.7128, lon: -74.0060 },
                'london': { lat: 51.5074, lon: -0.1278 },
                'tokyo': { lat: 35.6762, lon: 139.6503 }
            };
            const key = loc.toLowerCase();
            if (cityCoords[key]) {
                lat = cityCoords[key].lat;
                lon = cityCoords[key].lon;
            }
            else {
                // Default to Beijing if unknown
                lat = 39.9042;
                lon = 116.4074;
            }
        }
        if (inputs.type === 'forecast') {
            const days = Math.min(inputs.days || 3, 7);
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,weathercode&forecast_days=${days}&timezone=auto`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Open-Meteo API error: ${response.statusText}`);
            }
            const data = await response.json();
            const forecast = data.daily.time.map((date, i) => ({
                date,
                temperature_max: data.daily.temperature_2m_max[i],
                temperature_min: data.daily.temperature_2m_min[i],
                weathercode: data.daily.weathercode[i]
            }));
            return { location: inputs.location, forecast };
        }
        else {
            // Current weather
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Open-Meteo API error: ${response.statusText}`);
            }
            const data = await response.json();
            return {
                location: inputs.location,
                current: {
                    temperature: data.current_weather.temperature,
                    windspeed: data.current_weather.windspeed,
                    weathercode: data.current_weather.weathercode
                },
                updatedAt: new Date().toISOString()
            };
        }
    }
};
//# sourceMappingURL=index.js.map