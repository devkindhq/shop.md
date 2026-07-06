# BRAND.md Open Standard
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

## What is BRAND.md?

BRAND.md is the brand identity layer in the AI commerce context stack. It is a structured markdown file served at `{domain}/brand.md` that gives AI agents the voice, tone, editorial positioning, and writing rules of a store. An agent writing product descriptions, email copy, or social content for a store reads BRAND.md to produce on-brand output without a manual briefing each session.

It is not a design file. BRAND.md does not contain CSS, hex codes, font names, spacing tokens, or component styles. Those belong in DESIGN.md (maintained at github.com/google-labs-code/design.md). BRAND.md contains what the brand says and how it says it: the editorial identity, not the visual execution.

Any commerce store on any platform can implement BRAND.md by placing a correctly formatted markdown file at `{domain}/brand.md`. No app required. No registration required.

---

## Philosophy

Every AI session that writes for a brand starts with no context. A copywriting agent opening a new session knows nothing about how a store speaks, what it stands for, or what language it avoids. BRAND.md closes that gap.

It is the persistent brief -- the document a copywriter reads before their first day. Written once, referenced by every AI tool that touches the store's words: product description generators, email writers, social copy tools, customer service response drafters. An agent that has read BRAND.md produces on-brand output on the first attempt, without back-and-forth calibration.

**BRAND.md is editorial, not visual.** The line between brand and design is the line between words and pixels. Voice, tone, and positioning are editorial decisions. Colours, type, and layout are visual decisions. A BRAND.md that leaks into visual territory -- specifying hex codes or font pairings -- is out of scope. A DESIGN.md that specifies sentence length is out of scope. Keep the boundary clean. An agent knows which file to read for which task.

**Specificity over adjectives.** A BRAND.md that says "we are warm, friendly, and professional" is not useful. A BRAND.md that says "write in second person, keep sentences under 20 words, never use 'leverage', always refer to customers as 'you' not 'your pet owner'" is useful. The test: could a writer produce on-brand copy from this document alone, without asking any follow-up questions? If not, the document needs more specificity.

---

## File Format

### Location

Served at `{domain}/brand.md`. Place `brand.md` at the web root so it is publicly accessible at `https://yourdomain.com/brand.md`. No authentication required. The file must be readable by any HTTP client without redirects to login pages or paywalls.

### Structure

A BRAND.md file has two parts: a YAML frontmatter block and a prose body with four required sections.

---

## YAML Frontmatter

The frontmatter contains structured metadata that an agent can parse without reading the prose. Every field is optional except `brand`, `domain`, `format`, and `version`.

```yaml
---
brand: "Acme Pet Supply"
domain: acmepetsupply.com
format: brand.md
version: "1.0"

tone: ["direct", "knowledgeable", "warm"]      # array of 3-5 tone descriptors
audience: "health-conscious pet owners"         # one-line description
voice_not: ["corporate", "clinical", "cute"]   # what the brand explicitly avoids
language: en-AU                                 # BCP 47 (RFC 5646) language tag
---
```

### Required fields

| Field | Type | Description |
|---|---|---|
| `brand` | string | Brand display name, as it should appear in copy |
| `domain` | string | Canonical domain (no protocol) |
| `format` | string | Always `brand.md` |
| `version` | string | Spec version this file conforms to |

### Recommended fields

| Field | Type | Description |
|---|---|---|
| `tone` | array | 3-5 single-word tone descriptors. Used by agents to calibrate register before reading prose. |
| `audience` | string | One-line description of the primary buyer. Plain English. Not a persona name. |
| `voice_not` | array | Tone descriptors the brand explicitly rejects. Helps agents avoid false positives when inferring style. |
| `language` | BCP 47 (RFC 5646) | Primary language of the brand's copy. Use tags like `en`, `en-AU`, `en-GB`. |

---

## Prose Sections

Four required sections. Each section provides rules and context that cannot be captured in frontmatter. Prose is written for an AI reader: specific, actionable, no marketing language. Adjectives must be followed by rules that implement them.

---

### 1. Voice

How the brand writes. This section specifies sentence length preference, vocabulary level, use of technical jargon, formality register, point of view, and any structural patterns the brand uses consistently.

Voice stays constant across all content types. It is what makes the brand recognisable regardless of whether the copy is a product description, an order confirmation, or a returns policy.

Write rules, not descriptions. "We are conversational" is a description. "Use second person throughout. Keep sentences under 20 words. Use active voice. Prefer common words over technical synonyms -- 'raw food' not 'biologically appropriate raw food' in headings, though the full term is acceptable in body copy" is a set of rules.

```markdown
## Voice

Write in second person. Address the reader as "you" or "your pet", never "pet owners" or "customers".

Keep sentences under 20 words. Break any sentence that exceeds this into two.

Use active voice. "We ship same-day" not "Same-day shipping is available".

Prefer plain words over technical synonyms in headings and short copy. Use "raw food", not "biologically appropriate raw food" or "species-appropriate diet" in buttons, labels, and headings. The full term is acceptable in product descriptions and editorial content when precision matters.

Never use: "leverage", "solution", "seamless", "holistic", "journey", "cutting-edge", "innovative", "game-changing", "world-class", or "best-in-class".

Do not use rhetorical questions as headlines. "Tired of your dog turning their nose up at dinner?" is not the voice.

Numbers under 10 are written as words in prose ("three brands", "two options"). Numbers 10 and above use numerals ("18 brands", "340 SKUs").
```

---

### 2. Tone

The emotional register of the copy and how it shifts across content types. Voice is constant -- tone adjusts to context. This section maps tone to surface. An agent writing an error message should not use the same register as an agent writing a new product announcement.

```markdown
## Tone

The baseline tone is informed and direct -- the register of a knowledgeable friend who happens to know a lot about pet nutrition. Not a lecture. Not a sales pitch. Confident without being dismissive.

**Product descriptions:** Informative first, then persuasive. Lead with what the product is and who it is for. The emotional case comes after the practical case. Avoid superlatives. "One of the few Australian-made freeze-dried options using a single protein source" is more useful than "the best freeze-dried food on the market".

**Email (transactional -- order confirmation, shipping notification):** Efficient and reassuring. Give the customer the information they need and stop. No upselling in transactional email. No enthusiasm markers ("Exciting news!" or "We're thrilled to share"). State the fact.

**Email (marketing -- new product, promotion):** A degree warmer than product descriptions. Still no superlatives. The angle is always "here is something useful for your pet's situation", not "here is a deal". Promotions are framed around the product benefit, not the discount.

**Error messages and service notifications:** Plain and actionable. "Your order could not be processed. Check your payment details and try again." Not "Oops! Something went wrong on our end." The brand does not use "Oops".

**Social (Instagram, Facebook):** Shorter sentences. One idea per post. A degree more personal than product copy -- the store is speaking, not a product sheet. Still no exclamation marks except in rare cases where genuine excitement is warranted (a new brand addition the store has been pursuing for months, for example).
```

---

### 3. Positioning

What the brand stands for, what it owns in its category, and the editorial boundary conditions for any generated copy. This section tells an agent what the brand would and would not say -- the position it holds, the claims it can make, and the territory it does not enter.

```markdown
## Positioning

Acme Pet Supply is a specialist retailer for pet owners who have moved beyond the supermarket aisle. The position the brand owns: the most knowledgeable source for raw, grain-free, and single-protein pet food in Australia, with a vet-advisory panel that reviews every new brand before it is listed.

The brand speaks to pet owners who have already decided to feed their animals better -- not to owners who need to be convinced that diet matters. Copy should not argue the case for raw feeding or grain-free diets. That debate is over for this customer. Start from the assumption that the reader understands why these choices matter and wants help making the right specific choice.

**What Acme Pet Supply would say:**

- "This formula uses kangaroo as the sole protein source, which makes it suitable for dogs with a chicken or beef sensitivity."
- "We stocked this brand after six months of evaluation. Here is what we looked for."
- "If your cat has been on a raw diet for less than a month, start with the transition pack."

**What Acme Pet Supply would not say:**

- Claims about curing, treating, or preventing medical conditions. The brand does not make therapeutic claims about food. "Supports joint health" (with qualified sourcing) is acceptable. "Treats arthritis" is not.
- Comparative claims about specific competitor products by name. The brand can state its own position; it does not require comparisons to make the case.
- Pricing pressure language: "cheapest", "unbeatable value", "lowest prices". Acme Pet Supply competes on quality and expertise, not price.
- Urgency fabrication: "Only 3 left!" when stock levels are not confirmed. "Order before midnight for Christmas delivery!" unless dispatch capacity has been verified. Generated copy must not assert stock or delivery claims the store cannot guarantee.
- First-person plural for the brand voice ("we believe", "we think"). State facts and let the facts carry the argument. Reserve "we" for operational statements ("we ship same-day", "we review every brand").
```

---

### 4. Writing Rules

Specific editorial rules that apply to all copy generated for this brand. Rules cover capitalisation, brand name usage, formatting conventions, date and currency formats, competitor handling, and approved and banned vocabulary.

```markdown
## Writing Rules

**Brand name:**
Always "Acme Pet Supply" in full on first mention in any piece of copy. Subsequent mentions in the same piece may use "Acme Pet Supply" or "the store". Never "Acme" alone. Never "APS".

**Product names:**
Capitalise product names as they appear in the catalogue. "Frontier Pets Free-Range Chicken" -- not "Frontier Pets free-range chicken" or "frontier pets free-range chicken". When in doubt, refer to the catalogue entry.

**Species references:**
"Dogs" and "cats" are lowercase. "Labrador Retriever", "Maine Coon" -- breed names follow the breed standard capitalisation (first letter of each word capitalised).

**Currency:**
AUD prices use the format `$XX.00 AUD`. Do not write `AUD$XX.00` or `A$XX.00`. International prices follow the same pattern with the appropriate ISO 4217 code: `$XX.00 USD`.

**Dates:**
Use day-month-year format without ordinal suffixes: "7 July 2026", not "July 7th, 2026" or "07/07/26".

**Percentages and weights:**
Use numerals for all measurements: "5% off", "1.5 kg", "500 g". No space between numeral and unit for percentages; one space between numeral and unit for weight and volume.

**Exclamation marks:**
Avoid. One per piece of copy is the maximum. Zero is preferred.

**Em dashes:**
Do not use em dashes (--) in copy. Use a comma, full stop, or parentheses.

**Competitor mentions:**
Do not name competitors in generated copy. If a comparison is necessary, use category language: "unlike mass-market pet food brands" is acceptable. "Unlike [Competitor Name]" is not.

**Approved terms (prefer these):**
- "raw food", "grain-free", "single-protein", "freeze-dried", "air-dried"
- "pet owner", "your dog", "your cat"
- "stocked", "listed", "available at Acme Pet Supply"
- "vet-reviewed", "vet-advisory panel"

**Banned terms (do not use in any copy):**
- "natural" as a standalone quality claim (the word has no regulatory definition in this context)
- "organic" unless the product is certified organic -- include the certification body
- "human-grade" unless the product is certified to that standard
- "premium" as a standalone descriptor (the store's position makes it redundant)
- "delicious", "tasty", "yummy" -- the store does not anthropomorphise its assessment of palatability
- "fur babies", "fur kids", "furkids" -- the brand respects that customers are serious about their animals; this register is inconsistent with that respect
```

---

## Full Example

A complete BRAND.md for Acme Pet Supply. This file is sufficient for an AI agent to write on-brand copy for this store without any other briefing.

```markdown
---
brand: "Acme Pet Supply"
domain: acmepetsupply.com
format: brand.md
version: "1.0"
tone: ["direct", "knowledgeable", "warm"]
audience: "health-conscious dog and cat owners committed to raw, grain-free, or single-protein diets"
voice_not: ["corporate", "clinical", "cute", "promotional"]
language: en-AU
---

## Voice

Write in second person. Address the reader as "you" or "your pet", never "pet owners" or "customers".

Keep sentences under 20 words. Break any sentence that exceeds this into two.

Use active voice. "We ship same-day" not "Same-day shipping is available".

Prefer plain words over technical synonyms in headings and short copy. Use "raw food", not "biologically appropriate raw food" or "species-appropriate diet" in buttons, labels, and headings. The full term is acceptable in product descriptions and editorial content when precision matters.

Never use: "leverage", "solution", "seamless", "holistic", "journey", "cutting-edge", "innovative", "game-changing", "world-class", or "best-in-class".

Do not use rhetorical questions as headlines. "Tired of your dog turning their nose up at dinner?" is not the voice.

Numbers under 10 are written as words in prose ("three brands", "two options"). Numbers 10 and above use numerals ("18 brands", "340 SKUs").

## Tone

The baseline tone is informed and direct -- the register of a knowledgeable friend who happens to know a lot about pet nutrition. Not a lecture. Not a sales pitch. Confident without being dismissive.

**Product descriptions:** Informative first, then persuasive. Lead with what the product is and who it is for. Avoid superlatives. "One of the few Australian-made freeze-dried options using a single protein source" is more useful than "the best freeze-dried food on the market".

**Email (transactional):** Efficient and reassuring. Give the customer the information they need and stop. No upselling. No enthusiasm markers ("Exciting news!" or "We're thrilled to share"). State the fact.

**Email (marketing):** A degree warmer than product descriptions. Still no superlatives. Frame promotions around product benefit, not the discount.

**Error messages:** Plain and actionable. "Your order could not be processed. Check your payment details and try again." Not "Oops! Something went wrong."

**Social:** Shorter sentences. One idea per post. A degree more personal than product copy. No exclamation marks except in rare cases where genuine excitement is warranted.

## Positioning

Acme Pet Supply is a specialist retailer for pet owners who have moved beyond the supermarket aisle. The position the brand owns: the most knowledgeable source for raw, grain-free, and single-protein pet food in Australia, with a vet-advisory panel that reviews every new brand before it is listed.

Copy should not argue the case for raw feeding or grain-free diets. Start from the assumption that the reader has already made that decision and wants help choosing correctly within it.

**What Acme Pet Supply would say:**

- "This formula uses kangaroo as the sole protein source, which makes it suitable for dogs with a chicken or beef sensitivity."
- "We stocked this brand after six months of evaluation. Here is what we looked for."
- "If your cat has been on a raw diet for less than a month, start with the transition pack."

**What Acme Pet Supply would not say:**

- Claims about curing, treating, or preventing medical conditions.
- Comparative claims naming specific competitors.
- Pricing pressure language: "cheapest", "unbeatable value", "lowest prices".
- Urgency fabrication: "Only 3 left!" unless stock levels are confirmed.
- First-person plural for opinion: "we believe", "we think".

## Writing Rules

**Brand name:** Always "Acme Pet Supply" in full on first mention. Subsequent mentions may use "Acme Pet Supply" or "the store". Never "Acme" alone. Never "APS".

**Product names:** Capitalise as they appear in the catalogue.

**Species:** "Dogs" and "cats" are lowercase. Breed names follow breed-standard capitalisation.

**Currency:** `$XX.00 AUD`. Not `AUD$XX.00` or `A$XX.00`.

**Dates:** Day-month-year without ordinal suffixes: "7 July 2026".

**Percentages and weights:** Numerals throughout: "5% off", "1.5 kg", "500 g".

**Exclamation marks:** Zero preferred. Maximum one per piece of copy.

**Em dashes:** Do not use. Use a comma, full stop, or parentheses.

**Competitor mentions:** Do not name competitors. Category language is acceptable: "unlike mass-market pet food brands".

**Approved terms:** raw food, grain-free, single-protein, freeze-dried, air-dried, stocked, vet-reviewed, vet-advisory panel.

**Banned terms:** natural (as standalone quality claim), organic (without certification), human-grade (without certification), premium (as standalone descriptor), delicious, tasty, yummy, fur babies, fur kids, furkids.
```

---

## Relationship to DESIGN.md

BRAND.md and DESIGN.md are companion files with a clean division of responsibility. BRAND.md is editorial identity: what the brand says, how it says it, what it stands for. DESIGN.md (maintained at github.com/google-labs-code/design.md) is visual identity: colours, typography, spacing, and component tokens. An agent writing product descriptions reads BRAND.md. A developer implementing a checkout UI reads DESIGN.md. A store can implement one without the other; implementing both gives AI agents a complete picture of how the brand presents itself in words and in pixels.

The boundary is deliberate. If copy instructions appear in DESIGN.md, they are out of scope for that spec. If visual specifications appear in BRAND.md, they are out of scope for this spec. Agents should treat any visual content in BRAND.md as informational context only, not as the authoritative source for design decisions.

---

## Serving BRAND.md

### Response headers

All BRAND.md responses must include:

```
Content-Type: text/markdown; charset=utf-8
Content-Usage: train-ai=n, search=y
```

`Content-Type: text/markdown` is specified by RFC 7763. `Content-Usage` is defined by the IETF `aipref` working group (draft-ietf-aipref-vocab, Proposed Standard track as of July 2026). The `train-ai=n` directive signals that brand context must not be used to train AI models.

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

Stores implementing BRAND.md should ensure AI agents can access it:

```
User-agent: ClaudeBot
Allow: /brand.md

User-agent: GPTBot
Allow: /brand.md

User-agent: PerplexityBot
Allow: /brand.md
```

---

## Relationship to Other Files

BRAND.md is the editorial brief. It is one layer in a stack of AI-readable files that together give agents a complete picture of a store.

| File | Layer | What it answers |
|---|---|---|
| `llms.txt` | Discovery index | What AI-readable files exist on this domain |
| SHOP.md | Store context | Is this store right for this shopper? |
| CATALOG.md | Product layer | What does this store sell, exactly? |
| POLICIES.md | Policy layer | What are the full terms? |
| BRAND.md | Identity layer | What does this brand sound like? What can and can't it say? |
| DESIGN.md | UI execution layer | How is this store's interface built? (see github.com/google-labs-code/design.md) |

SHOP.md references BRAND.md in its Context Files section. An agent following the standard reading order encounters SHOP.md first, then follows the BRAND.md pointer when it needs to produce copy. BRAND.md does not need to reference SHOP.md -- the dependency is one-directional.

CATALOG.md provides the product data that BRAND.md-informed copy is written about. An agent generating a product description reads both: CATALOG.md for the facts, BRAND.md for the voice.

---

## Minimum Viable BRAND.md

A store can implement BRAND.md with required fields only and two prose sections. This is valid:

```markdown
---
brand: "Acme Pet Supply"
domain: acmepetsupply.com
format: brand.md
version: "1.0"
---

## Voice

Write in second person. Keep sentences under 20 words. Use active voice. Never use "leverage", "seamless", or "solution".

## Writing Rules

Brand name: Always "Acme Pet Supply" in full. Never "Acme" alone.
Banned terms: fur babies, furkids, yummy, premium (as standalone descriptor).
```

A minimum file is better than no file. An agent with partial guidance produces better output than an agent with none. Start here, expand over time.

---

## Versioning

BRAND.md uses semantic versioning in the `version` frontmatter field.

- Major version: breaking changes to required fields or prose section structure
- Minor version: new optional fields or sections added
- Patch: clarifications to existing definitions

Files written to an older minor version remain valid under a newer minor version.

The `version` field in frontmatter refers to the version of this spec the file conforms to. It is not a version number for the brand itself. Stores that want to track internal revisions to their brand voice should use a separate field (e.g. `brand_version: "2.3"`) and document that convention in their own tooling.

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

*BRAND.md is an open standard. MIT licensed. Authors: Kazim Ali and Saad Bhutto at Devkind (devkind.com.au). Standard home: shopmd.org. Reference implementation for Shopify: shopmd.ai.*
