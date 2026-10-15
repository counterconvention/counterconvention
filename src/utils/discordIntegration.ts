import { Order, StoreSettings } from '../types';

/**
 * Sends a rich formatted Discord Webhook message when a new order is placed
 */
export async function sendDiscordOrderNotification(
  order: Order,
  settings: StoreSettings
): Promise<{ success: boolean; error?: string }> {
  const webhookUrl = settings.discordWebhookUrl?.trim();
  if (!settings.discordEnabled || !webhookUrl) {
    return { success: false, error: 'Discord webhook não configurado ou desativado' };
  }

  try {
    const itemsList = order.items
      .map(
        (item) =>
          `• **${item.quantity}x ${item.productName}** (${item.size} / ${item.color}) - R$ ${(
            item.salePrice * item.quantity
          ).toFixed(2)}`
      )
      .join('\n');

    const payload = {
      username: settings.storeName || 'Loja Virtual',
      avatar_url: 'https://cdn-icons-png.flaticon.com/512/891/891462.png',
      content: `🛍️ **Novo Pedido Recebido!** #${order.id}`,
      embeds: [
        {
          title: `Pedido #${order.id} - ${order.customer.name}`,
          color: 0x5865f2, // Discord Blurple
          fields: [
            {
              name: '👤 Cliente',
              value: `**Nome:** ${order.customer.name}\n**WhatsApp / Tel:** ${order.customer.phone || 'Não informado'}`,
              inline: true
            },
            {
              name: '💳 Pagamento & Entrega',
              value: `**Pagamento:** ${order.customer.paymentMethod}\n**Entrega:** ${order.customer.deliveryMethod}`,
              inline: true
            },
            {
              name: '📍 Endereço de Envio',
              value: order.customer.address || 'Retirada no Ponto da Loja',
              inline: false
            },
            {
              name: '📦 Itens do Pedido',
              value: itemsList.slice(0, 1000) || 'Nenhum item listado',
              inline: false
            },
            {
              name: '💰 Resumo Financeiro',
              value: `**Subtotal:** R$ ${order.subtotal.toFixed(2)}\n**Descontos:** R$ ${order.discount.toFixed(
                2
              )}\n**Total:** **R$ ${order.total.toFixed(2)}**`,
              inline: true
            },
            {
              name: '⏱️ Data/Hora',
              value: new Date(order.createdAt).toLocaleString('pt-BR'),
              inline: true
            }
          ],
          footer: {
            text: `${settings.storeName} • Sistema Automatizado de Vendas`
          },
          timestamp: new Date().toISOString()
        }
      ]
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (response.ok || response.status === 204) {
      return { success: true };
    } else {
      const errText = await response.text();
      return { success: false, error: `Discord HTTP ${response.status}: ${errText}` };
    }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Falha ao conectar ao Discord' };
  }
}

/**
 * Tests connection with a Discord webhook
 */
export async function testDiscordWebhook(
  webhookUrl: string,
  storeName: string
): Promise<{ success: boolean; message: string }> {
  if (!webhookUrl || !webhookUrl.startsWith('https://discord.com/api/webhooks/')) {
    return {
      success: false,
      message: 'URL inválida. Deve iniciar com https://discord.com/api/webhooks/...'
    };
  }

  try {
    const payload = {
      username: storeName || 'Loja Virtual',
      content: `✅ **Teste de Conexão Bem-Sucedido!**\nO webhook do Discord para a loja **${storeName}** está funcionando perfeitamente. Novos pedidos serão notificados aqui automaticamente.`
    };

    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (res.ok || res.status === 204) {
      return {
        success: true,
        message: 'Mensagem de teste enviada com sucesso para o canal do Discord!'
      };
    } else {
      const txt = await res.text();
      return {
        success: false,
        message: `Discord retornou código ${res.status}: ${txt}`
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: `Erro ao enviar teste: ${err?.message || 'Falha de rede ou CORS'}`
    };
  }
}
