import { Product, Order, ProductCategory, ProductSize, StoreSettings, SiteNotification } from '../types';

// Helper to escape CSV cell value
function escapeCsv(val: unknown): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

// Export Products to CSV with UTF-8 BOM for Microsoft Excel / Google Sheets
export function exportProductsToCsv(products: Product[]): void {
  const headers = [
    'ID',
    'Nome',
    'Categoria',
    'Preço Venda (R$)',
    'Preço Fabricação / Custo (R$)',
    'Lucro Unitário (R$)',
    'Margem de Lucro (%)',
    'Estoque Total',
    'Grade de Tamanhos',
    'Cores',
    'Tecido',
    'Destaque',
    'Descrição',
    'Imagens (URLs)'
  ];

  const rows = products.map((p) => {
    const totalStock = p.sizes.reduce((acc, s) => acc + s.quantity, 0);
    const unitProfit = p.salePrice - p.costPrice;
    const margin = p.salePrice > 0 ? ((unitProfit / p.salePrice) * 100).toFixed(1) : '0';
    const sizeStr = p.sizes.map((s) => `${s.size}:${s.quantity}`).join('|');
    const colorStr = p.colors.join('|');
    const imgStr = p.images.join('|');

    return [
      escapeCsv(p.id),
      escapeCsv(p.name),
      escapeCsv(p.category),
      escapeCsv(p.salePrice.toFixed(2)),
      escapeCsv(p.costPrice.toFixed(2)),
      escapeCsv(unitProfit.toFixed(2)),
      escapeCsv(margin + '%'),
      escapeCsv(totalStock),
      escapeCsv(sizeStr),
      escapeCsv(colorStr),
      escapeCsv(p.fabric || '100% Algodão'),
      escapeCsv(p.isFeatured ? 'Sim' : 'Não'),
      escapeCsv(p.description),
      escapeCsv(imgStr)
    ].join(';');
  });

  const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
  downloadBlob(csvContent, `catalogo_produtos_${formatDateForFile(new Date())}.csv`, 'text/csv;charset=utf-8;');
}

// Export Orders to CSV
export function exportOrdersToCsv(orders: Order[]): void {
  const headers = [
    'ID Pedido',
    'Data/Hora',
    'Cliente',
    'WhatsApp',
    'Forma de Entrega',
    'Endereço',
    'Forma de Pagamento',
    'Status',
    'Itens (Qtd x Produto [Tam/Cor])',
    'Subtotal (R$)',
    'Total (R$)',
    'Custo Total Fabricação (R$)',
    'Lucro Líquido (R$)',
    'Margem Lucro (%)'
  ];

  const rows = orders.map((o) => {
    const itemsStr = o.items
      .map((i) => `${i.quantity}x ${i.productName} (${i.size}/${i.color})`)
      .join(' + ');
    const margin = o.total > 0 ? ((o.totalProfit / o.total) * 100).toFixed(1) : '0';

    return [
      escapeCsv(o.id),
      escapeCsv(new Date(o.createdAt).toLocaleString('pt-BR')),
      escapeCsv(o.customer.name),
      escapeCsv(o.customer.phone),
      escapeCsv(o.customer.deliveryMethod),
      escapeCsv(o.customer.address || 'Balcão da Loja'),
      escapeCsv(o.customer.paymentMethod),
      escapeCsv(o.status),
      escapeCsv(itemsStr),
      escapeCsv(o.subtotal.toFixed(2)),
      escapeCsv(o.total.toFixed(2)),
      escapeCsv(o.totalCost.toFixed(2)),
      escapeCsv(o.totalProfit.toFixed(2)),
      escapeCsv(margin + '%')
    ].join(';');
  });

  const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
  downloadBlob(csvContent, `historico_pedidos_${formatDateForFile(new Date())}.csv`, 'text/csv;charset=utf-8;');
}

// Export Store Settings to CSV
export function exportSettingsToCsv(settings: StoreSettings): void {
  const headers = ['Campo / Parâmetro', 'Chave Técnica', 'Valor Configurado', 'Descrição'];
  const items: [string, string, string | number | boolean | undefined, string][] = [
    ['Nome da Loja', 'storeName', settings.storeName, 'Nome principal exibido no cabeçalho e rodapé'],
    ['Slogan / Subtítulo', 'tagline', settings.tagline, 'Frase de impacto da marca'],
    ['WhatsApp (Número Oficial)', 'whatsappNumber', settings.whatsappNumber, 'Número com DDI e DDD (ex: 5511987654321)'],
    ['WhatsApp (Exibição)', 'whatsappDisplay', settings.whatsappDisplay, 'Formato amigável de exibição (ex: (11) 98765-4321)'],
    ['Instagram (Usuário)', 'instagramUser', settings.instagramUser, 'Handle do Instagram sem @'],
    ['Instagram (Link Oficial)', 'instagramUrl', settings.instagramUrl, 'URL completa do perfil'],
    ['Instagram (Seguidores)', 'instagramFollowers', settings.instagramFollowers, 'Contagem exibida no catálogo'],
    ['Instagram (Bio Oficial)', 'instagramBio', settings.instagramBio, 'Texto da bio oficial'],
    ['E-mail de Contato', 'email', settings.email, 'E-mail do SAC da loja'],
    ['Telefone Fixo', 'landline', settings.landline, 'Telefone fixo do showroom'],
    ['Endereço Físico', 'address', settings.address, 'Rua, número e bairro do Showroom'],
    ['Cidade / Estado / CEP', 'cityState', settings.cityState, 'Localidade e CEP'],
    ['Link Google Maps', 'googleMapsUrl', settings.googleMapsUrl, 'Link direto do Google Maps'],
    ['Horário de Atendimento', 'openingHours', settings.openingHours, 'Dias e horários de funcionamento'],
    ['Chave Pix', 'pixKey', settings.pixKey, 'Chave Pix para pagamentos'],
    ['Frete Grátis (Mínimo R$)', 'freeShippingMinimum', settings.freeShippingMinimum, 'Valor mínimo no carrinho para frete grátis'],
    ['Banner Ativo', 'bannerEnabled', settings.bannerEnabled ? 'Sim' : 'Não', 'Exibe barra de destaque no topo'],
    ['Texto do Banner', 'bannerText', settings.bannerText, 'Mensagem do banner de topo'],
    ['Alerta Estoque Baixo (un)', 'lowStockThreshold', settings.lowStockThreshold, 'Limite mínimo para acionar alerta de estoque'],
    ['PIN de Acesso Admin', 'adminPin', settings.adminPin || '9000', 'Senha/PIN de 4 dígitos para o painel administrativo'],
    ['URL Webhook / API Nuvem', 'backupWebhookUrl', settings.backupWebhookUrl || '', 'Endpoint para backup em nuvem de terceiros'],
    ['Token Webhook / API', 'backupWebhookToken', settings.backupWebhookToken || '', 'Bearer Token / chave de autenticação'],
    ['Frequência de Backup', 'backupAutoFrequency', settings.backupAutoFrequency || 'daily', 'Frequência sugerida para backup'],
    ['Último Backup Realizado', 'lastBackupDate', settings.lastBackupDate || '', 'Timestamp do último backup'],
    ['Última Sincronização API', 'lastCloudSyncDate', settings.lastCloudSyncDate || '', 'Timestamp do último sync na nuvem']
  ];

  const rows = items.map(([label, key, val, desc]) => {
    return [
      escapeCsv(label),
      escapeCsv(key),
      escapeCsv(val ?? ''),
      escapeCsv(desc)
    ].join(';');
  });

  const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
  downloadBlob(csvContent, `configuracoes_loja_${formatDateForFile(new Date())}.csv`, 'text/csv;charset=utf-8;');
}

// Export Notifications / Announcements to CSV
export function exportNotificationsToCsv(notifications: SiteNotification[]): void {
  const headers = ['ID', 'Data/Hora Criação', 'Tipo', 'Título', 'Mensagem', 'Lida'];

  const rows = notifications.map((n) => {
    return [
      escapeCsv(n.id),
      escapeCsv(new Date(n.createdAt).toLocaleString('pt-BR')),
      escapeCsv(n.type),
      escapeCsv(n.title),
      escapeCsv(n.message),
      escapeCsv(n.isRead ? 'Sim' : 'Não')
    ].join(';');
  });

  const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
  downloadBlob(csvContent, `comunicados_notificacoes_${formatDateForFile(new Date())}.csv`, 'text/csv;charset=utf-8;');
}

// Parse imported CSV text into StoreSettings
export function parseSettingsCsv(csvText: string): { settings: Partial<StoreSettings>; count: number } {
  let cleanText = csvText.trim();
  if (cleanText.charCodeAt(0) === 0xfeff) {
    cleanText = cleanText.substring(1);
  }

  const lines = cleanText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const delimiter = lines[0]?.includes(';') ? ';' : ',';

  const parseLine = (text: string): string[] => {
    const result: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '"') {
        if (inQuotes && text[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        result.push(cur.trim());
        cur = '';
      } else {
        cur += char;
      }
    }
    result.push(cur.trim());
    return result;
  };

  const parsedSettings: Partial<StoreSettings> = {};
  let count = 0;

  for (let i = 1; i < lines.length; i++) {
    const cols = parseLine(lines[i]);
    if (cols.length < 3) continue;

    const key = cols[1]?.trim();
    const val = cols[2]?.trim();
    if (!key || val === undefined) continue;

    if (key === 'freeShippingMinimum' || key === 'lowStockThreshold') {
      const num = parseFloat(val.replace(',', '.'));
      if (!isNaN(num)) {
        (parsedSettings as any)[key] = num;
        count++;
      }
    } else if (key === 'bannerEnabled') {
      (parsedSettings as any)[key] = val.toLowerCase() === 'sim' || val.toLowerCase() === 'true';
      count++;
    } else if (key in parsedSettings || true) {
      (parsedSettings as any)[key] = val;
      count++;
    }
  }

  return { settings: parsedSettings, count };
}

// Parse imported CSV text into SiteNotification list
export function parseNotificationsCsv(csvText: string): { notifications: SiteNotification[]; count: number } {
  let cleanText = csvText.trim();
  if (cleanText.charCodeAt(0) === 0xfeff) {
    cleanText = cleanText.substring(1);
  }

  const lines = cleanText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const delimiter = lines[0]?.includes(';') ? ';' : ',';

  const parseLine = (text: string): string[] => {
    const result: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '"') {
        if (inQuotes && text[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        result.push(cur.trim());
        cur = '';
      } else {
        cur += char;
      }
    }
    result.push(cur.trim());
    return result;
  };

  const notifs: SiteNotification[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseLine(lines[i]);
    if (cols.length < 5) continue;

    const id = cols[0] || `notif-${Date.now()}-${i}`;
    const rawType = cols[2]?.toLowerCase() || 'info';
    const type: 'promo' | 'order' | 'alert' | 'info' =
      rawType === 'promo' || rawType === 'order' || rawType === 'alert' ? rawType : 'info';
    const title = cols[3];
    const message = cols[4];
    const isRead = cols[5]?.toLowerCase() === 'sim' || cols[5]?.toLowerCase() === 'true';

    if (title && message) {
      notifs.push({
        id,
        title,
        message,
        type,
        createdAt: new Date().toISOString(),
        isRead
      });
    }
  }

  return { notifications: notifs, count: notifs.length };
}

// Parse imported CSV text into Product list
export function parseProductsCsv(csvText: string): { products: Product[]; errors: string[] } {
  const errors: string[] = [];
  const products: Product[] = [];

  // Remove BOM if present
  let cleanText = csvText.trim();
  if (cleanText.charCodeAt(0) === 0xfeff) {
    cleanText = cleanText.substring(1);
  }

  const lines = cleanText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) {
    return { products: [], errors: ['O arquivo CSV está vazio ou contém apenas o cabeçalho.'] };
  }

  // Detect delimiter (; or ,)
  const headerLine = lines[0];
  const delimiter = headerLine.includes(';') ? ';' : ',';

  // Parse lines considering quotes
  const parseLine = (text: string): string[] => {
    const result: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '"') {
        if (inQuotes && text[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        result.push(cur.trim());
        cur = '';
      } else {
        cur += char;
      }
    }
    result.push(cur.trim());
    return result;
  };

  const headers = parseLine(headerLine).map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ''));

  const findColIndex = (keywords: string[]) => {
    return headers.findIndex((h) => keywords.some((k) => h.includes(k)));
  };

  const idxName = findColIndex(['nome', 'produto', 'title', 'name']);
  const idxCat = findColIndex(['categoria', 'category']);
  const idxSale = findColIndex(['precovenda', 'venda', 'preco', 'price']);
  const idxCost = findColIndex(['precofabricacao', 'fabricacao', 'custo', 'cost']);
  const idxStock = findColIndex(['estoque', 'stock', 'qtd', 'quantidade']);
  const idxSizes = findColIndex(['tamanhos', 'grade', 'sizes']);
  const idxColors = findColIndex(['cores', 'color', 'colors']);
  const idxDesc = findColIndex(['descricao', 'description', 'desc']);
  const idxImgs = findColIndex(['imagem', 'imagens', 'image', 'images', 'fotos']);

  if (idxName === -1) {
    return { products: [], errors: ['Coluna obrigatória "Nome" não foi encontrada no cabeçalho do CSV.'] };
  }

  for (let i = 1; i < lines.length; i++) {
    const cols = parseLine(lines[i]);
    if (cols.length === 0 || !cols[idxName]) continue;

    const name = cols[idxName];
    let category: ProductCategory = 'Vestidos';
    if (idxCat !== -1 && cols[idxCat]) {
      const catVal = cols[idxCat].toLowerCase();
      if (catVal.includes('conjunto')) category = 'Conjuntos';
      else if (catVal.includes('vestido')) category = 'Vestidos';
      else if (catVal.includes('saia') || catVal.includes('short')) category = 'Saias & Shorts';
      else if (catVal.includes('camisa') || catVal.includes('blusa')) category = 'Camisas & Blusas';
    }

    const parseNum = (str: string | undefined, defaultVal: number) => {
      if (!str) return defaultVal;
      const clean = str.replace(/[R$\s%]/g, '').replace(',', '.');
      const n = parseFloat(clean);
      return isNaN(n) ? defaultVal : n;
    };

    const salePrice = idxSale !== -1 ? parseNum(cols[idxSale], 99.9) : 99.9;
    const costPrice = idxCost !== -1 ? parseNum(cols[idxCost], salePrice * 0.4) : salePrice * 0.4;

    // Parse sizes
    let sizes: { size: ProductSize; quantity: number }[] = [
      { size: 'P', quantity: 5 },
      { size: 'M', quantity: 8 },
      { size: 'G', quantity: 5 }
    ];

    if (idxSizes !== -1 && cols[idxSizes]) {
      const sizeEntries = cols[idxSizes].split(/[|,]/);
      const parsedSizes = sizeEntries
        .map((entry) => {
          const [s, q] = entry.split(/[:=-]/);
          const sizeName = (s || '').trim().toUpperCase() as ProductSize;
          const qty = parseInt(q || '5', 10);
          const validSizes = ['PP', 'P', 'M', 'G', 'GG', '32', '34', '36', '38', '40'];
          if (validSizes.includes(sizeName)) {
            return { size: sizeName as ProductSize, quantity: isNaN(qty) ? 5 : qty };
          }
          return null;
        })
        .filter((item): item is { size: ProductSize; quantity: number } => item !== null);

      if (parsedSizes.length > 0) {
        sizes = parsedSizes;
      }
    } else if (idxStock !== -1 && cols[idxStock]) {
      const totalQ = parseInt(cols[idxStock], 10) || 15;
      const each = Math.max(1, Math.floor(totalQ / 3));
      sizes = [
        { size: 'P', quantity: each },
        { size: 'M', quantity: totalQ - each * 2 },
        { size: 'G', quantity: each }
      ];
    }

    // Colors
    let colors = ['Preto', 'Off-white', 'Terracota'];
    if (idxColors !== -1 && cols[idxColors]) {
      colors = cols[idxColors]
        .split(/[|,/]/)
        .map((c) => c.trim())
        .filter(Boolean);
      if (colors.length === 0) colors = ['Única'];
    }

    // Images
    let images = [
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=1000&q=85'
    ];
    if (idxImgs !== -1 && cols[idxImgs]) {
      const parsedImgs = cols[idxImgs]
        .split(/[|,]/)
        .map((img) => img.trim())
        .filter((img) => img.startsWith('http'));
      if (parsedImgs.length > 0) images = parsedImgs;
    }

    const description =
      idxDesc !== -1 && cols[idxDesc]
        ? cols[idxDesc]
        : `Peça exclusiva confeccionada com acabamento de alfaiataria premium e caimento impecável.`;

    products.push({
      id: `prod-csv-${Date.now()}-${i}`,
      name,
      category,
      salePrice,
      costPrice,
      images,
      sizes,
      colors,
      description,
      fabric: 'Alfaiataria & Crepe',
      isFeatured: false,
      createdAt: new Date().toISOString()
    });
  }

  return { products, errors };
}

function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function formatDateForFile(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${y}${m}${day}_${h}${min}`;
}
