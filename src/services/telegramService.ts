export async function sendTelegramNotification(message: string): Promise<boolean> {
  try {
    const response = await fetch('/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    if (!response.ok) {
      const err = await response.json();
      console.error('Telegram error:', err);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Telegram failed:', error);
    return false;
  }
}

export function formatLeadMessage(data: {
  type: 'підбір' | 'викуп' | 'покупка' | 'консультація' | string;
  name: string;
  phone: string;
  budget?: string;
  message?: string;
  carTitle?: string;
  source?: string;
}): string {
  const typeEmoji: Record<string, string> = {
    підбір:       '🔍 АВТОПІДБІР',
    викуп:        '💰 ВИКУП АВТО',
    покупка:      '🚗 ПОКУПКА',
    консультація: '💬 КОНСУЛЬТАЦІЯ',
  };

  const type = typeEmoji[data.type] ?? `🆕 ${data.type.toUpperCase()}`;
  const name    = data.name    || 'Не вказано';
  const phone   = data.phone   || 'Не вказано';
  const budget  = data.budget  ? `\n💵 <b>Бюджет:</b> ${data.budget}` : '';
  const car     = data.carTitle ? `\n🚘 <b>Авто:</b> ${data.carTitle}` : '';
  const comment = data.message  ? `\n💬 <b>Коментар:</b> ${data.message}` : '';
  const source  = data.source   ? `\n📡 <b>Джерело:</b> ${data.source}` : '';

  return `<b>${type}!</b>
───────────────────
👤 <b>Ім'я:</b> ${name}
📞 <b>Тел:</b> <a href="tel:${phone}">${phone}</a>${budget}${car}${comment}${source}
───────────────────
<i>VIP.S CARS • ${new Date().toLocaleString('uk-UA', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</i>`;
}

// backward compat
export function formatOrderMessage(order: any): string {
  const typeMap: Record<string, string> = {
    selection: 'підбір',
    buyback:   'викуп',
    inspection:'консультація',
  };
  return formatLeadMessage({
    type:    typeMap[order.type] ?? order.type,
    name:    order.details?.name  ?? 'Не вказано',
    phone:   order.phone          ?? 'Не вказано',
    message: order.details?.message,
    source:  'сайт',
  });
}
