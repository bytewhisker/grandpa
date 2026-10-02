# Grandpa: Motor de Arquitectura Sin Grasa para Agentes de IA

> *"En mis tiempos, no instalábamos 500 MB de dependencias para sumar dos números."*

Grandpa es el estándar de arquitectura y calidad de código probado en batalla para agentes de IA (Claude Code, Cursor, Windsurf, Devin, GitHub Copilot).

---

## Características Principales

1. **Cero Dependencias Innecesarias**: Reemplaza automáticamente bibliotecas redundantes (`axios`, `moment`, `lodash`, `uuid`) por primitivas estándar nativas de Node.js y la Web.
2. **Corta la Grasa, Nunca el Hueso**: Mantiene intactos el manejo de errores, tiempos de espera (`timeout`), validaciones de entrada y límites defensivos.
3. **Escáner Activo CLI**: Inspecciona tu código en tiempo real con `npx grandpa scan`.
4. **Guardia Pre-Commit**: Bloquea la inyección accidental de dependencias antes de confirmar cambios con Git.
5. **Servidor MCP**: Integración nativa con Claude Desktop y editores de IA compatibles con Model Context Protocol.

---

## Instalación Rápida

```bash
# Escanear el proyecto actual
npx @bytewhisker/grandpa scan

# Instalar reglas en Cursor, Windsurf y Claude
npx @bytewhisker/grandpa init

# Instalar gancho de git pre-commit
npx @bytewhisker/grandpa hook
```
