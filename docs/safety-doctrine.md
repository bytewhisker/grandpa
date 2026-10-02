# The Grandpa Safety Doctrine: Cut the Fat, Never Cut the Bone

## The Problem with Blind Minimalism

Recent minimalist coding trends have encouraged AI models to achieve ultra-short code ("code golf") by deleting necessary architecture:
- Deleting error boundaries to save 3 lines of code.
- Removing HTTP status checks to save 1 line of code.
- Stripping timeouts so hanging requests consume server resources indefinitely.
- Omitting input validation, exposing endpoints to injection.

**This is the Ponytail Trap.** Clean looking diffs that cause silent, devastating production failures.

---

## The Four Cardinal Laws of Grandpa

### Law 1: Fat vs Bone
- **The Fat**: Extra npm/pip packages when standard library primitives exist; unnecessary enterprise scaffolding; 400-line boilerplate wrappers.
- **The Bone**: Error handling, status assertion, network timeouts, edge-case null checks, types, and logging.
- **Directive**: Strip the fat mercilessly. Never touch the bone.

### Law 2: Standard Library Superiority
Third-party dependencies incur:
- Security audit requirements and CVE alerts.
- Dependency drift and breaking major-version upgrades.
- Install friction in CI/CD pipelines.
Standard library APIs receive multi-decade backwards compatibility guarantees from platform vendors.

### Law 3: Architectural Receipts
When an external package is legitimately needed for specialized work, make the decision visible and justified in code:
```javascript
// grandpa: allowed dependency [three] - WebGL 3D rendering pipeline required
```

### Law 4: Active Verification
Passive text rules are easily hallucinated away. Grandpa provides an active CLI scanner (`npx grandpa scan`) and a git pre-commit hook (`npx grandpa hook`) to enforce standards mechanically before commits hit production.
