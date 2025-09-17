// src/utils/money.ts
export function formatMoneyMinor(amountMinor?: number, currency: string = 'GBP') {
    if (amountMinor == null) return '';
    const amt = amountMinor / 100;
    try {
      return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amt);
    } catch {
      return `${currency} ${amt.toFixed(2)}`;
    }
  }
  