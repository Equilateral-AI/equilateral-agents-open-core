# Supported Project Structures & Architectural Patterns

EquilateralAgents is designed to work with **any** project structure. The agents automatically detect and adapt to your architecture.

## Backend Patterns Supported

The `BackendAuditorAgent` automatically detects these backend patterns:

### Serverless / Lambda
```
handlers/
functions/
lambda/
src/handlers/
src/backend/src/handlers/
backend/src/handlers/
```

**Frameworks:** AWS Lambda, Azure Functions, Google Cloud Functions, Serverless Framework

---

### MVC / Express / Node.js
```
controllers/
routes/
src/controllers/
src/routes/
api/routes/
```

**Frameworks:** Express.js, Fastify, Koa, NestJS, Hapi

---

### GraphQL
```
resolvers/
src/resolvers/
```

**Frameworks:** Apollo Server, GraphQL Yoga, TypeGraphQL

---

### Python Web Frameworks
```
views/
endpoints/
```

**Frameworks:** Django, Flask, FastAPI

---

### Microservices
```
services/
src/services/
```

**Frameworks:** Any microservices architecture

---

## Frontend Patterns Supported

The `FrontendAuditorAgent` and `UIUXSpecialistAgent` detect these frontend patterns:

### React / Vue / Angular
```
components/
features/
pages/
src/components/
src/frontend/src/components/
frontend/src/components/
```

### Next.js
```
app/
pages/
```

### Contexts / State Management
```
contexts/
src/contexts/
src/frontend/src/contexts/
```

---

## File Discovery Patterns

The `SecurityVulnerabilityAgent` scans these common structures:

### Backend Code
```
backend/src/handlers
backend/src/shared
src/backend/handlers
src/handlers
handlers
```

### Frontend Code
```
frontend/src/components
frontend/src/services
src/frontend/components
src/frontend/services
src/components
src/services
components
services
```

---

## What If Your Structure Is Different?

### Agents Gracefully Handle Unknown Structures

If your project uses a structure not listed here, the agents will:

1. **Skip unavailable patterns** - Won't fail if directories don't exist
2. **Log what they searched** - You'll see which patterns were checked
3. **Continue analysis** - Other agents still run normally

### Example Output for Unmatched Structure:
```
📁 No backend logic directory found (handlers/controllers/routes/etc.)
✓ Acceptable for frontend-only, static sites, or unsupported patterns
```

### Unsupported Patterns Still Work!

Even if your exact structure isn't listed, agents will:
- Scan all JavaScript/TypeScript files
- Check for common security issues
- Analyze code quality
- Just won't do structure-specific audits

---

## Frontend-Only Projects

**Fully supported!** If you have no backend:
- Backend agents skip gracefully
- Frontend agents run normally
- Security scans work across all files

---

## Static Sites

**Fully supported!** For Gatsby, Jekyll, Hugo, 11ty:
- Structure-agnostic scanning
- Security checks on build scripts
- Code quality analysis

---

## Monorepos

**Partially supported:**
- Point agents at specific packages
- Run workflows per package
- Full monorepo support in commercial version

---

## Configuration

### Option 1: Let Agents Auto-Detect (Recommended)

Just run the agents - they'll find your structure:

```bash
npm run workflow:quality
```

### Option 2: Custom Paths (Advanced)

Configure specific paths if needed:

```javascript
const auditor = new AuditorAgent({
    handlersPath: 'my-custom/handlers',
    frontendApiPath: 'custom-api'
});
```

---

## Adding New Patterns

Want to add a pattern we don't support yet?

1. **Open an issue:** Tell us about your architecture
2. **Submit a PR:** Add your pattern to the fallback paths
3. **Configure manually:** Use constructor options (see above)

Agents are designed to be extended!

---

## Pattern Detection Order

Agents try patterns in this order:

1. **Deeply nested** - `src/backend/src/handlers`
2. **Moderately nested** - `backend/src/handlers`, `src/handlers`
3. **Flat** - `handlers`, `controllers`, `routes`
4. **Framework-specific** - `app/` (Next.js), `views/` (Django)

**First match wins** - stops searching once found.

---

## Examples by Framework

### Express.js Project
```
my-project/
├── src/
│   ├── routes/          ✓ Detected as "routes" pattern
│   └── controllers/     ✓ Detected as "controllers" pattern
└── package.json
```

### Next.js Project
```
my-project/
├── app/                 ✓ Detected for UI components
├── pages/               ✓ Detected for pages
└── components/          ✓ Detected for components
```

### Lambda/Serverless Project
```
my-project/
├── handlers/            ✓ Detected as "handlers" pattern
├── lib/
└── serverless.yml
```

### GraphQL API
```
my-project/
├── src/
│   ├── resolvers/       ✓ Detected as "resolvers" pattern
│   └── schema/
└── package.json
```

### Django Project
```
my-project/
├── myapp/
│   ├── views/           ✓ Detected as "views" pattern
│   └── models/
└── manage.py
```

---

## Need Help?

**Pattern not supported?**
- Check `.equilateral/workflow-history.json` for what was searched
- Look at agent logs to see which paths were tried
- Open an issue with your project structure

**Want to extend?**
- See CONTRIBUTING.md
- All pattern lists are easy to modify
- PRs welcome!

---

**Last Updated:** 2025-11-07
**Supports:** Serverless, MVC, GraphQL, Python, Microservices, Static Sites, SPAs
