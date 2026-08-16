---
title: Validation
description: Validate a shop.md file against the open standard spec using the hosted API or the local CLI tool.
---

The SHOP.md validator checks a file against the v0.1 spec and returns a structured result with errors, warnings, and a completeness score.

## Hosted API

The validator runs as a public Cloudflare Worker at `https://validator.shopmd.org`.

**Validate a live URL:**

```bash
curl "https://validator.shopmd.org/?url=https%3A%2F%2Fyourdomain.com%2Fshop.md"
```

**Validate a local file:**

```bash
curl -X POST https://validator.shopmd.org/ \
  --data-binary @shop.md \
  -H "Content-Type: text/markdown"
```

## Response format

```json
{
  "valid": true,
  "score": 80,
  "errors": [],
  "warnings": [
    {
      "field": "condition",
      "message": "Recommended field \"condition\" is missing. Adding it improves agent matching.",
      "severity": "warning"
    }
  ],
  "parsed": {
    "frontmatter": { "shop": "Acme Pet Supply", "domain": "acmepet.com", "..." : "..." },
    "sections": ["Overview", "Who It's For", "Why Buy Here", "Commerce", "Context Files"]
  }
}
```

### Score

The score (0-100) measures completeness of recommended fields and prose:

| Component | Points |
|---|---|
| 10 recommended frontmatter fields, 5 pts each | 50 |
| 3 recommended prose sections, 10 pts each | 30 |
| Overview section ≥ 50 characters | 10 |
| Context Files section has at least one entry | 10 |

A score below 50 means AI agents will have gaps in store context. A score of 80+ indicates a well-formed file.

## What it checks

**Errors** (file is invalid if any are present):

- Missing required fields: `shop`, `domain`, `format`, `version`
- `domain` includes `https://` or a trailing slash
- `format` is not exactly `"shop.md"`
- `version` does not match a semver pattern
- `ships_to` contains unrecognised ISO 3166-1 alpha-2 codes
- `price_range` is not one of: `budget`, `mid`, `premium`, `luxury`
- `condition` values outside the allowed set
- `regulated_categories` values outside the allowed set
- `free_shipping_threshold` missing `amount` or `currency`
- `## Overview` section missing or shorter than 50 characters
- `## Context Files` section missing or has no file entries

**Warnings** (file is valid but incomplete):

- Missing recommended fields: `ships_to`, `return_window_days`, `price_range`, `categories`, `payment_methods`, `guest_checkout`, `ships_from`, `condition`, `age_verification`, `ucp_enabled`
- Missing recommended sections: `## Who It's For`, `## Why Buy Here`, `## Commerce`
- Any present section shorter than 100 characters

## Local CLI validator

A Python CLI validator is available for local use without network access:

```bash
pip install pyyaml
python validator/validate.py path/to/shop.md
```

Exit code `0` = valid (warnings acceptable). Exit code `1` = invalid.

## Source

The Worker source is at [`validator/worker.js`](https://github.com/devkindhq/shop.md/blob/main/validator/worker.js) in the repository. It has no npm dependencies -- the YAML parser is implemented inline and runs natively in the Cloudflare Workers runtime.

Authors: Kazim Ali and Saad Bhutto at [Devkind](https://devkind.com.au).
