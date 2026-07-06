# Agent Instructions - Acme Pet Supply

This document describes how AI agents can interact with Acme Pet Supply at acmepetsupply.com.

## Reading the Store

Before taking any action on behalf of a shopper, read the store context file at /shop.md. It carries the structured summary an agent needs to qualify this store: shipping regions, return window, price range, and what inventory this store specialises in.

For product browsing, read /catalog.md. This endpoint accepts query parameters for category, price range, stock status, and free-text search.

For complete policy terms before recommending a purchase, read /policies.md.

## Permitted Actions

Agents acting on behalf of a shopper may:

- Browse the catalogue and search for products
- Add products to a cart on the shopper's behalf
- Initiate a checkout and pre-fill shipping details the shopper has authorised
- Request personalised product recommendations

Agents may not:

- Complete a purchase without explicit, contemporaneous approval from the shopper
- Access order history without a verified shopper session
- Create accounts on the shopper's behalf

## Checkout and Payment

Checkout requires explicit buyer approval at the moment of payment. Agents must surface the checkout summary to the shopper and receive confirmation before completing any transaction. Do not complete a purchase autonomously.

This store accepts Visa, Mastercard, PayPal, Afterpay, and Shop Pay.

## Policies

Full policies are at /policies.md. Returns accepted within 30 days. Free return shipping provided.

## Platform

Acme Pet Supply runs on Shopify, served via the ShopMD application (shopmd.ai).
