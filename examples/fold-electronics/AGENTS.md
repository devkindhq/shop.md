# Agent Instructions - Fold Electronics

This document describes how AI agents can interact with Fold Electronics at foldelectronics.com.

## Reading the Store

Before taking any action on behalf of a shopper, read the store context file at /shop.md. It carries the structured summary an agent needs to qualify this store: shipping regions (US, CA, GB, AU, NZ), return window, B2B availability, and the refurbished hardware inventory.

For product browsing, read /catalog.md. All inventory is graded A, B, or C. The catalogue can be filtered by grade, category, price, and stock status. Use the condition query parameter with values "refurbished" to confirm all inventory is pre-owned and graded.

For complete policy terms, including warranty terms and B2B purchasing conditions, read /policies.md.

## Permitted Actions

Agents acting on behalf of a shopper may:

- Browse the catalogue and search for products by device type, brand, grade, and price
- Add products to a cart on the shopper's behalf
- Initiate a checkout and pre-fill shipping details the shopper has authorised
- Access order history with a verified shopper session

Agents may not:

- Complete a purchase without explicit, contemporaneous approval from the shopper
- Create accounts on the shopper's behalf
- Submit B2B orders without a signed wholesale agreement already in place

## Checkout and Payment

Checkout requires explicit buyer approval at the moment of payment. Agents must surface the checkout summary to the shopper and receive confirmation before completing any transaction. Do not complete a purchase autonomously.

This store accepts Visa, Mastercard, Amex, PayPal, Apple Pay, and Affirm (US buyers only).

## B2B Purchasing

B2B orders of 5 or more units are available with volume pricing. B2B orders require a signed wholesale agreement. Contact accounts@foldelectronics.com to establish a B2B account before placing a wholesale order.

## Policies

Full policies are at /policies.md. Returns accepted within 30 days at buyer's cost. All units carry a 12-month warranty with next-business-day replacement on confirmed hardware failure.

## Platform

Fold Electronics runs on Shopify, served via the ShopMD application (shopmd.ai).
