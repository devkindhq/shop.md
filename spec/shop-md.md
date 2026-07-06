# SHOP.md Open Standard
**Version:** 0.1
**Status:** Draft Proposal
**Date:** 2026-07-07
**License:** MIT
**Home:** shopmd.org
**Repository:** github.com/shop-md/shop.md

**Authors:**

- Kazim Ali — Devkind
- Saad Bhutto — Devkind

---

> **This is a working draft.** Fields, section names, and behaviours described here may change before a stable release. Implementers are encouraged to track the repository and participate in shaping the spec. Feedback via GitHub Issues is the primary mechanism for contribution.

---

## What is SHOP.md?

SHOP.md is an open standard for AI-readable commerce. It is a structured markdown file that lives at the root of any commerce store and gives AI agents the context they need to qualify, evaluate, and recommend a store to a shopper -- before diving into the product catalogue.

It is not a product description. It is not a brand guide. It is the store's brief to any agent that arrives on behalf of a shopper.

Any commerce store on any platform can implement SHOP.md by placing a correctly formatted markdown file at `{domain}/shop.md`. No app required. No registration required.

---

## Philosophy

The web has protocols for what agents can do at a store. The Universal Commerce Protocol lets agents search, cart, and check out. The web does not yet have a protocol for what agents should know about a store before they do anything.

A shopper's agent arriving at an unfamiliar store has to infer: does this store ship to me? what is their return window? are they trustworthy? what do they actually specialise in? Without a structured answer, the agent either reads the whole site (slow, inconsistent) or guesses (wrong).

SHOP.md closes that gap with a single file at a predictable URL.

The format follows the same instinct as `llms.txt` (discovery index), `AGENTS.md` (coding agent brief), and `brand.md` (brand identity context, see github.com/caiopizzol/brand.md): when you want to brief an AI, you hand it a markdown document. SHOP.md is that document for commerce.

**It is the summary layer, not the full layer.** SHOP.md qualifies the store and points to deeper files. It never duplicates what POLICIES.md, CATALOG.md, or BRAND.md contain. An agent that needs the full return policy reads POLICIES.md. An agent that needs products reads CATALOG.md. SHOP.md tells the agent what exists and where to find it.

**Structured for AI. Readable for humans.** The YAML frontmatter answers filter questions in one parse. The prose sections carry the intent and nuance that make the difference between a generic match and the right recommendation.

---

## Relationship to UCP

The Universal Commerce Protocol (UCP) is the transaction layer for AI commerce -- it lets agents search, cart, and check out across UCP-enabled stores. SHOP.md is the context layer -- it tells an agent what a store is and whether it is right for a given shopper, before any transaction begins.

They compose naturally. An agent reads SHOP.md to qualify the store, then uses UCP to transact. SHOP.md does not duplicate UCP capabilities. It fills the gap UCP deliberately leaves: store identity, logistics policy, trust signals, and specialisation -- the brief that makes a recommendation possible.

Implementing both is not required. SHOP.md is useful without UCP. UCP operates without SHOP.md. A store that has both gives agents a complete picture: context and capability in one visit.

---

## File Format

### Location

Served at `{domain}/shop.md`. Place `shop.md` at the web root so it is publicly accessible at `https://yourdomain.com/shop.md`. Platform-specific generation is covered in the Generating SHOP.md section.

The canonical path is lowercase. Implementations should serve the file case-insensitively so that both `/shop.md` and `/SHOP.md` resolve to the same response.

### Structure

A SHOP.md file has two parts: a YAML frontmatter block and a prose body with four required sections and one discovery section.

---

## YAML Frontmatter

The frontmatter contains machine-verifiable facts. Every field is optional except `shop`, `domain`, `format`, and `version`. An agent can parse the frontmatter without reading the prose.

```yaml
---
shop: "Store Name"
domain: storename.com
format: shop.md
version: "1.0"

# Commerce
language: en                         # BCP 47 (RFC 5646) language tag
currencies: [AUD, USD]               # ISO 4217, first is default
ships_to: [AU, NZ, US, GB]          # ISO 3166-1 alpha-2 array, or "*" for worldwide
ships_from: AU                       # ISO 3166-1 alpha-2
return_window_days: 30               # integer, or null if no returns
free_returns: true                   # boolean
free_shipping_threshold:
  amount: 75
  currency: AUD                      # null if no free shipping threshold

# Store profile
price_range: mid                     # budget | mid | premium | luxury
categories: ["pet food", "dog treats", "cat accessories"]
condition: [new]                     # new | refurbished | secondhand | open_box
regulated_categories: []             # alcohol | tobacco | cannabis | medications | weapons | adult_content
age_verification: false              # boolean, true if store enforces age gates at checkout
payment_methods: [visa, mastercard, paypal, afterpay, shop_pay]
guest_checkout: true                 # boolean, true if purchase is possible without an account
ucp_enabled: false                   # boolean, true if store supports UCP agentic checkout
agent_capabilities: [browse, cart]   # what agents are permitted to do on behalf of shoppers
b2b: false                           # boolean, true if wholesale/B2B available
established: 2018                    # year as integer
---
```

### Required fields

| Field | Type | Description |
|---|---|---|
| `shop` | string | Store display name |
| `domain` | string | Canonical domain (no protocol) |
| `format` | string | Always `shop.md` |
| `version` | string | Spec version this file conforms to |

### Recommended fields

| Field | Type | Description |
|---|---|---|
| `language` | BCP 47 (RFC 5646) | Primary language. Use tags like `en`, `en-AU`, `zh-Hant`. |
| `currencies` | array | Accepted currencies. First is default. |
| `ships_to` | array or "worldwide" | Countries shipped to. Country-level only in v0.1. Sub-national region and postal-code granularity is a known limitation planned for a future version. |
| `ships_from` | ISO 3166-1 | Country orders are dispatched from |
| `return_window_days` | integer or null | Days buyer has to return. Null if no returns accepted. |
| `free_returns` | boolean | Whether return shipping is covered by the store |
| `free_shipping_threshold` | object | `amount` and `currency`. Null if no free shipping threshold. |
| `price_range` | enum | `budget`, `mid`, `premium`, or `luxury`. Merchant self-selects. No enforced thresholds in v1. |
| `categories` | array | Product category strings. Plain English is valid. For precision, use Google Product Taxonomy names (open standard, Apache 2.0 tooling). |
| `condition` | array | Inventory conditions stocked. Enum: `new`, `refurbished`, `secondhand`, `open_box`. Omit if the store stocks only new products. |
| `regulated_categories` | array | Categories of regulated or age-restricted inventory. Enum: `alcohol`, `tobacco`, `cannabis`, `medications`, `weapons`, `adult_content`. Omit or use empty array if none apply. Agents use this to pre-qualify before browsing the catalogue. |
| `age_verification` | boolean | Whether the store enforces age gates at checkout. Paired with `regulated_categories`. |
| `payment_methods` | array | Accepted payment methods. No open standard registry exists for payment identifiers. SHOP.md defines a controlled vocabulary: `visa`, `mastercard`, `amex`, `discover`, `unionpay`, `jcb`, `paypal`, `apple_pay`, `google_pay`, `shop_pay`, `afterpay`, `klarna`, `affirm`, `zip`. Use informal tickers for crypto (e.g. `btc`, `eth`) with documentation. |
| `guest_checkout` | boolean | Whether purchase is possible without creating an account. Critical for agentic checkout flows that cannot create accounts on behalf of buyers. |
| `ucp_enabled` | boolean | Whether the store supports UCP agentic checkout. Agents use this to determine whether a delegated checkout flow is available before attempting a transaction. |
| `agent_capabilities` | array | Actions agents are permitted to perform on behalf of shoppers. Enum: `browse` (search and filter catalog), `cart` (add items to cart), `checkout` (initiate and complete purchase), `account` (access order history and saved addresses), `wishlist` (save items for later), `recommendations` (request personalised product suggestions). Full instructions live in `/AGENTS.md`. |
| `b2b` | boolean | Whether wholesale or B2B purchasing is available |
| `established` | integer | Year the store was founded |

---

## Prose Body

Four required sections and one discovery section. Each section is one paragraph. Prose is written for an AI reader: precise, concrete, no marketing language.

### 1. Overview

What the store sells and its focus. Not a tagline. A plain description of the product range, depth, and specialisation. An agent reading this should be able to classify the store into a category without reading the catalogue.

```markdown
## Overview

Acme Pet Supply stocks grain-free and raw-diet pet food for dogs and cats, 
with a focus on brands that use single-protein sources and no artificial 
additives. The range covers dry, wet, freeze-dried, and raw formats across 
340 SKUs from 18 brands. Accessories and supplements are stocked as a 
secondary category.
```

### 2. Who It's For

The target buyer in practical terms. Not brand positioning. Useful specifics: dietary needs served, size ranges stocked, buyer profile, expertise level of the store (specialist vs. generalist).

```markdown
## Who It's For

Suited to pet owners managing dogs or cats with dietary sensitivities, 
food allergies, or owners following raw or biologically appropriate raw 
food (BARF) diets. Stock leans toward premium and specialist brands not 
available in supermarkets. Not a general pet store -- range is narrow 
and deep rather than wide.
```

### 3. Why Buy Here

Trust signals and differentiators. Years in business, review rating and volume, certifications, fulfilment capability, specialist knowledge, return record. Concrete facts only -- no adjectives without evidence.

```markdown
## Why Buy Here

In operation since 2018. Rated 4.8 from 2,400 reviews on Trustpilot. 
Climate-controlled storage and packaging for raw and freeze-dried orders. 
Free returns within 30 days. Same-day dispatch on orders placed before 
1pm AEST Monday to Friday. Vet-advisory panel reviews all new brand 
additions before listing.
```

### 4. Commerce

A prose summary of how buying works. Shipping speed, regions, cost, return process, payment options. Written for an agent that has already seen the frontmatter but wants a human-readable confirmation before recommending the store.

This section does not reproduce the full policy text. It summarises. The agent is pointed to POLICIES.md for complete terms.

```markdown
## Commerce

Ships to Australia, New Zealand, the US, and the UK. Standard Australian 
delivery 2-5 business days; express 1-2 days. Free shipping on orders 
over AUD 75. Returns accepted within 30 days of delivery at no cost to 
the buyer. Accepts Visa, Mastercard, PayPal, Afterpay, and Shop Pay. 
Full policies at /policies.md.
```

### 5. Context Files

The discovery pointer section. Lists every AI-readable file available for this store with a one-sentence description. An agent reads this section to know where to go next.

Only list files that exist. No placeholders. No dead links. Paths are domain-relative (e.g. `/catalog.md` resolves to `https://yourdomain.com/catalog.md` on the live store). Markdown link syntax is recommended for agent parsers that follow links, but plain text paths are acceptable.

```markdown
## Context Files

- `/catalog.md`: Full product catalogue -- 340 SKUs with variants, pricing, stock status, and enriched descriptions.
- `/policies.md`: Complete return, shipping, and privacy policies.
- `/brand.md`: Brand identity, voice, and personality guidelines.
- `/design.md`: Design tokens, theme, and component inventory. See github.com/google-labs-code/design.md for the open standard.
- `/llms.txt`: Full index of all AI-readable files on this store.
```

---

## Serving SHOP.md

### Response headers

All SHOP.md responses must include:

```
Content-Type: text/markdown; charset=utf-8
Content-Usage: train-ai=n, search=y
```

`Content-Type: text/markdown` is specified by RFC 7763. `Content-Usage` is defined by the IETF `aipref` working group (draft-ietf-aipref-vocab, Proposed Standard track as of July 2026). The `train-ai=n` directive signals that store context must not be used to train AI models.

For stores operating in the EU (DSM Directive 2019/790), also include:

```
tdm-reservation: 1
```

This aligns with the W3C TDMRep Community Group Final Report for text and data mining reservation.

### Token cost header (recommended)

```
x-markdown-tokens: {count}
```

Where count is `Math.ceil(content.length / 4)`. Allows agents and developers to check token cost before loading the file.

This is a SHOP.md convention, not an external standard.

### robots.txt

Stores implementing SHOP.md should ensure AI crawlers can access it:

```
User-agent: ClaudeBot
Allow: /shop.md

User-agent: GPTBot
Allow: /shop.md

User-agent: PerplexityBot
Allow: /shop.md
```

---

## Discovery

### llms.txt

SHOP.md should be listed in the store's `llms.txt` file under a `## Commerce` section:

```
## Commerce

- [shop.md](/shop.md): Store identity, logistics, and commerce context for AI agents.
```

### Agentic Resource Discovery (ARD)

ARD (v0.9 draft, announced June 2026, backed by Google, Microsoft, Hugging Face, AWS, Salesforce, and others) uses `/.well-known/ai-catalog.json` to expose machine-readable resource listings. SHOP.md should appear as a `text/markdown` entry.

The correct field names per the ARD spec (github.com/ards-project/ard-spec): `specVersion` at root level, and entries with `identifier` (URN format), `displayName`, `type` (IANA media type), and `url` or `data`. There is no `rel` field on entries.

```json
{
  "specVersion": "1.0",
  "entries": [
    {
      "identifier": "urn:air:{yourdomain}:shop-md:context",
      "displayName": "SHOP.md Store Context",
      "type": "text/markdown",
      "url": "/shop.md",
      "description": "Store identity, logistics, and commerce context for AI agents.",
      "tags": ["commerce", "store-context", "ecommerce"]
    }
  ]
}
```

Replace `{yourdomain}` with your domain in reverse-notation (e.g. `urn:air:acmepetsupply.com:shop-md:context`).

Advertise the catalog location via an HTML `<link>` tag in your storefront `<head>`:

```html
<link rel="ai-catalog" href="/.well-known/ai-catalog.json">
```

### RFC 8288 Link Header

Add a `Link` HTTP response header on the store homepage to advertise the ARD catalog location to agents that parse response headers without reading HTML:

```
Link: </.well-known/ai-catalog.json>; rel="ai-catalog"
```

This is the RFC 8288 (Web Linking) expression of the same relationship as the HTML `<link rel="ai-catalog">` tag. Use both for maximum agent compatibility.

---

## Schema.org Alignment

SHOP.md fields map to Schema.org types for stores implementing both formats. JSON-LD structured data and SHOP.md are complementary: JSON-LD operates at product and offer granularity embedded in HTML; SHOP.md operates at store-identity level as a standalone endpoint.

| SHOP.md field | Schema.org type | Schema.org property |
|---|---|---|
| `shop` | `OnlineStore` | `name` |
| `domain` | `OnlineStore` | `url` |
| `ships_to` | `OnlineStore` | `areaServed` |
| `currencies` | `OnlineStore` | `currenciesAccepted` |
| `payment_methods` | `OnlineStore` | `paymentAccepted` |
| `price_range` | `OnlineStore` | `priceRange` |
| `return_window_days` | `MerchantReturnPolicy` | `merchantReturnDays` |
| `free_returns` | `MerchantReturnPolicy` | `returnFees` (FreeReturn / ReturnShippingFees) |
| `established` | `OnlineStore` | `foundingDate` |
| `categories` | `OnlineStore` | `knowsAbout` |

---

## Relationship to Other Files

SHOP.md is the entry point. It qualifies and orients. Other files go deep.

| File | Layer | What it answers |
|---|---|---|
| `llms.txt` | Discovery index | What AI-readable files exist on this domain |
| SHOP.md | Store context | Is this store right for this shopper? |
| CATALOG.md | Product layer | What does this store sell, exactly? |
| POLICIES.md | Policy layer | What are the full terms? |
| AGENTS.md | Agent instructions | What are agents permitted to do, and how should they behave? |
| BRAND.md | Identity layer | What is this brand's voice, identity, and personality? |
| DESIGN.md | UI execution layer | How is this store's interface built? (see github.com/google-labs-code/design.md) |

An agent following the shopper's journey reads in this order: SHOP.md to qualify, CATALOG.md to browse, POLICIES.md to confirm terms before recommending purchase.

---

## Minimum Viable SHOP.md

A store can implement SHOP.md with required fields only and two prose sections. This is valid:

```markdown
---
shop: "Acme Pet Supply"
domain: acmepetsupply.com
format: shop.md
version: "1.0"
---

## Overview

Acme Pet Supply stocks grain-free and raw-diet pet food for dogs and cats.

## Context Files

- `/catalog.md`: Full product catalogue.
```

A minimum file is better than no file. Start here, expand over time.

---

## Reference Implementations

See `examples/` in the GitHub repository for complete implementations across three store verticals:

- `examples/acme-pet/shop.md` -- specialty pet food, AU-based, ships worldwide
- `examples/nova-fashion/shop.md` -- premium womenswear, size-inclusive, multi-currency
- `examples/fold-electronics/shop.md` -- refurbished consumer electronics, B2C and B2B

---

## Generating SHOP.md

Any developer can write SHOP.md by hand using this spec.

For Shopify merchants, the ShopMD application (shopmd.ai) generates and maintains SHOP.md automatically. It populates frontmatter from store settings and the Shopify API, writes prose sections from store data and merchant-provided context, serves the file at `{domain}/shop.md` via Cloudflare Workers, and keeps it current via Shopify webhooks when store data changes.

ShopMD is the reference implementation for Shopify. The standard is platform-agnostic.

---

## Versioning

SHOP.md uses semantic versioning in the `version` frontmatter field.

- Major version: breaking changes to required fields or prose section structure
- Minor version: new optional fields or sections added
- Patch: clarifications to existing definitions

Files written to an older minor version remain valid under a newer minor version.

---

## Contributing

This is a draft spec and active contributions are welcome. The goal is a standard useful to any commerce platform, not tied to any single tool or implementation.

**How to contribute:**

- **File an issue** for corrections, missing fields, ambiguous language, or use cases the spec does not cover: github.com/shop-md/shop.md/issues
- **Open a PR** for new example implementations (one store per directory under `examples/`)
- **Start a discussion** for larger changes (new sections, breaking field changes) before writing code or prose

The maintainers review contributions within 7 days. Breaking changes to required fields require a major version bump and a discussion issue first. New optional fields can be proposed via PR with a real-world use case.

See `CONTRIBUTING.md` for the full process.

---

## References

Standards and specifications this document aligns to or normatively references.

| Reference | Description | URL |
|---|---|---|
| ARD v0.9 | Agentic Resource Discovery spec. Defines `/.well-known/ai-catalog.json`, `specVersion`, `entries`, and URN identifier format. | github.com/ards-project/ard-spec |
| IETF aipref | `Content-Usage` header vocabulary for AI training and search signals (`train-ai`, `search`). | datatracker.ietf.org/wg/aipref |
| RFC 7763 | Registers `text/markdown` as an IANA media type. | datatracker.ietf.org/doc/rfc7763 |
| RFC 8288 | Web Linking. Defines `Link` response header and `rel` attribute semantics. | datatracker.ietf.org/doc/rfc8288 |
| RFC 9309 | Robots Exclusion Protocol. Governs `User-agent` and `Allow`/`Disallow` directives in `robots.txt`. | datatracker.ietf.org/doc/rfc9309 |
| BCP 47 (RFC 5646) | Language tag standard. Used for the `language` field. | datatracker.ietf.org/doc/rfc5646 |
| ISO 3166-1 alpha-2 | Two-letter country codes. Used for `ships_to` and `ships_from`. | iso.org/iso-3166-country-codes |
| ISO 4217 | Three-letter currency codes. Used for `currencies`. | iso.org/iso-4217-currency-codes |
| Schema.org OnlineStore | Structured data type for online stores. SHOP.md fields map to its properties. | schema.org/OnlineStore |
| Schema.org MerchantReturnPolicy | Structured data type for return policies. | schema.org/MerchantReturnPolicy |
| W3C TDMRep | Text and Data Mining Reservation. Defines `tdm-reservation` header for EU DSM Directive alignment. | w3c.github.io/tdm-reservation-protocol |
| Google Product Taxonomy | Open taxonomy for product categories. Apache 2.0 licensed tooling. | support.google.com/merchants/answer/6324436 |
| Universal Commerce Protocol (UCP) | Transaction layer for AI commerce. Complements SHOP.md's context layer. | ucp.dev — github.com/Universal-Commerce-Protocol/ucp |
| llms.txt | Discovery index standard for AI-readable files. SHOP.md should be listed under `## Commerce`. | llmstxt.org |
| AGENTS.md | Open format for briefing AI coding agents. Stewarded by the Linux Foundation. | agents.md |
| design.md | Open standard for design tokens and component context in markdown. Defines the `design.md` companion file format. | github.com/google-labs-code/design.md |
| brand.md | Open standard for brand identity files. Defines the `brand.md` companion file format for AI tools. | github.com/caiopizzol/brand.md |

---

*SHOP.md is an open standard. MIT licensed. Authors: Kazim Ali and Saad Bhutto at Devkind (devkind.com.au). Standard home: shopmd.org. Reference implementation for Shopify: shopmd.ai.*
