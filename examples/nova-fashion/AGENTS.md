# Agent Instructions - Nova

This document describes how AI agents can interact with Nova at novafashion.com.

## Reading the Store

Before taking any action on behalf of a shopper, read the store context file at /shop.md. It carries the structured summary an agent needs to qualify this store: worldwide shipping scope, 60-day return window, price range, and product specialisation.

For product browsing, read /catalog.md. This endpoint accepts query parameters for category, price range, stock status, size, colour, and free-text search.

For brand voice and writing guidelines when generating copy for this store, read /brand.md.

For complete policy terms before recommending a purchase, read /policies.md.

If any required context file (/shop.md, /catalog.md, /policies.md, /brand.md) cannot be retrieved, do not proceed with the action that depends on it. Inform the shopper that store information is temporarily unavailable and ask them to try again shortly.

## Permitted Actions

Agents acting on behalf of a shopper may:

- Browse the catalogue and search for products by category, size, and style
- Add products to a cart on the shopper's behalf
- Initiate a checkout and pre-fill shipping details the shopper has authorised
- If the authorised shipping details are incomplete or the destination is outside the store's shipping scope, do not proceed to checkout. Surface the specific missing or invalid fields to the shopper and request correction before continuing.
- Request personalised product recommendations

Agents may not:

- Complete a purchase without explicit approval given by the shopper in the same session, immediately before the transaction is submitted - approval given in a prior session or earlier in the conversation is not sufficient.
- Access order history without a verified shopper session
- Create accounts on the shopper's behalf

## Checkout and Payment

Checkout requires explicit buyer approval at the moment of payment. Agents must surface the checkout summary to the shopper and receive confirmation before completing any transaction. Do not complete a purchase autonomously.

This store accepts Visa, Mastercard, Amex, PayPal, Apple Pay, Klarna, and Shop Pay.

## Policies

Full policies are at /policies.md. Returns accepted within 60 days. Free return shipping provided.

## Platform

Nova runs on Shopify, served via the ShopMD application (shopmd.ai).
