# Alternate Classes 5.5e

A FoundryVTT module providing enhanced D&D 5e alternate class implementations intended for use with the D&D 5.5e ruleset with automated workflows using the chris-premades (CPR) macro framework.

## Overview

This module adds comprehensive D&D 5e alternate class and subclass options with full automation support. Features are implemented using TypeScript and integrated with the midi-qol/chris-premades ecosystem to deliver seamless, automated gameplay mechanics.

**Inspiration:** This project automates the excellent alternate class designs created by [Laserllama](https://www.patreon.com/cw/laserllama), bringing their creative work to FoundryVTT with full midi-qol/CPR integration.

### Supported Classes & Automation Status

| Class         | Automation Status |
| :------------ | :---------------: |
| **Barbarian** |  🔄 Implemented   |
| **Bard**      |    ❌ Upcoming    |
| **Cleric**    |    ❌ Upcoming    |
| **Druid**     |    ❌ Upcoming    |
| **Fighter**   |  🔄 Implemented   |
| **Monk**      |  🔄 Implemented   |
| **Paladin**   |  🔄 Implemented   |
| **Ranger**    |  🔄 Implemented   |
| **Rogue**     |  🛠️ In Progress  |
| **Sorcerer**  |    ❌ Upcoming    |
| **Warlock**   |    ❌ Upcoming    |
| **Wizard**    |    ❌ Upcoming    |

## Installation

1. In FoundryVTT, go to **Add-on Modules** → **Install Module**
2. Paste the module manifest URL:
   ```
   https://github.com/Ramleton/alternate-classes-5.5e/releases/download/latest/module.json
   ```
3. Click **Install** and activate in your world

## Requirements

- **Foundry VTT** — v13.351
- **D&D 5e System** — v5.3.3 or later
- **MidiQOL** — v13.0.63 or later (required for automation)
- **Aura Effects** — v1.5.2 or later (required for automation)
- **Automated Conditions 5e** — v13.5330.1.4 (required for automation)
- **Cauldron of Plentiful Resources** — v1.5.40 or later (required for automation)
- **Dungeons & Dragons Player's Handbook** — v2.1.0 or later (required for spells)
- **Times Up** — v13.1.9 or later (required for automation)
- **Active Token Effects** — v1.1.1 or later (required for automation)

## Technology Stack

- **Language** — TypeScript with strict mode enabled
- **Build Tool** — Vite 5.x for optimized bundling
- **Package Manager** — pnpm with lockfile for reproducible builds
- **Linting** — ESLint with custom async safety rules
- **Type Definitions** — Ambient module declarations for FoundryVTT and third-party modules

## Project Structure

```
src/
├── scripts/          # CPR macro implementations
│   ├── automation/   # Generic helper utils for automation
│   ├── classes/      # Class and Subclass feature macros
│   ├── exploits/     # Devious, Martial, and Savage Exploit macros
│   └── martialArts/  # Helper utils for Martial Arts macro automation
├── styles/           # CSS files, primarily for styling prompts used in macros
├── templates/        # Handlebar files, templates for generic prompts in macros
├── types/            # TypeScript type definitions
└── index.ts          # Entry point
packs/                # FoundryVTT compendiums (JSON)
lang/                 # Localization files
assets/               # Icons, artwork, HTML, and CSS
module.json           # Module initialization and hooks
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

## Changelog

### Version 1.5.0 (June 2026)

- Initial tracking and implementation setup for alternate classes.

## Contributing

This is a solo project. For issues or suggestions, open a GitHub issue or submit a PR.

## License

See LICENSE file in repository.

## Credits

This module is heavily inspired by the exceptional work of **Laserllama**. Their original alternate class designs, balance philosophy, and creative implementations provided the foundation for this FoundryVTT automation project.

- [Laserllama on Patreon](https://www.patreon.com/cw/laserllama) — Original alternate class content and design
- chris-premades framework and midi-qol for automation infrastructure
- dnd5e system developers for activity system design
- FoundryVTT community for module patterns and best practices

---

**Current Module Version:** 1.5.0  
**Latest Release Date:** June 2026
