#!/usr/bin/env python3
"""
SHOP.md validator -- checks a shop.md file against the v1.0 spec.
Usage: python validate.py <path-to-shop.md>
Spec: https://shopmd.org
"""

import sys
import re
import yaml

REQUIRED_FIELDS = ["shop", "domain", "format", "version"]

RECOMMENDED_FIELDS = [
    "language", "currencies", "ships_to", "ships_from",
    "return_window_days", "free_returns", "price_range",
    "categories", "payment_methods",
]

REQUIRED_SECTIONS = [
    "Overview",
    "Who It's For",
    "Why Buy Here",
    "Commerce",
    "Context Files",
]

VALID_PRICE_RANGES = ["budget", "mid", "premium", "luxury"]


def parse_frontmatter(content):
    match = re.match(r"^---\n(.*?)\n---\n", content, re.DOTALL)
    if not match:
        return None, content
    try:
        data = yaml.safe_load(match.group(1))
    except yaml.YAMLError as exc:
        return {"_parse_error": str(exc)}, content[match.end():]
    return data, content[match.end():]


def validate(filepath):
    errors = []
    warnings = []

    try:
        with open(filepath, encoding="utf-8") as f:
            content = f.read()
    except FileNotFoundError:
        return [f"File not found: {filepath}"], []

    frontmatter, body = parse_frontmatter(content)

    if frontmatter is None:
        errors.append("No YAML frontmatter block found (expected --- at top of file)")
        return errors, warnings

    if "_parse_error" in frontmatter:
        errors.append(f"YAML parse error: {frontmatter['_parse_error']}")
        return errors, warnings

    for field in REQUIRED_FIELDS:
        if field not in frontmatter:
            errors.append(f"Missing required field: '{field}'")

    if frontmatter.get("format") != "shop.md":
        errors.append(
            f"'format' must be exactly 'shop.md', got: '{frontmatter.get('format')}'"
        )

    for field in RECOMMENDED_FIELDS:
        if field not in frontmatter:
            warnings.append(f"Missing recommended field: '{field}'")

    if "price_range" in frontmatter:
        if frontmatter["price_range"] not in VALID_PRICE_RANGES:
            errors.append(
                f"'price_range' must be one of: {', '.join(VALID_PRICE_RANGES)}. "
                f"Got: '{frontmatter['price_range']}'"
            )

    fst = frontmatter.get("free_shipping_threshold")
    if fst is not None and isinstance(fst, dict):
        if "amount" not in fst:
            errors.append("'free_shipping_threshold' is missing 'amount'")
        if "currency" not in fst:
            errors.append("'free_shipping_threshold' is missing 'currency'")

    ships_to = frontmatter.get("ships_to")
    if ships_to is not None:
        if ships_to != "*" and not isinstance(ships_to, list):
            errors.append(
                "'ships_to' must be a list of ISO 3166-1 alpha-2 country codes "
                "or the string \"*\" for worldwide"
            )

    for section in REQUIRED_SECTIONS:
        pattern = rf"^##\s+{re.escape(section)}\s*$"
        if not re.search(pattern, body, re.MULTILINE):
            warnings.append(f"Missing recommended prose section: '## {section}'")

    return errors, warnings


def main():
    if len(sys.argv) != 2:
        print("Usage: python validate.py <path-to-shop.md>")
        print("Spec:  https://shopmd.org")
        sys.exit(1)

    filepath = sys.argv[1]
    errors, warnings = validate(filepath)

    if warnings:
        print("WARNINGS:")
        for w in warnings:
            print(f"  ! {w}")
        print()

    if errors:
        print("ERRORS:")
        for e in errors:
            print(f"  x {e}")
        print()
        print(f"Invalid SHOP.md: {len(errors)} error(s), {len(warnings)} warning(s)")
        sys.exit(1)
    elif warnings:
        print(f"Valid SHOP.md with {len(warnings)} warning(s).")
    else:
        print("Valid SHOP.md.")


if __name__ == "__main__":
    main()
