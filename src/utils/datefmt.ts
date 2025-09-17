// src/utils/datefmt.ts
export function fmtDateTime(iso: string) {
    const d = new Date(iso);
    const date = new Intl.DateTimeFormat(undefined, { weekday: 'short', month: 'short', day: 'numeric' }).format(d);
    const time = new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }).format(d);
    return { date, time };
  }
  export function isPast(iso: string) {
    return new Date(iso).getTime() < Date.now();
  }
  