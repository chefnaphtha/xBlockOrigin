# Code Quality
- **Linting**: Use Biome for linting - configured in `biome.json` with tab indentation, no semicolons
- **Format**: Biome handles formatting automatically
- **IMPORTANT**: Always run these commands after making changes to catch errors early and reduce error rates:
  - `bunx tsc --noEmit` - Type check without emitting files
  - `bunx @biomejs/biome check --fix --unsafe` - Lint and fix issues
  - `bunx @biomejs/biome format --fix` - Format code

# Language Preferences
- **Use Bun over Node.js**: All code should use `bun` instead of `node`.
- **Use tab indentation** (4 spaces where tabs aren't supported)
- **No semicolons** in TypeScript
- **Lowercase comments** and only when explaining complex code
- **Keep files under 200 lines** - split large files into smaller, focused modules
- **Use latest JS/TS features** instead of legacy patterns

## ***Avoid OOP!***

Functional programming and modules are **HIGHLY** preferred over excessive OOP patterns.

The only classes allowed are pure, semantic, tasteful classes, where per-instance state is required, for example: User, Task, etc.

If you find yourself wanting to create a *Service, *Factory, etc. class, turn back and rethink your approach.

# TypeScript Guidelines
- **Prefer inline types** over separate interface declarations
- **Leverage automatic type inference** - avoid explicit return types when unnecessary
- ***NEVER use `any`!***
- ***NEVER use non-null assertions!***
- ***NEVER use 'as'!*** Instead of `as`, use a runtime schema validating library such as zod or typebox.


# /src Structure

## Naming Conventions
- PascalCase for all directories and class-like files
- camelCase for utility files, functions, and variables
- Consistent casing within each project domain

## Directory Organization
- Feature-based organization with each major feature in its own directory
- index files for module exports and entry points
- Subdirectories for complex features with multiple components

## Typical Structure
- Components or Modules - Self-contained units with:
  - Main implementation file
  - Styles/assets if applicable
  - Child components/submodules in subdirectories
- Shared Code:
  - Utils/ or Utilities/ - Helper functions
  - Services/ - Business logic and external integrations
  - Types/ or Interfaces/ - Shared type definitions

## File Patterns
- Keep related code together (component + styles + types)
- Separate concerns into distinct files
- Avoid barrel exports. Imports should be done from the files that contain the code.
- Consistent file extensions for similar purposes

## Asset Management
- Colocate assets with consuming code when possible
- Shared assets at appropriate scope level
