# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

---

## Reporting a Vulnerability

If you discover a security vulnerability in Grandpa or its CLI scanner:

1. **Do not disclose publicly**: Please do not open public issues regarding security vulnerabilities.
2. **Contact maintainers**: Send details to `security@bytewhisker.dev` or use GitHub's private vulnerability reporting feature on [our repository](https://github.com/bytewhisker/grandpa/security/advisories).
3. **Response time**: We aim to acknowledge receipt of security reports within 48 hours and provide a fix or mitigation within 7 business days.

---

## Philosophy on Security

Grandpa actively guards against supply chain attacks and AI-injected vulnerabilities:
- The **`grandpa-guard`** pre-commit hook and skill mechanically block unvetted packages from entering codebases.
- The **CLI Scanner** checks for missing timeouts, unvalidated redirects, and unsafe evaluation patterns (`eval`, unescaped child processes).
