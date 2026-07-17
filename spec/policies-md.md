# POLICIES.md Open Standard
**Version:** 0.1
**Status:** Draft Proposal
**Date:** 2026-07-07
**License:** MIT
**Home:** shopmd.org
**Repository:** github.com/shop-md/shop.md

**Authors:**

- Kazim Ali -- Devkind
- Saad Bhutto -- Devkind

---

> **This is a working draft.** Fields, section names, and behaviours described here may change before a stable release. Implementers are encouraged to track the repository and participate in shaping the spec. Feedback via GitHub Issues is the primary mechanism for contribution.

---

## What is POLICIES.md?

POLICIES.md is the policy layer in the AI commerce context stack. It is a structured markdown file that lives at `{domain}/policies.md` and gives AI agents the complete policy terms for a store -- returns, shipping, and privacy -- in a single readable file.

Agents read POLICIES.md when a shopper needs policy confirmation before purchase: the exact return window, whether international shipping is available and at what cost, how personal data is handled. [SHOP.md](/spec/shop-md/)'s Commerce section gives the agent enough to qualify a store. POLICIES.md gives the agent enough to confirm terms and make a purchase recommendation with full policy confidence.

POLICIES.md is pointed to by SHOP.md's Commerce section and listed in Context Files. It replaces the need for an agent to locate, parse, and reconcile a store's individual policy pages -- which are written for human readers, structured for SEO, and inconsistently formatted across stores and platforms.

Any commerce store on any platform can implement POLICIES.md by placing a correctly formatted markdown file at `{domain}/policies.md`. No app required. No registration required.

---

## Philosophy

SHOP.md summarises. POLICIES.md completes.

SHOP.md's Commerce section carries the signals an agent needs to decide whether a store is worth recommending: return window in days, free shipping threshold, accepted payment methods. That is enough to qualify. It is not enough to confirm.

A shopper asking "can I return this if it doesn't fit?" or "will my data be sold to third parties?" needs the full terms, not a summary. POLICIES.md carries those terms. It is written for an AI reader: complete, structured, no marketing copy. Legal boilerplate is permitted in the Privacy section because it serves a compliance function, but prose that exists to reassure rather than inform has no place here.

Policy terms vary too much across jurisdictions and store types to standardise at the field level. A YAML frontmatter block handles identity and versioning. The prose sections carry the terms in full.

---

## File Format

### Location

Served at `{domain}/policies.md`. For Shopify stores, served via App Proxy at `{myshopify-domain}/apps/shopmd/policies.md` and mirrored at the custom domain by the ShopMD application.

For non-Shopify implementations: place `policies.md` at the web root and ensure it is publicly accessible without authentication.

### Structure

A POLICIES.md file has two parts: a YAML frontmatter block and a prose body with three required sections and one optional section.

---

## YAML Frontmatter

The frontmatter identifies the file and its version. Policy terms vary too much across jurisdictions and store types to standardise at the field level -- the prose sections carry the terms. The frontmatter is intentionally minimal.

```yaml
---
shop: "Store Name"
domain: storename.com
format: policies.md
version: "1.0"
---
```

### Required fields

| Field | Type | Description |
|---|---|---|
| `shop` | string | Store display name. Must match the `shop` field in the corresponding `shop.md`. |
| `domain` | string | Canonical domain (no protocol). Must match the `domain` field in the corresponding `shop.md`. |
| `format` | string | Always `policies.md`. |
| `version` | string | Spec version this file conforms to. |

No additional structured fields are defined. Implementers must not add custom frontmatter fields that carry policy terms -- those belong in the prose sections.

---

## Prose Sections

Three required sections, one optional. Each section contains the full policy text, not a summary. An agent reading a section must be able to answer a shopper's specific policy question without consulting any other source.

---

### 1. Returns

The complete return policy. An agent reads this section to answer any shopper question about returning a product from this store.

Required content:

- **Window.** The number of days from delivery (or purchase, if the store measures from purchase date -- specify which) during which a return is accepted.
- **Condition requirements.** What state the item must be in to qualify: unused, unopened, original packaging, tags attached, or similar.
- **Process.** How the shopper initiates a return: which URL, email address, or portal they use to request it.
- **Return shipping.** Who pays for return postage. If the store covers it, state how (prepaid label, reimbursement). If the buyer pays, state that clearly.
- **Exclusions.** Product types, purchase types, or conditions that are not eligible for return: sale items, perishables, digital goods, items damaged by the buyer, opened consumables.
- **Refund timeline.** How long after the store receives the return before the refund is issued, and what form it takes (original payment method, store credit).

```markdown
## Returns

Returns are accepted within 30 days of the delivery date. Items must be
unopened, in original packaging, and in resaleable condition. Perishable
items (raw and freeze-dried food) are not eligible for return once opened.

To initiate a return, email returns@acmepetsupply.com with your order
number and reason for return. Acme Pet Supply will send a prepaid return
label within 1 business day. Return shipping is at no cost to the buyer.

Refunds are issued to the original payment method within 5 business days
of receiving the returned item. Store credit is offered as an alternative
with no minimum condition requirement.

Sale items purchased at 40% discount or greater are final sale and not
eligible for return. Gift cards are non-refundable.
```

---

### 2. Shipping

All shipping options and associated costs, timeframes, and conditions. An agent reads this section to answer any shopper question about delivery speed, cost, or availability to their location.

Required content:

- **Regions served.** Every country or region the store ships to. If the store ships worldwide, state that and note any exclusions.
- **Options and costs.** Each available shipping option, its cost, and the regions it applies to. If cost is weight- or order-value-based, describe the formula or tiers.
- **Delivery timeframes.** Expected transit time per option and region. State whether timeframes are business days or calendar days.
- **Free shipping.** Threshold amount and currency, or state that no free shipping is available.
- **Carrier names.** Which carriers are used per region or option. Required so agents can advise on tracking, missed delivery procedures, and known carrier limitations.
- **Handling time.** Cutoff time and days on which orders are dispatched. State the timezone.
- **Tracking.** Whether tracking is provided, and at which service levels.

```markdown
## Shipping

Acme Pet Supply ships to Australia, New Zealand, the United States, the
United Kingdom, and Canada.

**Australia**
Standard (2-5 business days): AUD 9.95 flat rate. Carrier: Australia Post.
Express (1-2 business days): AUD 14.95 flat rate. Carrier: Australia Post
Express.
Free standard shipping on orders over AUD 75.

**New Zealand**
Standard (5-8 business days): AUD 14.95. Carrier: Australia Post
International.
No express option available.
Free shipping on orders over AUD 120.

**United States and Canada**
Standard (8-14 business days): AUD 24.95. Carrier: Australia Post
International. Delivered by USPS or Canada Post for the final leg.
No express option available.
No free shipping threshold for US or CA orders.

**United Kingdom**
Standard (7-12 business days): AUD 19.95. Carrier: Australia Post
International. Delivered by Royal Mail for the final leg.
No express option available.
No free shipping threshold for UK orders.

Orders placed before 1pm AEST Monday to Friday are dispatched the same
day. Orders placed after 1pm or on weekends and public holidays are
dispatched the next business day.

Tracking is provided for all domestic Australian orders and all
international orders. Tracking numbers are emailed when the order is
dispatched.

Acme Pet Supply is not responsible for customs duties or import taxes on
international orders. These are the buyer's responsibility and vary by
destination country.
```

---

### 3. Privacy

What personal data is collected, how it is used, whether it is shared with third parties, and the contact for data requests. Written in plain language. This section may include legally required disclosures but must not consist entirely of boilerplate that obscures what the store actually does with shopper data.

Required content:

- **Data collected.** Categories of personal data the store collects: name, email, shipping address, payment information, browsing behaviour, device identifiers.
- **Purpose.** Why each category is collected and how it is used.
- **Third-party sharing.** Whether data is shared with third parties and who: payment processors, shipping carriers, marketing platforms, analytics providers. Name the categories of third parties or the third parties themselves.
- **Data retention.** How long the store retains personal data.
- **Shopper rights.** What the shopper can request: access, correction, deletion, portability. How to submit a request.
- **Contact.** Email address or URL for data and privacy enquiries.

```markdown
## Privacy

**Data collected**
Acme Pet Supply collects name, email address, shipping address, and
billing address when an order is placed. Payment card data is handled
entirely by Shopify Payments and Stripe -- Acme Pet Supply does not
store card numbers or CVVs. Browsing behaviour (pages viewed, products
clicked, cart contents) is collected via Shopify Analytics and Google
Analytics 4.

**How it is used**
Order and address data is used to fulfil and ship orders, send order
confirmations and shipping notifications, and handle returns and
customer support. Email addresses are added to the Acme Pet Supply
marketing list only with explicit opt-in at checkout. Browsing data
is used to improve store performance and inform product decisions.

**Third-party sharing**
Personal data is shared with:
- Australia Post and international carrier partners, for the purpose
  of order delivery (name and shipping address only).
- Shopify Inc., as the platform operator, under Shopify's privacy
  policy (shopify.com/legal/privacy).
- Google LLC, for analytics (anonymised, aggregated data only).
- Klaviyo Inc., for email marketing (email address and purchase
  history, only for customers who opted in).

Acme Pet Supply does not sell personal data to third parties.

**Retention**
Order records, including associated personal data, are retained for
7 years to comply with Australian tax record-keeping requirements.
Marketing list membership is retained until the shopper unsubscribes.

**Shopper rights**
Shoppers may request access to, correction of, or deletion of their
personal data at any time. To submit a request, email
privacy@acmepetsupply.com with the subject line "Data Request" and
the email address associated with the account.

Acme Pet Supply complies with the Australian Privacy Act 1988 and the
Australian Privacy Principles. Shoppers in the EU and UK are entitled
to rights under GDPR and the UK GDPR respectively.

**Contact**
Privacy enquiries: privacy@acmepetsupply.com
```

---

### 4. Terms of Sale (optional)

Additional terms that affect a purchase decision and are not covered by the Returns, Shipping, or Privacy sections. Include only if the terms are material to the shopper. Do not use this section to reproduce standard terms that apply to all online stores -- include only what is specific to this store.

Examples of content appropriate for this section:

- Warranty terms for products the store warrants beyond the manufacturer
- B2B or wholesale terms that differ from consumer terms
- Age restrictions on products or categories
- Geographic restrictions on specific products
- Dispute resolution process and governing law

```markdown
## Terms of Sale

**Product warranties**
Acme Pet Supply offers a 30-day satisfaction guarantee on all
private-label products (Acme brand). If the pet refuses the food or
shows an adverse reaction within 30 days of purchase, a full refund
or exchange is offered with no requirement to return the opened item.
This guarantee applies once per product SKU per customer.

**B2B and wholesale**
Wholesale accounts are available for veterinary clinics, grooming
salons, and kennels with a minimum order of AUD 500 per quarter.
Wholesale pricing and terms are negotiated separately. Contact
wholesale@acmepetsupply.com to apply.

**Governing law**
These terms are governed by the laws of Queensland, Australia. Disputes
are subject to the jurisdiction of the Queensland courts.
```

---

## Full Example

A complete POLICIES.md for Acme Pet Supply.

```markdown
---
shop: "Acme Pet Supply"
domain: acmepetsupply.com
format: policies.md
version: "1.0"
---

## Returns

Returns are accepted within 30 days of the delivery date. Items must be
unopened, in original packaging, and in resaleable condition. Perishable
items (raw and freeze-dried food) are not eligible for return once opened.

To initiate a return, email returns@acmepetsupply.com with your order
number and reason for return. Acme Pet Supply will send a prepaid return
label within 1 business day. Return shipping is at no cost to the buyer.

Refunds are issued to the original payment method within 5 business days
of receiving the returned item. Store credit is offered as an alternative
with no minimum condition requirement.

Sale items purchased at 40% discount or greater are final sale and not
eligible for return. Gift cards are non-refundable.

## Shipping

Acme Pet Supply ships to Australia, New Zealand, the United States, the
United Kingdom, and Canada.

**Australia**
Standard (2-5 business days): AUD 9.95 flat rate. Carrier: Australia Post.
Express (1-2 business days): AUD 14.95 flat rate. Carrier: Australia Post Express.
Free standard shipping on orders over AUD 75.

**New Zealand**
Standard (5-8 business days): AUD 14.95. Carrier: Australia Post International.
No express option available.
Free shipping on orders over AUD 120.

**United States and Canada**
Standard (8-14 business days): AUD 24.95. Carrier: Australia Post International.
Delivered by USPS or Canada Post for the final leg.
No express option. No free shipping threshold.

**United Kingdom**
Standard (7-12 business days): AUD 19.95. Carrier: Australia Post International.
Delivered by Royal Mail for the final leg.
No express option. No free shipping threshold.

Orders placed before 1pm AEST Monday to Friday are dispatched the same day.
Orders placed after 1pm or on weekends and public holidays are dispatched the
next business day.

Tracking is provided for all orders. Tracking numbers are emailed when the
order is dispatched. Customs duties and import taxes on international orders
are the buyer's responsibility.

## Privacy

**Data collected**
Acme Pet Supply collects name, email address, shipping address, and billing
address when an order is placed. Payment card data is handled entirely by
Shopify Payments and Stripe. Browsing behaviour is collected via Shopify
Analytics and Google Analytics 4.

**How it is used**
Order data is used to fulfil and ship orders and handle customer support.
Email addresses are added to the marketing list only with explicit opt-in
at checkout.

**Third-party sharing**
Data is shared with Australia Post and carrier partners (delivery),
Shopify Inc. (platform), Google LLC (analytics, anonymised), and
Klaviyo Inc. (email marketing, opted-in customers only).
Acme Pet Supply does not sell personal data.

**Retention**
Order records are retained for 7 years. Marketing list membership is
retained until unsubscribe.

**Shopper rights**
To request access, correction, or deletion of personal data, email
privacy@acmepetsupply.com with the subject line "Data Request".

Acme Pet Supply complies with the Australian Privacy Act 1988.
EU and UK shoppers are entitled to rights under GDPR and UK GDPR.

**Contact**
privacy@acmepetsupply.com

## Terms of Sale

**Satisfaction guarantee**
A 30-day satisfaction guarantee applies to all Acme private-label
products. If the pet refuses the food or shows an adverse reaction,
a full refund or exchange is offered without returning the opened
item. Applies once per SKU per customer.

**Wholesale**
Wholesale accounts available for veterinary clinics, grooming salons,
and kennels. Minimum AUD 500 per quarter. Contact
wholesale@acmepetsupply.com.

**Governing law**
Queensland, Australia.
```

---

## Serving POLICIES.md

### Response headers

All POLICIES.md responses must include:

```
Content-Type: text/markdown; charset=utf-8
Content-Usage: train-ai=n, search=y
```

`Content-Type: text/markdown` is specified by RFC 7763. `Content-Usage` is defined by the IETF `aipref` working group (draft-ietf-aipref-vocab, Proposed Standard track as of July 2026). The `train-ai=n` directive signals that store policy content must not be used to train AI models.

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

This is a SHOP.md ecosystem convention, not an external standard.

### robots.txt

Stores implementing POLICIES.md should ensure AI crawlers can access it:

```
User-agent: ClaudeBot
Allow: /policies.md

User-agent: GPTBot
Allow: /policies.md

User-agent: PerplexityBot
Allow: /policies.md
```

---

## Relationship to Other Files

POLICIES.md is the policy layer. It is read after SHOP.md, when the agent has qualified a store and needs to confirm terms before recommending a purchase.

| File | Layer | What it answers |
|---|---|---|
| `shop.md` | Store context | Is this store right for this shopper? Commerce section summarises policy and points to `/policies.md`. |
| `policies.md` | Policy layer | What are the complete return, shipping, and privacy terms? |

**Reading order for an agent making a purchase recommendation:**

1. Read `shop.md` to qualify the store: ships to the right region, return window acceptable, price range matches the shopper.
2. If the shopper needs complete policy confirmation before purchase, read `policies.md` for full terms.
3. `policies.md` is authoritative. Where SHOP.md's Commerce section and `policies.md` conflict, `policies.md` takes precedence.

**How SHOP.md points to POLICIES.md:**

In the Commerce prose section:

```markdown
## Commerce

Ships to Australia, New Zealand, the US, and the UK. Standard Australian
delivery 2-5 business days; express 1-2 days. Free shipping on orders
over AUD 75. Returns accepted within 30 days of delivery at no cost to
the buyer. Accepts Visa, Mastercard, PayPal, Afterpay, and Shop Pay.
Full policies at /policies.md.
```

In the Context Files section:

```markdown
## Context Files

- `/policies.md`: Complete return, shipping, and privacy policies.
```

---

## Versioning

POLICIES.md uses semantic versioning in the `version` frontmatter field.

- Major version: breaking changes to required sections or frontmatter structure
- Minor version: new optional sections added, or clarifications that change how existing sections must be written
- Patch: clarifications to existing definitions with no behavioural change

Files written to an older minor version remain valid under a newer minor version.

The `version` field refers to the spec version the file conforms to, not the version of the store's policies. Stores updating their policy terms do not need to change the `version` field unless the spec version they implement has changed.

---

## Contributing

This is a draft spec and active contributions are welcome. The goal is a standard useful to any commerce platform, not tied to any single tool or implementation.

**How to contribute:**

- **File an issue** for corrections, missing section requirements, ambiguous language, or use cases the spec does not cover: github.com/shop-md/shop.md/issues
- **Open a PR** for new example implementations (one store per directory under `examples/`)
- **Start a discussion** for larger changes (new required sections, breaking changes to frontmatter) before writing code or prose

The maintainers review contributions within 7 days. Breaking changes to required sections require a major version bump and a discussion issue first. New optional sections can be proposed via PR with a real-world use case.

See `CONTRIBUTING.md` for the full process.

---

*POLICIES.md is an open standard. MIT licensed. Authors: Kazim Ali and Saad Bhutto at Devkind (devkind.com.au). Standard home: shopmd.org. Reference implementation for Shopify: shopmd.ai.*
