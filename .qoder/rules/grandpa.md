# Grandpa Architecture Rules for Qoder

- Prioritize native Node.js/Web APIs over npm packages.
- Never strip error handling or validation for the sake of brevity.
- Auto-replace common bloat: `axios` -> `fetch`, `moment` -> `Intl`/`Date`, `lodash` -> built-ins.
