/**
 * Arabic to French mapping for common artisan search terms.
 */
export const ARABIC_MAPPING: Record<string, string> = {
  "بلومبي": "plombier",
  "بلومبيا": "plombier",
  "plombir": "plombier",
  "bloumbi": "plombier",
  "الكتريسيان": "électricien",
  "الكتريسيان": "electricien",
  "electricien": "électricien",
  "najjar": "menuisier",
  "نجار": "menuisier",
  "sabbagh": "peintre",
  "صباغ": "peintre",
  "haddad": "forgeron",
  "حداد": "forgeron",
  "bannay": "maçon",
  "بناي": "maçon",
  "guebbas": "plâtrier",
  "جباص": "plâtrier",
  "mecanic": "mécanicien",
  "ميكانيك": "mécanicien",
  "tapis": "tissage de tapis",
  "zellij": "zellij",
  "زليج": "zellij",
};

/**
 * Common misspellings for Moroccan craft terms.
 */
export const AUTO_CORRECT_MAP: Record<string, string> = {
  "plombir": "plombier",
  "plonbier": "plombier",
  "electritian": "électricien",
  "electrician": "électricien",
  "menuisier": "menuisier",
  "menuisier": "menuisier",
  "peinte": "peintre",
  "pinttre": "peintre",
  "forgeron": "forgeron",
  "macon": "maçon",
  "platrier": "plâtrier",
  "mecanicien": "mécanicien",
};

export function normalizeQuery(query: string): string {
  const q = query.toLowerCase().trim();
  
  // 1. Check Arabic Mapping
  if (ARABIC_MAPPING[q]) {
    return ARABIC_MAPPING[q];
  }

  // 2. Check Auto-correct Map
  if (AUTO_CORRECT_MAP[q]) {
    return AUTO_CORRECT_MAP[q];
  }

  return q;
}

/**
 * Simple Levenshtein distance for fuzzy matching
 */
export function getLevenshteinDistance(a: string, b: string): number {
  const matrix = Array.from({ length: a.length + 1 }, () =>
    Array.from({ length: b.length + 1 }, () => 0)
  );

  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] === b[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + 1
        );
      }
    }
  }
  return matrix[a.length][b.length];
}
