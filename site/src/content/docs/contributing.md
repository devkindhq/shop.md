---
title: Contributing
description: How to contribute to the SHOP.md open standard.
---

SHOP.md is a draft spec and active contributions are welcome. The goal is a standard useful to any commerce platform, not tied to any single tool or implementation.

## How to contribute

- **File an issue** for corrections, missing fields, ambiguous language, or use cases the spec does not cover: [github.com/devkindhq/shop.md/issues](https://github.com/devkindhq/shop.md/issues)
- **Open a PR** for new example implementations (one store per directory under `examples/`)
- **Start a discussion** for larger changes -- new sections, breaking field changes -- before writing code or prose

Maintainers review contributions within 7 days. Breaking changes to required fields require a major version bump and a discussion issue first. New optional fields can be proposed via PR with a real-world use case.

## What makes a good example

Examples live under `examples/{store-slug}/` and must include a complete `shop.md`. Examples that also include `catalog.md`, `policies.md`, and `brand.md` are preferred.

Good examples:
- Represent a real store vertical (not a generic placeholder)
- Use only realistic data -- real shipping regions, real price ranges, concrete trust signals
- Demonstrate fields that a typical store of that type would implement

## Versioning

SHOP.md uses semantic versioning in the `version` frontmatter field.

- **Major version:** breaking changes to required fields or prose section structure
- **Minor version:** new optional fields or sections added
- **Patch:** clarifications to existing definitions

Files written to an older minor version remain valid under a newer minor version.

Authors: Kazim Ali and Saad Bhutto at [Devkind](https://devkind.com.au).
