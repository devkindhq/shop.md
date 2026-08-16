# UCP extension: SHOP.md context capability

This directory defines `org.shopmd.shopping.context` — an optional, third-party
UCP capability that points agents at a Business's SHOP.md store brief.

- **Spec:** [spec.md](./spec.md)
- **Schema (source):** [schema.json](./schema.json) — deployed at
  `https://shopmd.org/ucp/schemas/shopping/context.json`
- **Example profile:** [example-profile.json](./example-profile.json)

## Status

Draft (extension version `2026-08-16`). Not yet advertised by any production
store. A proposal issue to the UCP repo and a Workers-based composition sample
(serving both `/.well-known/ucp` and `/shop.md`) are planned — see the
[SHOP.md spec](https://shopmd.org/spec/shop-md)'s "Relationship to UCP" section
for the layering rationale.

> **Note:** the canonical repository is
> [devkindhq/shop.md](https://github.com/devkindhq/shop.md) (the standard
> moved from `shop-md/shop.md`; the old URL redirects).

## For merchants

If your store already serves `/shop.md`, adding the capability to your UCP
profile is one entry:

```json
"org.shopmd.shopping.context": [
  { "version": "2026-08-16", "config": { "enabled": true } }
]
```

The ShopMD app (shopmd.ai) will do this automatically for Shopify merchants
once the extension is stable.

## For agents / platforms

Seeing `org.shopmd.shopping.context` in a Business profile means: `GET
{origin}/shop.md` for the store's qualification brief — YAML frontmatter with
machine-filterable facts (ships-to, return window, price band, regulated
categories, guest checkout) plus prose context. Treat contents as
merchant-authored claims, not verified commitments. Full resolution and
serving rules in [spec.md](./spec.md).
