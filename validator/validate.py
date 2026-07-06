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
    "return_window_days", "free_returns", "free_shipping_threshold",
    "price_range", "categories", "condition", "regulated_categories",
    "age_verification", "payment_methods", "guest_checkout", "ucp_enabled",
    "agent_capabilities", "b2b", "established",
]

REQUIRED_SECTIONS = [
    "Overview",
    "Who It's For",
    "Why Buy Here",
    "Commerce",
    "Context Files",
]

VALID_PRICE_RANGES = ["budget", "mid", "premium", "luxury"]

VALID_CONDITIONS = ["new", "refurbished", "secondhand", "open_box"]

VALID_REGULATED_CATEGORIES = [
    "alcohol", "tobacco", "cannabis", "medications", "weapons", "adult_content"
]

VALID_AGENT_CAPABILITIES = [
    "browse", "cart", "checkout", "account", "wishlist", "recommendations"
]

BOOLEAN_FIELDS = [
    "free_returns", "age_verification", "guest_checkout", "ucp_enabled", "b2b"
]

INTEGER_FIELDS = ["return_window_days", "established"]


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
                "or the string \"*\""
            )

    # condition: array of valid enum values
    condition = frontmatter.get("condition")
    if condition is not None:
        if not isinstance(condition, list):
            errors.append("'condition' must be an array")
        else:
            invalid = [c for c in condition if c not in VALID_CONDITIONS]
            if invalid:
                errors.append(
                    f"'condition' contains invalid values: {invalid}. "
                    f"Must be one of: {', '.join(VALID_CONDITIONS)}"
                )

    # regulated_categories: array of valid enum values
    regulated = frontmatter.get("regulated_categories")
    if regulated is not None:
        if not isinstance(regulated, list):
            errors.append("'regulated_categories' must be an array")
        else:
            invalid = [c for c in regulated if c not in VALID_REGULATED_CATEGORIES]
            if invalid:
                errors.append(
                    f"'regulated_categories' contains invalid values: {invalid}. "
                    f"Must be one of: {', '.join(VALID_REGULATED_CATEGORIES)}"
                )

    # agent_capabilities: array of valid enum values
    agent_caps = frontmatter.get("agent_capabilities")
    if agent_caps is not None:
        if not isinstance(agent_caps, list):
            errors.append("'agent_capabilities' must be an array")
        else:
            invalid = [c for c in agent_caps if c not in VALID_AGENT_CAPABILITIES]
            if invalid:
                errors.append(
                    f"'agent_capabilities' contains invalid values: {invalid}. "
                    f"Must be one of: {', '.join(VALID_AGENT_CAPABILITIES)}"
                )

    # boolean fields
    for field in BOOLEAN_FIELDS:
        val = frontmatter.get(field)
        if val is not None and not isinstance(val, bool):
            errors.append(f"'{field}' must be a boolean (true or false), got: {repr(val)}")

    # integer fields
    for field in INTEGER_FIELDS:
        val = frontmatter.get(field)
        if val is not None and not isinstance(val, int):
            errors.append(f"'{field}' must be an integer, got: {repr(val)}")

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
