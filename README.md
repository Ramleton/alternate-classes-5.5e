# Alternate Classes 5.5e

A FoundryVTT module providing enhanced D&D 5e alternate class implementations intended for use with the D&D 5.5e ruleset with automated workflows using the chris-premades (CPR) macro framework.

## Overview

This module adds comprehensive D&D 5e alternate subclass options with full automation support. Features are implemented using TypeScript and integrated with the midi-qol/chris-premades ecosystem to deliver seamless, automated gameplay mechanics.

**Inspiration:** This project automates the excellent alternate class designs created by [Laserllama](https://www.patreon.com/cw/laserllama), bringing their creative work to FoundryVTT with full midi-qol/CPR integration.

### Key Features

- **Custom Subclass Implementations** — Alternative class options for core D&D 5e classes (Barbarian, Bard, Cleric, Druid, Fighter, Monk, Paladin, Ranger, Rogue, Sorcerer, Warlock, Wizard)
  - Note: Currently, only Barbarian, Fighter, Monk, Paladin, Ranger, and Rogue are implemented.
- **Automated Workflows** — CPR macro integration enabling automated ability checks, damage rolls, and special mechanics
- **Type-Safe Codebase** — Built entirely in TypeScript with strict type checking and full ambient declarations for FoundryVTT APIs
- **ESLint Async Safety** — Enforces async/await best practices to prevent workflow race conditions

## Installation

### Via Manifest URL

1. In FoundryVTT, go to **Add-on Modules** → **Install Module**
2. Paste the module manifest URL:
   ```
   https://github.com/Ramleton/alternate-classes-5.5e/releases/download/latest/module.json
   ```
3. Click **Install** and activate in your world

### Manual Installation

Clone this repository and symlink it to your FoundryVTT modules directory:

```bash
git clone https://github.com/Ramleton/alternate-classes-5.5e.git
ln -s /path/to/alternate-classes-5.5e /path/to/foundry/data/modules/ac55e
```

## Requirements

- **Foundry VTT** — v12.0 or later
- **D&D 5e System** — v4.0 or later
- **midi-qol** — v11.x or later (required for automation)
- **chris-premades** — v1.x or later (required for macro framework)

## Technology Stack

- **Language** — TypeScript with strict mode enabled
- **Build Tool** — Vite 5.x for optimized bundling
- **Package Manager** — npm with lockfile for reproducible builds
- **Linting** — ESLint with custom async safety rules
- **Type Definitions** — Ambient module declarations for FoundryVTT and third-party modules

### Build Scripts

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Watch mode for development
npm run dev

# Lint TypeScript
npm run lint
```

## Project Structure

```
src/
├── macros/           # CPR macro implementations
│   ├── features/     # Subclass feature macros
│   └── utils/        # Shared macro utilities
├── types/            # TypeScript type definitions
├── module.ts         # Module initialization and hooks
└── index.ts          # Entry point

packs/                # FoundryVTT compendiums (JSON)
lang/                 # Localization files
assets/               # Icons and artwork
```

## Featured Implementations

### Avatar of Dread (Paladin Subclass)

Implements a custom Paladin subclass with automated effects including:

- **Dread Aura** — Automated damage and save mechanics
- **Necrotic Synergy** — Divine Smite integration with healing (half necrotic damage dealt heals the caster)
- **Avatar Form** — Transformative ability with AC and damage bonuses

Example: Avatar of Dread uses macro framework to automatically apply conditional bonuses and trigger dependent effects in a single workflow:

```typescript
const necroticHeal: MidiMacroFunction = async ({
  trigger: { entity, token },
  workflow,
  ditem,
}) => {
  // Automatically heals avatar for half necrotic damage on Divine Smite
  // Prevents macro stacking and double-damage application
};
```

### Alternate Ranger Features

Upcoming: CPR macro automation for extended Ranger options with improved bonus action and reaction handling.

## Macro Architecture

Macros follow the chris-premades pattern with clear separation of concerns:

- **Hook Functions** — `early`, `during`, `after` workflow phases
- **Workflow Utilities** — Damage type filtering, activity data management
- **Item Registration** — Automatic macro binding to subclass features
- **Error Handling** — Graceful fallbacks for missing prerequisites

## Development

### Adding a New Subclass

1. Create feature macros in `src/macros/features/[class]/`
2. Add type definitions to `src/types/`
3. Register in module initialization (item lookup + macro binding)
4. Add compendium entry to `packs/`
5. Test with midi-qol and CPR enabled

### Type Safety

All macros are fully typed using extended dnd5e item/actor types:

```typescript
const healActivityData = (await getActivityData(feat, "heal")) as HealActivity;
```

TypeScript ensures activity properties match dnd5e 4.x schema.

## Testing

Test workflow automation with:

1. Create a character with the subclass
2. Use abilities in combat and verify midi-qol hooks fire correctly
3. Check macro logs in browser console for async race conditions
4. Validate damage calculations and effect application order

## Performance Considerations

- Vite builds output minified, tree-shaken distributions
- Lazy-load macro initialization on demand
- Use `tsc-alias` for path rewriting (avoids runtime path resolution)
- ESLint async rules prevent unintended blocking calls

## Known Limitations

- Requires midi-qol v11+ for workflow automation
- Some features depend on d&d5e active effects system
- Item activity types must match d&d5e 4.x schemas

## Contributing

This is a solo project. For issues or suggestions, open a GitHub issue or submit a PR.

## License

See LICENSE file in repository.

## Acknowledgments

This module is heavily inspired by the exceptional work of **Laserllama**. Their original alternate class designs, balance philosophy, and creative implementations provided the foundation for this FoundryVTT automation project.

- [Laserllama on Patreon](https://www.patreon.com/cw/laserllama) — Original alternate class content and design
- chris-premades framework and midi-qol for automation infrastructure
- dnd5e system developers for activity system design
- FoundryVTT community for module patterns and best practices

---

**Current Version:** 1.5.0  
**Last Updated:** June 2026
