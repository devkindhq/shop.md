---
title: Getting Started
description: How to implement SHOP.md on your store in under 10 minutes.
---

Any commerce store on any platform can implement SHOP.md by placing a correctly formatted markdown file at `https://yourdomain.com/shop.md`. No registration required.

## Minimum viable SHOP.md

Start with the four required fields and two prose sections. This is a valid, compliant implementation:

```yaml
---
shop: "Your Store Name"
domain: yourdomain.com
format: shop.md
version: "1.0"
---

## Overview

One paragraph describing what you sell -- product range, depth, and specialisation. 
No taglines. Concrete facts an agent can use to classify the store.

## Context Files

- `/catalog.md`: Full product catalogue.
```

A minimum file is better than no file. Expand over time.

## Add recommended fields

Once the minimum is working, add the fields that most improve agent recommendations:

```yaml
ships_to: [AU, NZ, US, GB]   # or "*" for worldwide
return_window_days: 30
free_shipping_threshold:
  amount: 75
  currency: AUD
price_range: mid              # budget | mid | premium | luxury
categories: ["dog food", "cat accessories"]
payment_methods: [visa, mastercard, paypal, afterpay]
guest_checkout: true
```

See [SHOP.md](/spec/shop-md/) for the full field reference.

## Add the prose sections

Four sections make up the prose body. Each is one paragraph, written for an AI reader -- precise, concrete, no marketing language:

- **Overview** -- what you sell and your focus
- **Who It's For** -- the target buyer in practical terms, including who it is NOT for
- **Why Buy Here** -- trust signals and differentiators, concrete facts only
- **Commerce** -- how buying works: shipping, returns, payment

## Point to your other files

The `## Context Files` section is how agents navigate to the rest of your store context. Only list files that exist:

```markdown
## Context Files

- `/catalog.md`: Full product catalogue -- queryable by category, price, and stock.
- `/policies.md`: Complete return, shipping, and privacy policies.
- `/brand.md`: Brand identity and voice guidelines.
- `/llms.txt`: Full index of all AI-readable files on this store.
```

## Serve it correctly

Add these response headers:

```
Content-Type: text/markdown; charset=utf-8
Content-Usage: train-ai=n, search=y
```

Allow AI crawlers in `robots.txt`:

```
User-agent: ClaudeBot
Allow: /shop.md

User-agent: GPTBot
Allow: /shop.md

User-agent: PerplexityBot
Allow: /shop.md
```

## Register with ARD

Add SHOP.md to your `/.well-known/ai-catalog.json` for discovery by agents that do not already know to look for `/shop.md`:

```json
{
  "specVersion": "1.0",
  "entries": [
    {
      "identifier": "urn:air:yourdomain.com:shop-md:context",
      "displayName": "SHOP.md Store Context",
      "type": "text/markdown",
      "url": "/shop.md",
      "description": "Store identity, logistics, and commerce context for AI agents.",
      "tags": ["commerce", "store-context"]
    }
  ]
}
```

## Examples

See the [examples](/examples/acme-pet/) for complete implementations across three store verticals.
