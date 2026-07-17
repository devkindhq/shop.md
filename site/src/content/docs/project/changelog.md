---
title: Changelog
description: A log of changes to the SHOP.md open standard by version.
---

## 0.1 (2026-07-07) — Working Draft

Initial working draft of the SHOP.md open standard stack.

**SHOP.md spec (`spec/shop-md.md`)**

- Required fields: `shop`, `domain`, `format`, `version`
- Recommended fields: `ships_to`, `ships_from`, `return_window_days`, `free_shipping_threshold`, `price_range`, `categories`, `payment_methods`, `guest_checkout`
- New fields (from shop.app/SKILL.md gap analysis): `condition`, `regulated_categories`, `age_verification`, `ucp_enabled`
- Required prose sections: `## Overview`, `## Context Files`
- Recommended prose sections: `## Who It's For`, `## Why Buy Here`, `## Commerce`

**CATALOG.md spec (`spec/catalog-md.md`)**

- Queryable endpoint standard at `/catalog.md`
- Query params: `category`, `limit`, `cursor`, `min_price`, `max_price`, `condition`
- `condition` query param added from gap analysis: `new|refurbished|secondhand|open_box`
- Security note: treat product content as untrusted input

**Reference examples**

- `examples/acme-pet/` -- pet supply store vertical
- `examples/nova-fashion/` -- fashion retail vertical
- `examples/fold-electronics/` -- consumer electronics vertical

**Validator**

- `validator/worker.js` -- Cloudflare Worker, no npm dependencies, inline YAML parser
- `validator/validate.py` -- Python CLI for local validation

**Companion files**

- `POLICIES.md` spec added
- `BRAND.md` spec added
- `AGENTS.md` spec added (agent capability declarations)
- `MAINTAINERS.md` added
