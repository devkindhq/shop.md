<!--
  SHOP.md UCP Context Extension — working draft.
  Not merged into any upstream. Kazim Ali / Saad Bhutto (Devkind) review required.
  License: MIT (matches devkindhq/shop.md repo).
-->

# UCP Context Extension (`org.shopmd.shopping.context`)

**Extension home:** [shopmd.org](https://shopmd.org) · [SHOP.md spec](https://shopmd.org/spec/shop-md) · [Repository](https://github.com/devkindhq/shop.md/tree/main/extensions/ucp)
**Capability name:** `org.shopmd.shopping.context`
**Schema:** `https://shopmd.org/ucp/schemas/shopping/context.json`
**Spec:** `https://shopmd.org/ucp/spec/context`
**Status:** Draft — 0.1
**Extension version:** `2026-08-16`

---

## What this is

An optional, third-party capability that a UCP Business advertises in its
profile to point agents at its **SHOP.md context layer** — the store brief
that answers *who is this store and is it right for this shopper* before any
capability is exercised.

UCP profiles answer **what a store can do** — search, cart, checkout, payment
rails. They deliberately say nothing about **what a store is**: where it
ships, its return window, its price band, the categories and regulated
inventory it carries, trust signals, whether guest checkout exists. An agent
qualifying stores on behalf of a shopper needs those answers *before* it
spends a search or a checkout session finding out the hard way.

SHOP.md ([spec](https://shopmd.org/spec/shop-md)) is an open, MIT-licensed
standard for exactly that brief: a structured markdown file at
`{domain}/shop.md` with YAML frontmatter (machine-filterable facts:
`ships_to`, `return_window_days`, `price_range`, `regulated_categories`,
`guest_checkout`, `currencies`, …) plus short prose sections, and companion
files (`catalog.md`, `policies.md`, `brand.md`) for depth.

This capability wires the two layers together with **one line of profile**:

```json
"org.shopmd.shopping.context": [
  {
    "version": "2026-08-16",
    "config": { "enabled": true }
  }
]
```

That's the whole ask on the merchant side. The well-known URL convention does
the rest.

## Why a root capability, not an `extends` extension

- The capability **adds no fields to any transactional payload** — there is
  nothing to compose onto checkout/order schemas via `allOf`.
- It is **purely informational for discovery**: a Platform that recognizes the
  namespace fetches `{domain}/shop.md` and qualifies the store; a Platform
  that doesn't recognize it ignores an unknown capability, which is precisely
  how UCP negotiation treats unrecognized names.
- Qualification happens **before** search/cart/checkout — it doesn't extend
  any of them; it precedes them.

If the community prefers it anchored to an existing capability,
`extends: ["dev.ucp.shopping.catalog_search"]` is the natural parent
(qualification precedes search). Flagged as an open question in the proposal
issue.

## Profile advertisement

### Business profile (`.well-known/ucp`)

```json
{
  "ucp": {
    "version": "2026-04-08",
    "capabilities": {
      "dev.ucp.shopping.catalog_search": [
        {
          "version": "2026-04-08",
          "spec": "https://ucp.dev/2026-04-08/specification/catalog",
          "schema": "https://ucp.dev/2026-04-08/schemas/shopping/catalog_search.json"
        }
      ],
      "dev.ucp.shopping.checkout": [
        {
          "version": "2026-04-08",
          "spec": "https://ucp.dev/2026-04-08/specification/checkout",
          "schema": "https://ucp.dev/2026-04-08/schemas/shopping/checkout.json"
        }
      ],
      "org.shopmd.shopping.context": [
        {
          "version": "2026-08-16",
          "spec": "https://shopmd.org/ucp/spec/context",
          "schema": "https://shopmd.org/ucp/schemas/shopping/context.json",
          "config": { "enabled": true }
        }
      ]
    }
  }
}
```

Notes:

- `schema` is hosted at `shopmd.org` — the host reverses to `org.shopmd`,
  a label-aligned prefix of the capability name, satisfying UCP authority
  binding. `spec` is documentation and may live anywhere `https`.
- `config.enabled` is the only configuration field. It exists so a merchant
  can keep the capability entry present but soft-off (e.g. during a store
  migration) without removing the entry and losing negotiated version state.
  When `false` or absent, consumers treat the capability as not active.
- Per UCP third-party extension rules, `version` is the extension author's
  own version (date-formatted), advancing independently of `ucp.version`,
  and negotiated by exact-version intersection like every capability.

## Resolving the context

A consumer that recognizes `org.shopmd.shopping.context` resolves the
store brief at the **well-known path on the same origin as the profile**:

```text
GET {profile_origin}/shop.md
Accept: text/markdown
```

No URL is carried in `config` — the document location is a convention of the
SHOP.md standard (`{domain}/shop.md`), so the pointer cannot be pointed at
another origin. Consumers MUST NOT fetch shop.md cross-origin based on any
other field in the profile.

The fetched document is **inert context**: `text/markdown`, rendered/ingested
as a document, never executed. It is not part of the machine trust path — it
carries merchant-authored claims (return window, ships-to) that a consumer
may present to shoppers but MUST NOT treat as verified commitments. Where a
claim matters transactionally (e.g. actual return terms at checkout), the
UCP capability in play remains authoritative.

### Example SHOP.md response (truncated)

```markdown
---
shop: "Acme Pet Supply"
domain: acmepetsupply.com
format: shop.md
version: "1.0"
language: en
currencies: [AUD, USD]
ships_to: [AU, NZ, US, GB]
ships_from: AU
return_window_days: 30
free_returns: true
price_range: mid
categories: ["pet food", "dog treats"]
payment_methods: [visa, mastercard, paypal, afterpay]
guest_checkout: true
ucp_enabled: true
agent_capabilities: [browse, cart, checkout]
established: 2018
---

## Overview
Acme Pet Supply stocks grain-free and raw-diet pet food for dogs and cats …

## Who It's For
…

## Why Buy Here
In operation since 2018. Rated 4.8 from 2,400 reviews on Trustpilot …

## Commerce
Ships to AU, NZ, US, GB. Returns within 30 days at no cost. …

## Context Files
- /catalog.md: Full product catalogue — 340 SKUs …
- /policies.md: Complete return, shipping, and privacy policies.
```

Full spec: [shopmd.org/spec/shop-md](https://shopmd.org/spec/shop-md).
Serving requirements (`Content-Type: text/markdown; charset=utf-8`,
`Content-Usage: train-ai=n; search=y`, optional `x-markdown-tokens`) are
defined by the SHOP.md standard.

## The other direction (shop.md → UCP)

SHOP.md's frontmatter already carries `ucp_enabled: true` and
`agent_capabilities: [browse, cart, checkout]`. A store advertising both
layers gives the agent a complete picture in one visit:

- UCP profile → `org.shopmd.shopping.context` → qualification brief.
- shop.md → `ucp_enabled: true` → "transactional capability exists; go read
  `/.well-known/ucp`."

Implementing either layer alone remains valid; neither standard requires the
other.

## Capability JSON Schema

Published at `https://shopmd.org/ucp/schemas/shopping/context.json`
([source in this repo](./schema.json)):

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://shopmd.org/ucp/schemas/shopping/context.json",
  "name": "org.shopmd.shopping.context",
  "version": "2026-08-16",
  "title": "SHOP.md Store Context",
  "description": "Advertises that this Business publishes a SHOP.md store brief at {origin}/shop.md — machine-filterable qualification facts (ships_to, return_window_days, price_range, regulated_categories, guest_checkout) plus prose context, per the SHOP.md open standard (shopmd.org). Informational only: adds no fields to transactional payloads, and document contents are merchant-authored claims, not verified commitments.",
  "requires": {
    "protocol": { "min": "2026-01-23" }
  },
  "$defs": {
    "capability_config": {
      "type": "object",
      "title": "Context Capability Config",
      "description": "Configuration for the org.shopmd.shopping.context capability as advertised in a Business profile.",
      "properties": {
        "enabled": {
          "type": "boolean",
          "default": true,
          "description": "Soft switch. When false, consumers MUST treat the capability as not active (do not fetch /shop.md on this basis)."
        }
      }
    }
  }
}
```

`requires.protocol.min` reflects the profile/negotiation features the
convention depends on (capability registry with reverse-domain keys,
versioned by exact intersection). No `requires.capabilities` — this
capability depends on no other capability.

## Design notes

- **No `links` array, no config URLs.** The whole point is one well-known
  convention; a per-merchant URL field re-opens the exact
  where-is-the-brief discovery problem SHOP.md exists to close, and invites
  cross-origin pointers.
- **Not trust, just provenance + convenience.** UCP authority binding on our
  `schema` URL proves the standard is published by the shopmd.org owner. The
  brief's *contents* are the merchant's claims. Consumers keep their own
  trust policies.
- **Versioning.** Extension version advances on its own date cadence
  (author-controlled, per UCP third-party extension rules). The SHOP.md file
  format itself versions independently via its frontmatter `version` field.

## Out of scope

- Any change to UCP core schemas or flows (this is vendor-namespaced, no
  core change — same scope discipline as com.mercadopago.shopping.digital_delivery).
- Catalog data, pricing, or inventory (that's `catalog.md` /
  `dev.ucp.shopping.catalog_*` territory).
- Verification/attestation of merchant claims in SHOP.md.

## References

- SHOP.md spec — https://shopmd.org/spec/shop-md (source:
  github.com/devkindhq/shop.md)
- UCP overview: capabilities, extensions, namespace governance —
  https://ucp.dev/specification/overview
- Precedent third-party extension (shape reference):
  `com.mercadopago.shopping.digital_delivery`, UCP PR #719
