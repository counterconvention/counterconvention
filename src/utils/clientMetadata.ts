import { ClientMetadata } from '../types';

export function getClientMetadata(): ClientMetadata {
  if (typeof window === 'undefined') {
    return {
      deviceType: 'Computador / Desktop',
      os: 'Desconhecido',
      browser: 'Desconhecido',
      userAgent: 'N/A',
      screenResolution: 'N/A',
      viewportSize: 'N/A',
      pixelRatio: '1x',
      orientation: 'N/A',
      touchSupport: 'Não',
      platform: 'N/A',
      language: 'pt-BR',
      languages: 'pt-BR',
      timeZone: 'America/Sao_Paulo',
      timeZoneOffset: 'UTC-03:00',
      localFormattedTime: new Date().toLocaleString('pt-BR'),
      referrer: 'Direto',
      pageUrl: '',
      onlineStatus: 'Online'
    };
  }

  const ua = navigator.userAgent || '';
  const width = window.screen?.width || window.innerWidth || 0;
  const height = window.screen?.height || window.innerHeight || 0;
  const vWidth = window.innerWidth || 0;
  const vHeight = window.innerHeight || 0;

  // 1. Detect Device Type
  let deviceType: 'Celular' | 'Tablet' | 'Computador / Desktop' = 'Computador / Desktop';
  const isTablet = /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk)/i.test(ua);
  const isMobile = /mobile|iphone|ipod|android.*mobile|blackberry|iemobile|opera mini/i.test(ua);

  if (isTablet) {
    deviceType = 'Tablet';
  } else if (isMobile || width <= 768) {
    deviceType = 'Celular';
  }

  // 2. Detect Operating System
  let os = 'Desconhecido';
  if (/iphone/i.test(ua)) {
    const match = ua.match(/os (\d+[_.]\d+)/i);
    os = `iOS (iPhone)${match ? ' ' + match[1].replace('_', '.') : ''}`;
  } else if (/ipad/i.test(ua)) {
    const match = ua.match(/os (\d+[_.]\d+)/i);
    os = `iPadOS${match ? ' ' + match[1].replace('_', '.') : ''}`;
  } else if (/android/i.test(ua)) {
    const match = ua.match(/android\s([0-9.]+)/i);
    os = `Android${match ? ' ' + match[1] : ''}`;
  } else if (/macintosh|mac os x/i.test(ua)) {
    os = 'macOS (Apple Mac)';
  } else if (/windows nt 10.0/i.test(ua)) {
    os = 'Windows 10/11';
  } else if (/windows nt 6.3/i.test(ua)) {
    os = 'Windows 8.1';
  } else if (/windows nt 6.1/i.test(ua)) {
    os = 'Windows 7';
  } else if (/windows/i.test(ua)) {
    os = 'Windows';
  } else if (/linux/i.test(ua)) {
    os = 'Linux';
  }

  // 3. Detect Browser
  let browser = 'Navegador Web';
  if (/edg/i.test(ua)) {
    browser = 'Microsoft Edge';
  } else if (/chrome|crios/i.test(ua) && !/opr|opera/i.test(ua)) {
    browser = 'Google Chrome';
  } else if (/safari/i.test(ua) && !/chrome|crios/i.test(ua)) {
    browser = 'Apple Safari';
  } else if (/firefox|fxios/i.test(ua)) {
    browser = 'Mozilla Firefox';
  } else if (/opr|opera/i.test(ua)) {
    browser = 'Opera';
  } else if (/instagram/i.test(ua)) {
    browser = 'Instagram In-App Browser';
  } else if (/fbav/i.test(ua)) {
    browser = 'Facebook In-App Browser';
  } else if (/whatsapp/i.test(ua)) {
    browser = 'WhatsApp In-App Browser';
  }

  // 4. Timezone & Local Date
  let timeZone = 'America/Sao_Paulo';
  try {
    timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Sao_Paulo';
  } catch {}

  const offsetMinutes = new Date().getTimezoneOffset();
  const offsetHours = -offsetMinutes / 60;
  const sign = offsetHours >= 0 ? '+' : '-';
  const absHours = Math.abs(Math.floor(offsetHours)).toString().padStart(2, '0');
  const absMinutes = (Math.abs(offsetMinutes) % 60).toString().padStart(2, '0');
  const timeZoneOffset = `UTC${sign}${absHours}:${absMinutes}`;

  const localFormattedTime = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  // 5. Hardware & Network info
  const navAny = navigator as any;
  const cpuCores = navigator.hardwareConcurrency ? `${navigator.hardwareConcurrency} Núcleos` : 'Não informado';
  const deviceMemory = navAny.deviceMemory ? `~${navAny.deviceMemory} GB RAM` : 'Não informado';
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const touchSupport = hasTouch
    ? `Sim (${navigator.maxTouchPoints > 0 ? navigator.maxTouchPoints + ' pontos de toque' : 'Touchscreen'})`
    : 'Não (Mouse / Touchpad convencional)';

  let connectionType = 'Banda Larga / Wi-Fi';
  let networkSpeed = 'Não informado';
  if (navAny.connection) {
    if (navAny.connection.effectiveType) {
      connectionType = `Rede móvel / dados (${navAny.connection.effectiveType.toUpperCase()})`;
    }
    if (navAny.connection.downlink) {
      networkSpeed = `~${navAny.connection.downlink} Mbps`;
    }
  }

  const orientation =
    window.screen?.orientation?.type ||
    (width > height ? 'Paisagem (Horizontal)' : 'Retrato (Vertical)');

  const pixelRatio = window.devicePixelRatio ? `${window.devicePixelRatio}x (DPR)` : '1x';

  return {
    deviceType,
    os,
    browser,
    userAgent: ua,
    screenResolution: `${width} x ${height} px`,
    viewportSize: `${vWidth} x ${vHeight} px`,
    pixelRatio,
    orientation,
    cpuCores,
    deviceMemory,
    touchSupport,
    platform: navigator.platform || 'N/A',
    language: navigator.language || 'pt-BR',
    languages: navigator.languages ? navigator.languages.join(', ') : navigator.language || 'pt-BR',
    timeZone,
    timeZoneOffset,
    localFormattedTime,
    referrer: document.referrer ? document.referrer : 'Acesso Direto ao Catálogo',
    pageUrl: window.location.href,
    connectionType,
    networkSpeed,
    onlineStatus: navigator.onLine ? 'Online' : 'Offline'
  };
}
