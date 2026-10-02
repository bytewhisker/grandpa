# GitHub Actions Workflows for Grandpa

This directory contains pre-configured workflows for automated CI/CD and benchmarking:

- **`ci.yml`**: Runs `npm test` across Node 18, 20, and 22, and verifies `node bin/grandpa.js scan --strict` on every push/PR.
- **`benchmark.yml`**: Runs the 500-run empirical benchmark suite automatically on release or schedule.

To enable in your repository:
Copy these files into `.github/workflows/` or add them via GitHub's Web UI.
