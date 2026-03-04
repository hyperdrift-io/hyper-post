import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * Parsed GROWTH.md config (YAML frontmatter).
 * All fields are optional for graceful degradation.
 */
export interface GrowthConfig {
  app: string;
  url: string;
  primary_channel?: string;
  intent_keywords?: string[];
  subreddits?: string[];
  telegram_targets?: string[];
  hn_hook?: string;
  influencer_targets?: Array<{
    category: string;
    min_subs: number;
    max_subs: number;
    model: string;
  }>;
  directories_tier1?: string[];
  directories_tier2?: string[];
  aeo_target_questions?: string[];
  awesome_list_targets?: string[];
  cadence?: {
    trigger_events?: string[];
    channels_per_event?: string[];
  };
}

/**
 * Load and parse the YAML frontmatter from an app's GROWTH.md.
 * Falls back gracefully if the file is missing or malformed.
 */
export function loadGrowthConfig(appDir: string): GrowthConfig | null {
  const growthPath = join(appDir, 'GROWTH.md');

  if (!existsSync(growthPath)) {
    return null;
  }

  const content = readFileSync(growthPath, 'utf-8');

  // Extract YAML frontmatter between --- delimiters
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) {
    return null;
  }

  try {
    // Simple YAML parser for the subset of YAML we use (no deps required)
    const yaml = frontmatterMatch[1];
    return parseSimpleYaml(yaml) as unknown as GrowthConfig;
  } catch {
    console.error(`Failed to parse GROWTH.md frontmatter in ${appDir}`);
    return null;
  }
}

/**
 * Minimal YAML parser sufficient for GROWTH.md frontmatter.
 * Handles: strings, arrays, nested objects, multiline arrays.
 */
function parseSimpleYaml(yaml: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const lines = yaml.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Skip comments and empty lines
    if (!line.trim() || line.trim().startsWith('#')) {
      i++;
      continue;
    }

    const keyMatch = line.match(/^(\w[\w-]*)\s*:\s*(.*)/);
    if (!keyMatch) {
      i++;
      continue;
    }

    const key = keyMatch[1];
    const rawValue = keyMatch[2].trim();

    if (rawValue === '' || rawValue === '[]') {
      // Might be a block array or empty
      const items: unknown[] = [];
      i++;
      while (i < lines.length && lines[i].match(/^\s+-\s/)) {
        const itemMatch = lines[i].match(/^\s+-\s+(.*)/);
        if (itemMatch) {
          const itemValue = itemMatch[1].trim();
          // Try parsing as nested object
          if (itemValue === '') {
            // Multi-line object item — collect until next top-level item
            const obj: Record<string, unknown> = {};
            i++;
            while (i < lines.length && lines[i].match(/^\s{2,}\w/)) {
              const nestedMatch = lines[i].match(/^\s+(\w[\w-]*)\s*:\s*(.*)/);
              if (nestedMatch) {
                obj[nestedMatch[1]] = parseScalar(nestedMatch[2].trim());
              }
              i++;
            }
            items.push(obj);
          } else {
            items.push(parseScalar(itemValue));
          }
        } else {
          i++;
        }
      }
      result[key] = rawValue === '[]' ? [] : items;
    } else if (rawValue.startsWith('[')) {
      // Inline array
      const inner = rawValue.slice(1, rawValue.lastIndexOf(']'));
      result[key] = inner.split(',').map(s => parseScalar(s.trim())).filter(Boolean);
      i++;
    } else {
      result[key] = parseScalar(rawValue);
      i++;
    }
  }

  return result;
}

function parseScalar(value: string): unknown {
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (value === 'null' || value === '~') return null;
  const num = Number(value);
  if (!isNaN(num) && value !== '') return num;
  // Strip quotes
  if ((value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  return value;
}
