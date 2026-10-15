import { Product, StoreSettings, SiteNotification, Order, DEFAULT_CATEGORIES } from '../types';

export const initialStoreSettings: StoreSettings = {
  storeName: 'Replace Store',
  tagline: 'replace your tagline here',
  // Integrações Modulares
  whatsappEnabled: true,
  whatsappNumber: '00000000000',
  whatsappDisplay: '(00) 0000-0000',
  instagramEnabled: true,
  instagramUser: 'replace',
  instagramUrl: 'https://instagram.com/replace',
  instagramFollowers: '0k',
  instagramPostsCount: 0,
  instagramBio: 'replace here bio',
  discordEnabled: true,
  discordUrl: 'https://discord.gg/replace',
  discordServerName: 'Replace Community',
  discordDisplay: 'Discord Oficial',
  discordWebhookUrl: '',
  // Contato e Loja
  email: 'replace@email.com',
  landline: '(00) 0000-0000',
  address: 'Rua Exemplo, 000 - Bairro',
  cityState: 'Cidade - UF, CEP 00000-000',
  googleMapsUrl: 'https://maps.google.com/?q=0,0',
  openingHours: 'Segunda a Sexta: 00:00 às 00:00',
  pixKey: 'replace@email.com',
  freeShippingMinimum: 500,
  bannerEnabled: true,
  bannerText: 'Frete Grátis nas compras acima de R$ 500 • 5% OFF no Pix',
  lowStockThreshold: 3,
  adminPin: '9000',
  categories: [
    'Geral',
    'Eletrônicos & Tech',
    'Acessórios',
    'Casa & Estilo',
    'Vestuário',
    'Destaques'
  ],
  currencySymbol: 'R$',
  nicheDescription: 'Loja e catálogo versátil multissegmento'
};

export const initialProducts: Product[] = [
  {
    id: 'prod-tech-01',
    name: 'Fone Wireless Noise-Cancelling Studio',
    category: 'Eletrônicos & Tech',
    salePrice: 389.9,
    costPrice: 190.0,
    promoPrice: 349.9,
    isPromo: true,
    isFeatured: true,
    images: ['/src/assets/images/generic_product_headphones_1791981742572.jpg'],
    sizes: [{ size: 'Único', quantity: 14 }],
    sizeSystem: 'generic',
    colors: ['Preto Fosco', 'Cinza Titânio'],
    fabric: 'Alumínio Escovado & Couro Sintético Macio',
    description:
      'Cancelamento ativo de ruído híbrido (ANC), drivers dinâmicos de 40mm de alta definição, bateria de até 45 horas e conectividade Bluetooth 5.3 com emparelhamento multiponto.',
    createdAt: '2026-03-01T10:00:00.000Z'
  },
  {
    id: 'prod-watch-02',
    name: 'Relógio Cronógrafo Minimalista Matte',
    category: 'Acessórios',
    salePrice: 480.0,
    costPrice: 220.0,
    isFeatured: true,
    images: ['/src/assets/images/generic_product_smartwatch_1791981743151.jpg'],
    sizes: [{ size: 'Único', quantity: 9 }],
    sizeSystem: 'generic',
    colors: ['Grafite Titânio', 'Preto Fosco'],
    fabric: 'Caixa de Titânio & Vidro de Safira Antirrisco',
    description:
      'Estética arquitetônica nórdica com mostrador analógico de alta legibilidade, coroa rosqueada resistente à água e pulseira em elastômero hipoalergênico.',
    createdAt: '2026-03-02T11:00:00.000Z'
  },
  {
    id: 'prod-pack-03',
    name: 'Mochila Rolltop Impermeável Urban',
    category: 'Acessórios',
    salePrice: 299.9,
    costPrice: 135.0,
    isFeatured: true,
    images: ['/src/assets/images/generic_product_backpack_1791981744366.jpg'],
    sizes: [{ size: 'Único', quantity: 16 }],
    sizeSystem: 'generic',
    colors: ['Preto Carbono'],
    fabric: 'Tecido Balístico Impermeável 900D',
    description:
      'Compartimento para notebook de até 16" com amortecimento anti-impacto, fecho rolltop ajustável com fivela magnética alemã e bolsos laterais de acesso rápido.',
    createdAt: '2026-03-03T12:00:00.000Z'
  },
  {
    id: 'prod-lamp-04',
    name: 'Luminária Articulada LED Touch Desk',
    category: 'Casa & Estilo',
    salePrice: 249.9,
    costPrice: 110.0,
    promoPrice: 219.9,
    isPromo: true,
    isFeatured: false,
    images: ['/src/assets/images/generic_product_desklamp_1791981745000.jpg'],
    sizes: [{ size: 'Único', quantity: 11 }],
    sizeSystem: 'generic',
    colors: ['Alumínio & Madeira Clara', 'Preto & Nogueira'],
    fabric: 'Haste Articulada em Alumínio & Base Maciça',
    description:
      'Sistema de iluminação direcional touch com ajuste contínuo de brilho e 3 temperaturas de cor (3000K quente a 6000K fria) para foco e conforto visual.',
    createdAt: '2026-03-04T14:00:00.000Z'
  }
];

export const initialNotifications: SiteNotification[] = [
  {
    id: 'notif-welcome',
    title: 'Bem-vindo ao Catálogo Online',
    message: 'Explore nossos produtos selecionados e finalize seu pedido com total agilidade.',
    type: 'info',
    createdAt: new Date().toISOString(),
    isRead: false
  }
];

export const initialOrders: Order[] = [];

export const instagramFeedPosts = [
  {
    id: 'post-01',
    imageUrl: '/src/assets/images/generic_product_headphones_1791981742572.jpg',
    caption: 'Foco total com tecnologia de áudio acústico de precisão.',
    likes: 142,
    comments: 18,
    productId: 'prod-tech-01'
  },
  {
    id: 'post-02',
    imageUrl: '/src/assets/images/generic_product_smartwatch_1791981743151.jpg',
    caption: 'Precisão nos detalhes. Construído com titânio e safira.',
    likes: 198,
    comments: 24,
    productId: 'prod-watch-02'
  },
  {
    id: 'post-03',
    imageUrl: '/src/assets/images/generic_product_backpack_1791981744366.jpg',
    caption: 'Mobilidade urbana para o dia a dia contemporâneo.',
    likes: 116,
    comments: 12,
    productId: 'prod-pack-03'
  },
  {
    id: 'post-04',
    imageUrl: '/src/assets/images/generic_product_desklamp_1791981745000.jpg',
    caption: 'Iluminação pensada para criatividade e produtividade.',
    likes: 175,
    comments: 15,
    productId: 'prod-lamp-04'
  }
];
