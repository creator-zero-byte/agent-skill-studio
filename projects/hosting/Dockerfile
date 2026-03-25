# AgentSkill Hosting - Docker Runtime
# Run OpenClaw with customer skills pre-loaded
FROM ghcr.io/openclaw/openclaw:latest

# Install dependencies
USER root
RUN apt-get update && apt-get install -y \
    curl \
    jq \
    && rm -rf /var/lib/apt/lists/*

# Copy skills
COPY skills/ /app/.openclaw/skills/
COPY config.yaml /app/.openclaw/config.yaml

# Expose ports (OpenClaw web UI + API)
EXPOSE 3000 3333

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3333/health || exit 1

# Start OpenClaw
CMD ["openclaw", "run", "--config", "/app/.openclaw/config.yaml"]