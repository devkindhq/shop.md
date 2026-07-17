/**
 * shop-md validator — Cloudflare Worker
 *
 * Validates shop.md files against the open standard spec v0.1.
 * No npm dependencies. All parsing is done inline.
 *
 * Routes:
 *   GET  /?url=<encoded-url>   Fetch remote URL and validate
 *   POST /                     Validate raw body (text/markdown or text/plain)
 *   GET  /                     Return usage instructions
 */

// ---------------------------------------------------------------------------
// ISO 3166-1 alpha-2 country codes
// ---------------------------------------------------------------------------
const ISO_3166_1_A2 = new Set([
  'AD','AE','AF','AG','AI','AL','AM','AO','AQ','AR','AS','AT','AU','AW','AX','AZ',
  'BA','BB','BD','BE','BF','BG','BH','BI','BJ','BL','BM','BN','BO','BQ','BR','BS',
  'BT','BV','BW','BY','BZ','CA','CC','CD','CF','CG','CH','CI','CK','CL','CM','CN',
  'CO','CR','CU','CV','CW','CX','CY','CZ','DE','DJ','DK','DM','DO','DZ','EC','EE',
  'EG','EH','ER','ES','ET','FI','FJ','FK','FM','FO','FR','GA','GB','GD','GE','GF',
  'GG','GH','GI','GL','GM','GN','GP','GQ','GR','GS','GT','GU','GW','GY','HK','HM',
  'HN','HR','HT','HU','ID','IE','IL','IM','IN','IO','IQ','IR','IS','IT','JE','JM',
  'JO','JP','KE','KG','KH','KI','KM','KN','KP','KR','KW','KY','KZ','LA','LB','LC',
  'LI','LK','LR','LS','LT','LU','LV','LY','MA','MC','MD','ME','MF','MG','MH','MK',
  'ML','MM','MN','MO','MP','MQ','MR','MS','MT','MU','MV','MW','MX','MY','MZ','NA',
  'NC','NE','NF','NG','NI','NL','NO','NP','NR','NU','NZ','OM','PA','PE','PF','PG',
  'PH','PK','PL','PM','PN','PR','PS','PT','PW','PY','QA','RE','RO','RS','RU','RW',
  'SA','SB','SC','SD','SE','SG','SH','SI','SJ','SK','SL','SM','SN','SO','SR','SS',
  'ST','SV','SX','SY','SZ','TC','TD','TF','TG','TH','TJ','TK','TL','TM','TN','TO',
  'TR','TT','TV','TW','TZ','UA','UG','UM','US','UY','UZ','VA','VC','VE','VG','VI',
  'VN','VU','WF','WS','XK','YE','YT','ZA','ZM','ZW',
]);

// ---------------------------------------------------------------------------
// Minimal inline YAML frontmatter parser
// Handles: scalars, quoted strings, booleans, integers, floats, null,
//          inline arrays [a, b], block sequences, block mappings.
// Does NOT handle: multi-line scalars (|, >), anchors, aliases, tags.
// That subset is sufficient for shop.md frontmatter.
// ---------------------------------------------------------------------------

/**
 * Split a raw YAML string on top-level commas, respecting quoted strings,
 * nested brackets, and braces.
 */
function splitTopLevelCommas(str) {
  const parts = [];
  let current = '';
  let depth = 0;
  let inSingle = false;
  let inDouble = false;

  for (let i = 0; i < str.length; i++) {
    const c = str[i];
    if (inDouble) {
      current += c;
      if (c === '"' && str[i - 1] !== '\\') inDouble = false;
    } else if (inSingle) {
      current += c;
      if (c === "'") inSingle = false;
    } else if (c === '"') {
      inDouble = true;
      current += c;
    } else if (c === "'") {
      inSingle = true;
      current += c;
    } else if (c === '[' || c === '{') {
      depth++;
      current += c;
    } else if (c === ']' || c === '}') {
      depth--;
      current += c;
    } else if (c === ',' && depth === 0) {
      parts.push(current.trim());
      current = '';
    } else {
      current += c;
    }
  }
  if (current.trim() !== '') parts.push(current.trim());
  return parts;
}

/**
 * Parse a scalar YAML value from a string token.
 */
function parseScalar(raw) {
  const val = raw.trim();

  if (val === '' || val === 'null' || val === '~') return null;
  if (val === 'true') return true;
  if (val === 'false') return false;

  // Inline array
  if (val.startsWith('[') && val.endsWith(']')) {
    const inner = val.slice(1, -1).trim();
    if (inner === '') return [];
    return splitTopLevelCommas(inner).map(parseScalar);
  }

  // Double-quoted string — handle common escape sequences
  if (val.startsWith('"') && val.endsWith('"') && val.length >= 2) {
    return val
      .slice(1, -1)
      .replace(/\\n/g, '\n')
      .replace(/\\t/g, '\t')
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, '\\');
  }

  // Single-quoted string — no escape sequences in YAML single quotes
  if (val.startsWith("'") && val.endsWith("'") && val.length >= 2) {
    return val.slice(1, -1).replace(/''/g, "'");
  }

  // Integer
  if (/^-?\d+$/.test(val)) return parseInt(val, 10);

  // Float
  if (/^-?\d*\.\d+$/.test(val)) return parseFloat(val);

  // Unquoted string (strip inline comments)
  const commentIdx = val.indexOf(' #');
  if (commentIdx > 0) return val.slice(0, commentIdx).trim();

  return val;
}

/**
 * Determine the indentation depth of a line (number of leading spaces).
 */
function indent(line) {
  return line.length - line.trimStart().length;
}

/**
 * Parse a YAML document (the frontmatter block content, without the --- markers).
 * Returns a plain JS object.
 */
function parseYAML(yaml) {
  // Normalise line endings
  const rawLines = yaml.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');

  // Remove trailing empty lines
  while (rawLines.length && rawLines[rawLines.length - 1].trim() === '') {
    rawLines.pop();
  }

  return parseYAMLBlock(rawLines, 0, 0).value;
}

/**
 * Recursively parse a block (mapping or sequence) from `lines` starting at
 * `start`, where all lines in this block are at `baseIndent`.
 *
 * Returns { value, nextIndex }.
 */
function parseYAMLBlock(lines, start, baseIndent) {
  const result = {};
  let i = start;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trimStart();

    // Skip blank lines and comments
    if (trimmed === '' || trimmed.startsWith('#')) {
      i++;
      continue;
    }

    // If this line is less indented than our block, we're done
    if (indent(line) < baseIndent) break;

    // If this is a sequence item at baseIndent level, caller handles it
    if (trimmed.startsWith('- ') && indent(line) === baseIndent) break;

    // Expect a mapping key at baseIndent
    const colonIdx = trimmed.indexOf(':');
    if (colonIdx === -1) {
      // Can't parse — skip
      i++;
      continue;
    }

    const key = trimmed.slice(0, colonIdx).trim();
    const afterColon = trimmed.slice(colonIdx + 1);
    const inlineValue = afterColon.trim();

    // Check if there's inline content after the colon
    if (inlineValue !== '' && !inlineValue.startsWith('#')) {
      // Inline value on same line
      result[key] = parseScalar(inlineValue);
      i++;
      continue;
    }

    // No inline value: look ahead for block content
    i++;

    // Collect continuation lines that are more indented than baseIndent
    let childIndent = -1;
    let j = i;

    // Scan for the first non-blank, non-comment child line to determine child indent
    while (j < lines.length) {
      const cl = lines[j];
      const ct = cl.trimStart();
      if (ct === '' || ct.startsWith('#')) {
        j++;
        continue;
      }
      if (indent(cl) > baseIndent) {
        childIndent = indent(cl);
        break;
      }
      break;
    }

    if (childIndent === -1) {
      // No children found; value is null
      result[key] = null;
      continue;
    }

    // Determine if child block is a sequence or mapping
    const firstChildTrimmed = lines[j].trimStart();
    if (firstChildTrimmed.startsWith('- ')) {
      // Block sequence
      const items = [];
      while (i < lines.length) {
        const cl = lines[i];
        const ct = cl.trimStart();
        if (ct === '' || ct.startsWith('#')) {
          i++;
          continue;
        }
        if (indent(cl) < childIndent) break;
        if (ct.startsWith('- ')) {
          const itemVal = ct.slice(2).trim();
          if (itemVal === '' || itemVal.startsWith('#')) {
            // Complex item (nested mapping) — skip for shop.md use case
            items.push(null);
          } else {
            items.push(parseScalar(itemVal));
          }
        }
        i++;
      }
      result[key] = items;
    } else {
      // Block mapping (nested object)
      const { value, nextIndex } = parseYAMLBlock(lines, i, childIndent);
      result[key] = value;
      i = nextIndex;
    }
  }

  return { value: result, nextIndex: i };
}

/**
 * Extract and parse the YAML frontmatter from a shop.md string.
 * Returns { frontmatter, body, parseError }.
 */
function parseFrontmatter(content) {
  // Normalise line endings for the regex
  const normalised = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // The file must start with --- (optional leading whitespace on line is not
  // valid YAML frontmatter but we accept it defensively)
  const fmMatch = normalised.match(/^-{3}\n([\s\S]*?)\n-{3}(?:\n|$)/);
  if (!fmMatch) {
    return { frontmatter: null, body: normalised, parseError: null };
  }

  const yamlBlock = fmMatch[1];
  const body = normalised.slice(fmMatch[0].length);

  try {
    const frontmatter = parseYAML(yamlBlock);
    return { frontmatter, body, parseError: null };
  } catch (err) {
    return {
      frontmatter: null,
      body,
      parseError: err instanceof Error ? err.message : String(err),
    };
  }
}

// ---------------------------------------------------------------------------
// Markdown prose section parser
// ---------------------------------------------------------------------------

/**
 * Parse ## headings from the body and extract per-section content.
 * Returns an array of { heading, content } objects, in order.
 */
function parseSections(body) {
  const lines = body.split('\n');
  const sections = [];
  let currentHeading = null;
  let currentLines = [];

  for (const line of lines) {
    const h2Match = line.match(/^##\s+(.+)/);
    if (h2Match) {
      if (currentHeading !== null) {
        sections.push({ heading: currentHeading, content: currentLines.join('\n').trim() });
      }
      currentHeading = h2Match[1].trim();
      currentLines = [];
    } else if (currentHeading !== null) {
      currentLines.push(line);
    }
  }

  if (currentHeading !== null) {
    sections.push({ heading: currentHeading, content: currentLines.join('\n').trim() });
  }

  return sections;
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

const REQUIRED_FIELDS = ['shop', 'domain', 'format', 'version'];

const RECOMMENDED_FIELDS = [
  'ships_to',
  'return_window_days',
  'price_range',
  'categories',
  'payment_methods',
  'guest_checkout',
  'ships_from',
  'condition',
  'age_verification',
  'ucp_enabled',
];

const REQUIRED_SECTIONS = ['Overview', 'Context Files'];
const RECOMMENDED_SECTIONS = ["Who It's For", 'Why Buy Here', 'Commerce'];

const VALID_PRICE_RANGES = ['budget', 'mid', 'premium', 'luxury'];
const VALID_CONDITIONS = ['new', 'refurbished', 'secondhand', 'open_box'];
const VALID_REG_CATS = [
  'alcohol',
  'tobacco',
  'cannabis',
  'medications',
  'weapons',
  'adult_content',
];

/**
 * Semver-ish pattern: 1, 1.0, 1.0.0, 1.0.0-alpha.1, 1.0.0+build.1, etc.
 * Also accepts bare integers (major only).
 */
const SEMVER_RE = /^\d+(\.\d+){0,2}(-[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)*)?(\+[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)*)?$/;

/**
 * Compute score 0-100 based on completeness of recommended fields and prose.
 *
 * Weighting:
 *   50 pts — recommended frontmatter fields (5 pts each × 10 fields)
 *   30 pts — recommended prose sections (10 pts each × 3 sections)
 *   20 pts — required prose section quality
 *              10 pts: Overview ≥ 50 chars
 *              10 pts: Context Files has at least one file entry
 */
function computeScore(frontmatter, sections, errors) {
  // If there are hard required-field errors we cap at 0
  const hasRequiredFieldError = errors.some(
    (e) => REQUIRED_FIELDS.includes(e.field) && e.severity === 'error',
  );
  if (hasRequiredFieldError) return 0;

  let score = 0;

  // Recommended frontmatter fields (5 pts each)
  for (const field of RECOMMENDED_FIELDS) {
    if (frontmatter[field] !== undefined && frontmatter[field] !== null) {
      score += 5;
    }
  }

  // Recommended prose sections (10 pts each)
  const sectionMap = new Map(sections.map((s) => [s.heading, s]));
  for (const sec of RECOMMENDED_SECTIONS) {
    const s = sectionMap.get(sec);
    if (s && s.content.trim().length > 0) score += 10;
  }

  // Required prose section quality (10 pts each)
  const overview = sectionMap.get('Overview');
  if (overview && overview.content.trim().length >= 50) score += 10;

  const ctxFiles = sectionMap.get('Context Files');
  if (ctxFiles) {
    const hasEntry = /^-\s+\S/m.test(ctxFiles.content);
    if (hasEntry) score += 10;
  }

  return Math.min(100, score);
}

/**
 * Main validation function. Returns the structured result object.
 */
function validate(content) {
  /** @type {{ field: string, message: string, severity: 'error' }[]} */
  const errors = [];
  /** @type {{ field: string, message: string, severity: 'warning' }[]} */
  const warnings = [];

  // ---- Frontmatter parsing -----------------------------------------------

  const { frontmatter, body, parseError } = parseFrontmatter(content);

  if (parseError) {
    errors.push({
      field: 'frontmatter',
      message: `YAML parse error: ${parseError}`,
      severity: 'error',
    });
    return { valid: false, score: 0, errors, warnings, parsed: { frontmatter: null, sections: [] } };
  }

  if (!frontmatter) {
    errors.push({
      field: 'frontmatter',
      message:
        'No YAML frontmatter block found. The file must start with a --- delimited YAML block.',
      severity: 'error',
    });
    return { valid: false, score: 0, errors, warnings, parsed: { frontmatter: null, sections: [] } };
  }

  // ---- Required fields ----------------------------------------------------

  for (const field of REQUIRED_FIELDS) {
    const val = frontmatter[field];
    if (val === undefined || val === null || val === '') {
      errors.push({
        field,
        message: `Required field "${field}" is missing or empty.`,
        severity: 'error',
      });
    }
  }

  // ---- Field-specific validation ------------------------------------------

  // domain: no protocol, no trailing slash
  if (frontmatter.domain != null) {
    const domain = String(frontmatter.domain);
    if (domain.includes('://')) {
      errors.push({
        field: 'domain',
        message: `domain must not include a protocol. Remove "https://" or "http://" (got "${domain}").`,
        severity: 'error',
      });
    }
    if (domain.endsWith('/')) {
      errors.push({
        field: 'domain',
        message: `domain must not end with a trailing slash (got "${domain}").`,
        severity: 'error',
      });
    }
    if (domain.includes(' ')) {
      errors.push({
        field: 'domain',
        message: `domain must not contain spaces (got "${domain}").`,
        severity: 'error',
      });
    }
  }

  // format: must equal exactly "shop.md"
  if (frontmatter.format !== undefined && frontmatter.format !== null) {
    if (frontmatter.format !== 'shop.md') {
      errors.push({
        field: 'format',
        message: `format must equal exactly "shop.md" (got "${frontmatter.format}").`,
        severity: 'error',
      });
    }
  }

  // version: semver-ish
  if (frontmatter.version !== undefined && frontmatter.version !== null) {
    const version = String(frontmatter.version);
    if (!SEMVER_RE.test(version)) {
      errors.push({
        field: 'version',
        message: `version "${version}" does not match a semver pattern. Expected e.g. "1.0", "1.0.0", "2.1.3".`,
        severity: 'error',
      });
    }
  }

  // ships_to: array of ISO 3166-1 alpha-2, or the string "*"
  if (frontmatter.ships_to !== undefined && frontmatter.ships_to !== null) {
    const st = frontmatter.ships_to;
    if (st === '*' || st === 'worldwide') {
      // valid wildcard
    } else if (!Array.isArray(st)) {
      errors.push({
        field: 'ships_to',
        message: 'ships_to must be an array of ISO 3166-1 alpha-2 country codes or the string "*".',
        severity: 'error',
      });
    } else {
      for (const code of st) {
        const c = String(code).toUpperCase().trim();
        if (!/^[A-Z]{2}$/.test(c) || !ISO_3166_1_A2.has(c)) {
          errors.push({
            field: 'ships_to',
            message: `"${code}" is not a recognised ISO 3166-1 alpha-2 country code.`,
            severity: 'error',
          });
        }
      }
    }
  }

  // ships_from: single ISO 3166-1 alpha-2
  if (frontmatter.ships_from !== undefined && frontmatter.ships_from !== null) {
    const sf = String(frontmatter.ships_from).toUpperCase().trim();
    if (!/^[A-Z]{2}$/.test(sf) || !ISO_3166_1_A2.has(sf)) {
      errors.push({
        field: 'ships_from',
        message: `ships_from "${frontmatter.ships_from}" is not a recognised ISO 3166-1 alpha-2 country code.`,
        severity: 'error',
      });
    }
  }

  // price_range: enum
  if (frontmatter.price_range !== undefined && frontmatter.price_range !== null) {
    if (!VALID_PRICE_RANGES.includes(frontmatter.price_range)) {
      errors.push({
        field: 'price_range',
        message: `price_range must be one of: ${VALID_PRICE_RANGES.join(', ')} (got "${frontmatter.price_range}").`,
        severity: 'error',
      });
    }
  }

  // categories: non-empty array if present
  if (frontmatter.categories !== undefined && frontmatter.categories !== null) {
    if (!Array.isArray(frontmatter.categories) || frontmatter.categories.length === 0) {
      errors.push({
        field: 'categories',
        message: 'categories must be a non-empty array of strings.',
        severity: 'error',
      });
    }
  }

  // condition: values from allowed set
  if (frontmatter.condition !== undefined && frontmatter.condition !== null) {
    if (!Array.isArray(frontmatter.condition)) {
      errors.push({
        field: 'condition',
        message: 'condition must be an array.',
        severity: 'error',
      });
    } else {
      for (const c of frontmatter.condition) {
        if (!VALID_CONDITIONS.includes(c)) {
          errors.push({
            field: 'condition',
            message: `"${c}" is not a valid condition value. Allowed: ${VALID_CONDITIONS.join(', ')}.`,
            severity: 'error',
          });
        }
      }
    }
  }

  // regulated_categories: values from allowed set
  if (frontmatter.regulated_categories !== undefined && frontmatter.regulated_categories !== null) {
    if (!Array.isArray(frontmatter.regulated_categories)) {
      errors.push({
        field: 'regulated_categories',
        message: 'regulated_categories must be an array.',
        severity: 'error',
      });
    } else {
      for (const c of frontmatter.regulated_categories) {
        if (!VALID_REG_CATS.includes(c)) {
          errors.push({
            field: 'regulated_categories',
            message: `"${c}" is not a valid regulated_categories value. Allowed: ${VALID_REG_CATS.join(', ')}.`,
            severity: 'error',
          });
        }
      }
    }
  }

  // free_shipping_threshold: object with amount (number) and currency (3-letter)
  if (
    frontmatter.free_shipping_threshold !== undefined &&
    frontmatter.free_shipping_threshold !== null
  ) {
    const fst = frontmatter.free_shipping_threshold;
    if (typeof fst !== 'object' || Array.isArray(fst)) {
      errors.push({
        field: 'free_shipping_threshold',
        message:
          'free_shipping_threshold must be an object with "amount" (number) and "currency" (ISO 4217) fields.',
        severity: 'error',
      });
    } else {
      if (typeof fst.amount !== 'number' || fst.amount < 0) {
        errors.push({
          field: 'free_shipping_threshold.amount',
          message: 'free_shipping_threshold.amount must be a non-negative number.',
          severity: 'error',
        });
      }
      if (!fst.currency || !/^[A-Za-z]{3}$/.test(String(fst.currency))) {
        errors.push({
          field: 'free_shipping_threshold.currency',
          message:
            'free_shipping_threshold.currency must be a 3-letter ISO 4217 currency code (e.g. "USD", "AUD").',
          severity: 'error',
        });
      }
    }
  }

  // return_window_days: positive integer or null
  if (
    frontmatter.return_window_days !== undefined &&
    frontmatter.return_window_days !== null
  ) {
    const rwd = frontmatter.return_window_days;
    if (!Number.isInteger(rwd) || rwd < 0) {
      errors.push({
        field: 'return_window_days',
        message:
          'return_window_days must be a non-negative integer (or null if the store does not accept returns).',
        severity: 'error',
      });
    }
  }

  // age_verification: boolean
  if (frontmatter.age_verification !== undefined && frontmatter.age_verification !== null) {
    if (typeof frontmatter.age_verification !== 'boolean') {
      errors.push({
        field: 'age_verification',
        message: 'age_verification must be a boolean (true or false).',
        severity: 'error',
      });
    }
  }

  // guest_checkout: boolean
  if (frontmatter.guest_checkout !== undefined && frontmatter.guest_checkout !== null) {
    if (typeof frontmatter.guest_checkout !== 'boolean') {
      errors.push({
        field: 'guest_checkout',
        message: 'guest_checkout must be a boolean (true or false).',
        severity: 'error',
      });
    }
  }

  // ucp_enabled: boolean
  if (frontmatter.ucp_enabled !== undefined && frontmatter.ucp_enabled !== null) {
    if (typeof frontmatter.ucp_enabled !== 'boolean') {
      errors.push({
        field: 'ucp_enabled',
        message: 'ucp_enabled must be a boolean (true or false).',
        severity: 'error',
      });
    }
  }

  // ---- Recommended fields warnings ----------------------------------------

  for (const field of RECOMMENDED_FIELDS) {
    if (frontmatter[field] === undefined) {
      warnings.push({
        field,
        message: `Recommended field "${field}" is missing. Adding it improves agent matching.`,
        severity: 'warning',
      });
    }
  }

  // ---- Prose section validation --------------------------------------------

  const sections = parseSections(body);
  const sectionMap = new Map(sections.map((s) => [s.heading, s]));
  const sectionNames = sections.map((s) => s.heading);

  // Required sections must be present
  for (const sec of REQUIRED_SECTIONS) {
    if (!sectionMap.has(sec)) {
      errors.push({
        field: `section:${sec}`,
        message: `Required section "## ${sec}" is missing.`,
        severity: 'error',
      });
    }
  }

  // Overview: non-empty paragraph of at least 50 chars
  const overviewSection = sectionMap.get('Overview');
  if (overviewSection) {
    const len = overviewSection.content.trim().length;
    if (len < 50) {
      errors.push({
        field: 'section:Overview',
        message: `Overview section must be a non-empty paragraph of at least 50 characters (found ${len} chars).`,
        severity: 'error',
      });
    }
  }

  // Context Files: must list at least one file
  const contextSection = sectionMap.get('Context Files');
  if (contextSection) {
    const hasEntry = /^-\s+\S/m.test(contextSection.content);
    if (!hasEntry) {
      errors.push({
        field: 'section:Context Files',
        message:
          'Context Files section must list at least one file using a markdown list item (e.g. "- `/catalog.md`: description").',
        severity: 'error',
      });
    }
  }

  // Recommended sections
  for (const sec of RECOMMENDED_SECTIONS) {
    if (!sectionMap.has(sec)) {
      warnings.push({
        field: `section:${sec}`,
        message: `Recommended section "## ${sec}" is missing. Agents use this section to qualify the store for shoppers.`,
        severity: 'warning',
      });
    }
  }

  // Sections that are present but thin (< 100 chars)
  for (const sec of sections) {
    const len = sec.content.trim().length;
    if (len > 0 && len < 100) {
      warnings.push({
        field: `section:${sec.heading}`,
        message: `Section "## ${sec.heading}" is only ${len} characters. Sections shorter than 100 characters may not give agents enough context.`,
        severity: 'warning',
      });
    }
  }

  // ---- Cross-field checks -------------------------------------------------

  // Warn if domain in frontmatter does not appear anywhere in the body prose,
  // and the body contains a different URL/domain that looks canonical.
  if (frontmatter.domain != null) {
    const domainStr = String(frontmatter.domain).toLowerCase();
    // Extract bare domain-like strings from URLs in the body
    const urlPattern = /https?:\/\/([a-z0-9.-]+)/gi;
    const domainMentions = new Set();
    let urlMatch;
    while ((urlMatch = urlPattern.exec(body)) !== null) {
      domainMentions.add(urlMatch[1].toLowerCase().replace(/^www\./, ''));
    }
    // Also check for domain.tld patterns without protocol
    const barePattern = /\b([a-z0-9-]+\.[a-z]{2,}(?:\.[a-z]{2,})?)\b/gi;
    while ((urlMatch = barePattern.exec(body)) !== null) {
      const candidate = urlMatch[1].toLowerCase();
      // Only consider if it looks like a real domain (has a reasonable TLD)
      if (/\.(com|org|net|io|co|shop|store|ai|app|dev|au|uk|nz|ca|de|fr)(\b|$)/i.test(candidate)) {
        domainMentions.add(candidate.replace(/^www\./, ''));
      }
    }

    const normalisedFmDomain = domainStr.replace(/^www\./, '');
    const mismatches = [...domainMentions].filter(
      (d) => d !== normalisedFmDomain && d.length > 4,
    );

    if (mismatches.length > 0 && !domainMentions.has(normalisedFmDomain)) {
      warnings.push({
        field: 'domain',
        message: `Domain "${frontmatter.domain}" in frontmatter does not appear in the prose body. Body references: ${mismatches.slice(0, 3).join(', ')}.`,
        severity: 'warning',
      });
    }
  }

  // ---- Score and result ---------------------------------------------------

  const score = computeScore(frontmatter, sections, errors);

  return {
    valid: errors.length === 0,
    score,
    errors,
    warnings,
    parsed: {
      frontmatter,
      sections: sectionNames,
    },
  };
}

// ---------------------------------------------------------------------------
// CORS and response helpers
// ---------------------------------------------------------------------------

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
    },
  });
}

function errorResponse(message, status = 400) {
  return jsonResponse({ error: message }, status);
}

const USAGE = {
  name: 'shop-md validator',
  version: '0.1.0',
  spec: 'https://shopmd.org',
  usage: {
    'POST /': {
      description: 'Validate a shop.md file supplied as the request body.',
      'content-type': 'text/plain or text/markdown',
      example: 'curl -X POST https://validator.shopmd.org/ --data-binary @shop.md',
    },
    'GET /?url=<encoded-url>': {
      description: 'Fetch a remote shop.md file and validate it.',
      example: 'curl "https://validator.shopmd.org/?url=https%3A%2F%2Fexample.com%2Fshop.md"',
      timeout: '5 seconds',
    },
  },
};

// ---------------------------------------------------------------------------
// Worker entry point
// ---------------------------------------------------------------------------

export default {
  async fetch(request) {
    const url = new URL(request.url);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    // GET with ?url= param: fetch remote file and validate
    if (request.method === 'GET' && url.searchParams.has('url')) {
      const targetUrl = url.searchParams.get('url');

      if (!targetUrl) {
        return errorResponse('url parameter is empty.');
      }

      let parsedUrl;
      try {
        parsedUrl = new URL(targetUrl);
      } catch {
        return errorResponse(`Invalid URL: "${targetUrl}"`);
      }

      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        return errorResponse('Only http:// and https:// URLs are supported.');
      }

      let content;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const res = await fetch(parsedUrl.toString(), {
          signal: controller.signal,
          headers: { 'User-Agent': 'shopmd-validator/0.1 (https://shopmd.org)' },
        });
        clearTimeout(timeoutId);

        if (!res.ok) {
          return errorResponse(
            `Remote server returned HTTP ${res.status} for "${targetUrl}".`,
            502,
          );
        }

        content = await res.text();
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return errorResponse(
            `Request to "${targetUrl}" timed out after 5 seconds.`,
            504,
          );
        }
        return errorResponse(
          `Failed to fetch "${targetUrl}": ${err instanceof Error ? err.message : String(err)}`,
          502,
        );
      }

      const result = validate(content);
      result.source = targetUrl;
      return jsonResponse(result);
    }

    // POST: validate raw body
    if (request.method === 'POST') {
      let content;
      try {
        content = await request.text();
      } catch (err) {
        return errorResponse('Failed to read request body.');
      }

      if (!content || content.trim() === '') {
        return errorResponse(
          'Request body is empty. Send the shop.md file content as the POST body.',
        );
      }

      const result = validate(content);
      return jsonResponse(result);
    }

    // GET without ?url=: return usage instructions
    if (request.method === 'GET') {
      return jsonResponse(USAGE, 404);
    }

    return errorResponse('Method not allowed. Use GET (with ?url=) or POST.', 405);
  },
};
