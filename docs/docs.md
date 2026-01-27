 # Project Memory Structure

This directory contains project memory files for Cursor AI. These files help maintain context about the project across sessions.

## 📁 Recommended File Structure

```
.cursor/
├── README.md              # This file - explains the structure
├── project-overview.md    # General project info, features, user-facing docs
├── architecture.md        # Technical architecture, code structure, tech stack
├── development.md         # Development notes, workflows, debugging tips
└── [feature-name].md      # Feature-specific documentation (optional)
```

## 📝 File Purposes

### `project-overview.md`
**Purpose**: High-level project documentation, user-facing features, setup instructions

**Contains**:
- Project description and purpose
- What users can do
- Features list
- Setup and installation
- Usage guide
- Links and resources

**When to update**: When adding new features, changing user-facing functionality, or updating setup instructions

---

### `architecture.md` ✅ (Created)
**Purpose**: Technical architecture, code structure, and system design

**Contains**:
- Architecture overview
- Code structure and organization
- Technology stack details
- Key architectural decisions
- Data flow diagrams
- API endpoints documentation
- Design system
- Performance considerations
- Security considerations

**When to update**: When changing architecture, adding new tech, or modifying code structure

---

### `development.md` (Recommended)
**Purpose**: Development workflows, debugging, and development-specific notes

**Contains**:
- Development setup
- Common tasks and workflows
- Debugging tips and tricks
- Known issues and workarounds
- Git workflow
- Testing strategies
- Deployment process
- Development environment setup

**When to update**: When adding new dev tools, changing workflows, or documenting new debugging techniques

---

## 🎯 Naming Conventions

### General Rules
- Use **kebab-case** for file names: `project-overview.md`
- Use **descriptive names** that clearly indicate content
- Keep names **short but clear**: `architecture.md` not `technical-architecture-and-code-structure.md`

### Common Patterns
- `*-overview.md` - High-level overview documents
- `*-architecture.md` or `architecture.md` - Technical architecture
- `*-development.md` or `development.md` - Development notes
- `*-api.md` - API documentation
- `*-features.md` - Feature documentation
- `*-troubleshooting.md` - Common issues and solutions

## 💡 Best Practices

1. **Keep files focused**: Each file should have a clear, single purpose
2. **Update regularly**: Keep documentation in sync with code changes
3. **Use clear headings**: Make it easy for AI to understand structure
4. **Include examples**: Code examples and snippets help maintain context
5. **Link between files**: Reference related documentation when helpful
6. **Version important decisions**: Note when and why architectural decisions were made

## 🔄 Migration from Single File

If you're migrating from a single `.md` file:

1. **Extract user-facing content** → `project-overview.md`
2. **Extract technical content** → `architecture.md` (already done)
3. **Extract dev notes** → `development.md`
4. **Keep the original** as backup or delete if fully migrated

## 📚 Current Files

- ✅ `architecture.md` - Technical architecture and code structure
- ⚠️ `.md` - (To be migrated/renamed to `project-overview.md`)

## 🚀 Next Steps

1. Create `project-overview.md` with user-facing documentation
2. Create `development.md` for development-specific notes
3. Consider feature-specific files if needed (e.g., `api-endpoints.md`, `ui-components.md`)

