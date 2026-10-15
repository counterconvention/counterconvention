export type ProductCategory = string;

export type LetterSize = 'PP' | 'P' | 'M' | 'G' | 'GG';
export type NumericSize = '32' | '34' | '36' | '38' | '40';
export type ProductSize = string;
export type SizingType = 'letter' | 'numeric' | 'generic';

export const LETTER_SIZES: LetterSize[] = ['PP', 'P', 'M', 'G', 'GG'];
export const NUMERIC_SIZES: NumericSize[] = ['32', '34', '36', '38', '40'];
export const DEFAULT_CATEGORIES: string[] = [
  'Geral',
  'Eletrônicos',
  'Acessórios',
  'Vestuário',
  'Casa & Estilo',
  'Destaques'
];

export interface SizeStock {
  size: ProductSize;
  quantity: number;
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  salePrice: number;
  costPrice: number; // Preço de fabricação / custo
  images: string[];
  sizes: SizeStock[];
  sizeSystem?: SizingType;
  colors: string[];
  description: string;
  isFeatured?: boolean;
  isPromo?: boolean;
  promoPrice?: number;
  fabric?: string; // Especificações / Material
  sku?: string;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  selectedSize: ProductSize;
  selectedColor: string;
  quantity: number;
}

export type OrderStatus = 'Pendente' | 'Em Separação' | 'Concluído' | 'Cancelado';

export type DeliveryMethod =
  | 'Retirar na Loja'
  | 'Correios'
  | 'Retirada na Loja'
  | 'Correios/Sedex'
  | 'Motoboy Express'
  | 'Entrega Padrão'
  | 'Envio Digital';

export type PaymentMethod =
  | 'Pix (5% OFF)'
  | 'Cartão de Crédito (Até 12x)'
  | 'Débito'
  | 'Pix'
  | 'Cartão de Crédito'
  | 'Dinheiro'
  | 'A Combinar';

export interface OrderCustomer {
  name: string;
  phone: string;
  deliveryMethod: DeliveryMethod;
  address?: string;
  paymentMethod: PaymentMethod;
  notes?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  category: ProductCategory;
  size: ProductSize;
  color: string;
  quantity: number;
  salePrice: number;
  costPrice: number;
}

export interface ClientMetadata {
  deviceType: 'Celular' | 'Tablet' | 'Computador / Desktop';
  os: string;
  browser: string;
  userAgent: string;
  screenResolution: string;
  viewportSize: string;
  pixelRatio: string;
  orientation: string;
  cpuCores?: string;
  deviceMemory?: string;
  touchSupport: string;
  platform: string;
  language: string;
  languages: string;
  timeZone: string;
  timeZoneOffset: string;
  localFormattedTime: string;
  referrer: string;
  pageUrl: string;
  connectionType?: string;
  networkSpeed?: string;
  onlineStatus: string;
  geoCoordinates?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    mapsUrl?: string;
  };
}

export interface Order {
  id: string;
  customer: OrderCustomer;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  totalCost: number;
  totalProfit: number;
  status: OrderStatus;
  createdAt: string;
  whatsappMessage: string;
  clientMetadata?: ClientMetadata;
}

export interface SiteNotification {
  id: string;
  title: string;
  message: string;
  type: 'promo' | 'order' | 'alert' | 'info';
  createdAt: string;
  isRead: boolean;
  link?: string;
}

export interface StoreSettings {
  storeName: string; // Ex: Replace Store
  tagline: string; // Ex: Replace your tagline here
  // Integrações Modulares
  whatsappEnabled: boolean; // Ativa/desativa botões e checkout do WhatsApp
  whatsappNumber: string; // Ex: 5500000000000
  whatsappDisplay: string; // Ex: (00) 00000-0000
  instagramEnabled: boolean; // Ativa/desativa módulo e links do Instagram
  instagramUser: string; // Ex: replace.profile
  instagramUrl: string; // Ex: https://instagram.com/replace.profile
  instagramFollowers: string; // Ex: 0k
  instagramPostsCount: number; // Ex: 0
  instagramBio: string; // Ex: replace here bio
  discordEnabled: boolean; // Ativa/desativa módulo e links do Discord
  discordUrl: string; // Ex: https://discord.gg/replace
  discordServerName: string; // Ex: Replace Community
  discordDisplay: string; // Ex: Discord Oficial
  discordWebhookUrl?: string; // Webhook opcional para notificações automáticas de novos pedidos
  // Informações de Contato e Localização
  email: string; // Ex: replace@email.com
  landline: string; // Ex: (00) 0000-0000
  address: string; // Ex: Replace Address, 000 - Center
  cityState: string; // Ex: Replace City - ST, CEP 00000-000
  googleMapsUrl: string; // Ex: https://maps.google.com/?q=0,0
  openingHours: string; // Ex: Segunda a Sexta: 00:00 às 00:00
  pixKey: string; // Ex: replace-pix-key
  freeShippingMinimum: number;
  bannerEnabled: boolean;
  bannerText: string;
  lowStockThreshold: number; // Alerta de estoque baixo
  adminPin?: string; // PIN secreto para painel admin (padrão: 9000)
  categories?: string[]; // Categorias genéricas customizadas
  currencySymbol?: string; // Ex: R$
  nicheDescription?: string; // Descrição do segmento da loja
  catalogSubtitle?: string; // Subtítulo / mensagem de boas-vindas do catálogo
  // Configurações de Backup, Nuvem & Segurança
  backupWebhookUrl?: string; // URL de API externa para backup automatizado
  backupWebhookToken?: string; // Bearer token ou chave de segurança
  backupAutoFrequency?: 'manual' | 'daily' | 'weekly'; // Frequência recomendada
  lastBackupDate?: string; // Data do último backup realizado
  lastBackupType?: string; // Tipo do último backup (CSV, JSON, Cloud API)
  lastCloudSyncDate?: string; // Data da última sincronização com API de terceiros
}

export interface CompleteStoreBackup {
  version: string;
  appName: string;
  exportedAt: string;
  exportTimestamp?: number;
  timeFormatted?: string;
  dateFormatted?: string;
  originHost?: string;
  settings: StoreSettings;
  notifications: SiteNotification[];
  products: Product[];
  orders: Order[];
  cart?: CartItem[];
  totalRecords?: number;
  checksum?: string;
  isEncrypted?: boolean;
  backupType?: 'manual' | 'hourly-snapshot' | 'auto-daily' | 'google-drive';
  label?: string;
}

export interface StoredBackupSnapshot {
  id: string;
  timestamp: number;
  isoDate: string;
  dateFormatted: string;
  timeFormatted: string;
  label: string;
  type: 'hourly' | 'daily' | 'manual';
  productsCount: number;
  ordersCount: number;
  settingsCount: number;
  notificationsCount: number;
  data: CompleteStoreBackup;
}

export interface BackupAnalysisResult {
  isValid: boolean;
  storeName?: string;
  productsCount: number;
  ordersCount: number;
  settingsCount: number;
  notificationsCount: number;
  hasProducts: boolean;
  hasSettings: boolean;
  hasOrders: boolean;
  hasNotifications: boolean;
  products?: Product[];
  settings?: Partial<StoreSettings>;
  orders?: Order[];
  notifications?: SiteNotification[];
  cart?: CartItem[];
  label?: string;
  version?: string;
  exportedAt?: string;
  error?: string;
}
