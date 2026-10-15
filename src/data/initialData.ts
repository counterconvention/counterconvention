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
  nicheDescription: 'Loja e catálogo versátil multissegmento',
  catalogSubtitle:
    'Selecione suas peças favoritas, confira disponibilidade de cores e tamanhos em tempo real e feche seu pedido com atendimento via WhatsApp.'
};

export const initialProducts: Product[] = [];

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

export interface InstagramPost {
  id: string;
  imageUrl: string;
  caption: string;
  likes: number;
  comments: number;
  productId?: string;
}

export const instagramFeedPosts: InstagramPost[] = [
  {
    id: 'post-01',
    imageUrl: '/src/assets/images/generic_product_headphones_1791981742572.jpg',
    caption: 'Foco total com tecnologia de precisão e design refinado.',
    likes: 142,
    comments: 18
  },
  {
    id: 'post-02',
    imageUrl: '/src/assets/images/generic_product_smartwatch_1791981743151.jpg',
    caption: 'Precisão nos detalhes. Construído com materiais selecionados.',
    likes: 198,
    comments: 24
  },
  {
    id: 'post-03',
    imageUrl: '/src/assets/images/generic_product_backpack_1791981744366.jpg',
    caption: 'Mobilidade e praticidade para o seu cotidiano.',
    likes: 116,
    comments: 12
  },
  {
    id: 'post-04',
    imageUrl: '/src/assets/images/generic_product_desklamp_1791981745000.jpg',
    caption: 'Iluminação pensada para criatividade e produtividade.',
    likes: 175,
    comments: 15
  }
];
