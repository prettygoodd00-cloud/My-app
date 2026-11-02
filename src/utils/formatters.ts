export function formatPrice(price: number): string {
  const formatted = new Intl.NumberFormat('ru-KZ', {
    maximumFractionDigits: 0,
  }).format(price);
  return `${formatted} ₸`;
}

export function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

export function getOrderStatusInfo(status: string): { label: string; bg: string; text: string; border: string } {
  switch (status) {
    case 'pending':
      return {
        label: 'Ожидает подтверждения',
        bg: 'bg-amber-50',
        text: 'text-amber-800',
        border: 'border-amber-200',
      };
    case 'processing':
      return {
        label: 'В обработке в ателье',
        bg: 'bg-stone-100',
        text: 'text-stone-800',
        border: 'border-stone-300',
      };
    case 'shipped':
      return {
        label: 'Передан курьеру',
        bg: 'bg-blue-50',
        text: 'text-blue-900',
        border: 'border-blue-200',
      };
    case 'delivered':
      return {
        label: 'Доставлен клиенту',
        bg: 'bg-emerald-50',
        text: 'text-emerald-900',
        border: 'border-emerald-200',
      };
    case 'cancelled':
      return {
        label: 'Отменен',
        bg: 'bg-rose-50',
        text: 'text-rose-800',
        border: 'border-rose-200',
      };
    default:
      return {
        label: status,
        bg: 'bg-stone-50',
        text: 'text-stone-700',
        border: 'border-stone-200',
      };
  }
}
