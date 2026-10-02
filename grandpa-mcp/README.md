# Grandpa MCP Server

Zero-dependency Model Context Protocol (MCP) server for Claude Desktop, Cursor, Windsurf, Devin, and any AI coding assistant.

## Features
- **`grandpa_scan`**: Scans the project for dependency bloat, fragile patterns, and missed native replacements.
- **`grandpa_audit`**: Generates a scored report (A+ to F) with estimated bundle and dependency savings.
- **`grandpa_guard`**: Real-time pre-execution inspection to catch fragile patterns.
- **`grandpa_migrate`**: Returns standard library replacement code for common bloat libraries.
- **`grandpa_rules`**: Retrieves intensity-specific architecture instructions.

## Installation

### Claude Desktop Configuration
Add to your `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "grandpa": {
      "command": "npx",
      "args": ["-y", "grandpa", "mcp"]
    }
  }
}
```

### Direct Run
```bash
node grandpa-mcp/index.js
```
