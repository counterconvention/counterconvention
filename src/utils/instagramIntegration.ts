// Utility to extract and automatically synchronize store branding and links from user @ handle

export interface DerivedStoreData {
  cleanHandle: string;
  storeName: string;
  tagline: string;
  instagramUser: string;
  instagramUrl: string;
  instagramFollowers: string;
  instagramPostsCount: number;
  instagramBio: string;
  whatsappMessagePreset: string;
}

/**
 * Clean input handle removing @, https://, trailing slashes, etc.
 */
export function cleanHandle(input: string): string {
  if (!input) return '';
  let cleaned = input.trim();
  // Remove Instagram URL if full URL is pasted
  cleaned = cleaned.replace(/^https?:\/\/(www\.)?instagram\.com\//i, '');
  // Remove trailing slashes or queries
  cleaned = cleaned.replace(/[\/\?].*$/, '');
  // Remove @ at start
  cleaned = cleaned.replace(/^@+/, '');
  return cleaned.toLowerCase();
}

/**
 * Capitalize string properly
 */
function capitalizeWord(w: string): string {
  if (!w) return '';
  const lower = w.toLowerCase();
  const knownSmall = ['de', 'da', 'do', 'das', 'dos', 'e'];
  if (knownSmall.includes(lower)) return lower;

  // Accents mapping for common boutique terms in Portuguese
  const accentMap: Record<string, string> = {
    aurea: 'Áurea',
    atelie: 'Ateliê',
    espaco: 'Espaço',
    otica: 'Ótica',
    elegancia: 'Elegância',
    colecao: 'Coleção'
  };

  if (accentMap[lower]) {
    return accentMap[lower];
  }

  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

/**
 * Derive high-end store name from handle
 */
export function deriveStoreNameFromHandle(handle: string): string {
  const cleaned = cleanHandle(handle);
  if (!cleaned) return 'Sua Loja';

  // Split by dots, underscores, dashes
  const parts = cleaned.split(/[\._\-]+/).filter(Boolean);
  if (parts.length === 0) return 'Sua Loja';

  const formatted = parts.map(capitalizeWord).join(' ');
  return formatted;
}

/**
 * Derive full synced store dataset from user's @ handle
 */
export function deriveStoreDataFromHandle(input: string): DerivedStoreData {
  const user = cleanHandle(input) || 'counter.oficial';
  const storeName = deriveStoreNameFromHandle(user);

  // Derive realistic high-engagement follower and post count based on name length/hash
  let hash = 0;
  for (let i = 0; i < user.length; i++) {
    hash = (hash * 31 + user.charCodeAt(i)) & 0xffffff;
  }
  const followersNum = (14 + (hash % 45) + (hash % 9) / 10).toFixed(1);
  const postsCount = 180 + (hash % 350);

  return {
    cleanHandle: user,
    storeName: storeName,
    tagline: `Moda Feminina Autêntica | Peças Exclusivas & Alfaiataria Atemporal ✨`,
    instagramUser: user,
    instagramUrl: `https://instagram.com/${user}`,
    instagramFollowers: `${followersNum}k`,
    instagramPostsCount: postsCount,
    instagramBio: `✨ Peças Exclusivas & Caimento Impecável\n👗 Tamanhos do PP ao GG\n📦 Enviamos para todo o Brasil\n📲 Pedidos e Atendimento pelo WhatsApp`,
    whatsappMessagePreset: `Olá! Vim através do catálogo da ${storeName} e gostaria de atendimento sobre as peças.`
  };
}

export const PRESET_HANDLES = [
  { handle: '@counter.oficial', label: 'Counter' },
  { handle: '@counter.store', label: 'Counter Store' },
  { handle: '@counter.boutique', label: 'Counter Boutique' },
  { handle: '@bellafeminina.oficial', label: 'Bella Feminina' }
];
