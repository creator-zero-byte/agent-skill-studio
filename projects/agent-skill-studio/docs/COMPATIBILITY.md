# OpenClaw Compatibility

AgentSkill Studio 生成的标准技能**完全兼容** OpenClaw 官方技能系统。

## Supported Formats

### v1 Schema (Current)
```json
{
  "$schema": "https://schemas.openclaw.ai/skill/v1.json",
  "skill": {
    "name": "my-skill",
    "version": "0.1.0",
    "description": "...",
    "author": { "name": "...", "email": "..." },
    "license": "MIT",
    "inputs": { "type": "object", "properties": {...}, "required": [...] },
    "outputs": { "type": "object", "properties": {...} }
  }
}
```

### Execution Model
- **execute**: `(context: Context, inputs: any) => Promise<any>`
- Context provides: `skillName`, `workspace`, `logger`
- Must return plain object matching outputs schema

## Integration Points

1. **Local Skills Folder**
   - Place compiled skill folder under `~/.openclaw/skills/` or custom path
   - OpenClaw auto-loads on startup

2. **Skill Installation**
   ```bash
   # Method A: manual copy
   cp -r my-skill ~/.openclaw/skills/

   # Method B: symlink (for development)
   ln -s /path/to/my-skill ~/.openclaw/skills/
   ```

3. **Enable in Agent**
   - Edit `config.yaml`:
     ```yaml
     skills:
       enabled:
         - my-skill
     ```

## Differences

| Feature | AgentSkill Studio | Vanilla OpenClaw |
|---------|-------------------|------------------|
| Build step | Required (tsc) | Optional (YAML skills) |
| Type safety | Full TypeScript | YAML + shell scripts |
| Testing | CLI tester | Manual |
| Packaging | Standalone folder | In-place |

## Migration

Existing YAML-based skills can be ported to TypeScript with minimal changes:
1. Convert YAML to `skill.json`
2. Move shell logic to `execute` function
3. Add TypeScript types for inputs/outputs

See MIGRATION.md for detailed steps.

---

**Note**: AgentSkill Studio v0.1.0-alpha supports OpenClaw v1.8.0+
