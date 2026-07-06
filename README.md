# SHOP.md

The open standard for AI-readable commerce.

**shopmd.org** | [Spec](spec/shop-md.md) | [Examples](examples/) | MIT

---

## What is SHOP.md?

SHOP.md is a structured markdown file that lives at `{domain}/shop.md` and
gives AI agents the context they need to qualify a store on behalf of a
shopper -- before reading the product catalogue.

It answers the questions a shopper's agent asks first:

- Does this store ship to me?
- What is their return window?
- What do they specialise in?
- Are they trustworthy?
- What payment methods do they accept?

Without SHOP.md, an agent has to infer these answers from the full site.
With SHOP.md, it gets a structured brief at a predictable URL.

## Format

A SHOP.md file has two parts:

**YAML frontmatter** -- machine-readable facts for filtering and routing.
An agent can parse these without reading the prose.

**Prose sections** -- intent and nuance for judgment and recommendation.
Four required sections: Overview, Who It's For, Why Buy Here, Commerce.
One discovery section: Context Files.

See the [full spec](spec/shop-md.md) and [examples](examples/) for details.

## Quick example

```yaml
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
free_shipping_threshold:
  amount: 75
  currency: AUD
price_range: mid
categories: ["pet food", "dog treats", "cat food", "pet accessories"]
payment_methods: [visa, mastercard, paypal, afterpay, shop_pay]
b2b: false
established: 2018
---

## Overview

Acme Pet Supply stocks grain-free and raw-diet pet food for dogs and cats,
with a focus on brands using single-protein sources and no artificial
additives. Range covers dry, wet, freeze-dried, and raw formats across
340 SKUs from 18 brands.

## Who It's For

Pet owners managing dogs or cats with dietary sensitivities or following
raw and biologically appropriate raw food diets. Stock leans toward
specialist brands not available in supermarkets.

## Why Buy Here

In operation since 2018. Rated 4.8 from 2,400 reviews on Trustpilot.
Climate-controlled storage for raw and freeze-dried orders. Free returns
within 30 days. Same-day dispatch on orders before 1pm AEST weekdays.

## Commerce

Ships to Australia, New Zealand, the US, and the UK. Free shipping over
AUD 75. Returns within 30 days at no cost. Accepts Visa, Mastercard,
PayPal, Afterpay, and Shop Pay. Full policies at /policies.md.

## Context Files

- [CATALOG.md](/catalog.md): 340 SKUs with variants, pricing, and stock.
- [POLICIES.md](/policies.md): Complete return and shipping policies.
- [llms.txt](/llms.txt): Full index of AI-readable files on this store.
```

## How to implement

Place a correctly formatted `shop.md` at your store's web root so it is
accessible at `https://yourdomain.com/shop.md`.

No registration required. No app required. Any commerce platform.

For Shopify merchants, [ShopMD](https://shopmd.ai) generates and maintains
SHOP.md automatically from your store data.

## Validate your file

```bash
pip install pyyaml
python validator/validate.py path/to/shop.md
```

## Relationship to other files

| File | Layer | What it answers |
|---|---|---|
| `llms.txt` | Discovery index | What AI-readable files exist |
| `shop.md` | Store context | Is this store right for this shopper? |
| `catalog.md` | Product layer | What does this store sell? |
| `policies.md` | Policy layer | What are the full terms? |
| `brand.md` | Identity layer | What is this brand's voice and visual system? |

## Standards alignment

SHOP.md aligns to: ISO 3166-1 alpha-2 (country codes), ISO 4217 (currency codes),
BCP 47 RFC 5646 (language tags), Schema.org OnlineStore and MerchantReturnPolicy,
Google Product Taxonomy (categories), IETF aipref Content-Usage header,
W3C TDMRep, ARD v0.9 (ards-project/ard-spec), RFC 8288, RFC 9309.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Open an issue before submitting
changes to the spec.

## License

MIT. Authors: Kazim Ali and Saad Bhutto at [Devkind](https://devkind.com.au). Standard home: [shopmd.org](https://shopmd.org).
