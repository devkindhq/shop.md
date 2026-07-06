# SHOP.md Validator

A command-line tool that checks a shop.md file against the v1.0 spec.

## Requirements

Python 3.8 or higher. PyYAML:

    pip install pyyaml

## Usage

    python validate.py path/to/shop.md

## Output

Errors are spec violations that make the file invalid.
Warnings are missing recommended fields or sections.

    WARNINGS:
      ! Missing recommended field: 'categories'

    Valid SHOP.md with 1 warning(s).

Exit code 0 = valid (warnings are acceptable).
Exit code 1 = invalid (at least one error).

## What it checks

Required fields: shop, domain, format, version
Required format value: format must be exactly shop.md
Recommended fields: language, currencies, ships_to, ships_from,
  return_window_days, free_returns, price_range, categories, payment_methods
price_range values: budget, mid, premium, or luxury
free_shipping_threshold structure: must have amount and currency keys
ships_to: list of ISO 3166-1 alpha-2 codes or the string "*" for worldwide
Prose sections: Overview, Who It's For, Why Buy Here, Commerce, Context Files

## Spec

Full specification at shopmd.org
