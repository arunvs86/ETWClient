// src/utils/datetime.ts
export function todayISO(): string {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
  
  export function addDaysISO(yyyyMmDd: string, days: number): string {
    const [y, m, d] = yyyyMmDd.split('-').map(Number);
    const dt = new Date(Date.UTC(y, (m - 1), d));
    dt.setUTCDate(dt.getUTCDate() + days);
    const y2 = dt.getUTCFullYear();
    const m2 = String(dt.getUTCMonth() + 1).padStart(2, '0');
    const d2 = String(dt.getUTCDate()).padStart(2, '0');
    return `${y2}-${m2}-${d2}`;
  }
  
  export function formatLocalTimeRange(startISO: string, endISO: string) {
    const s = new Date(startISO);
    const e = new Date(endISO);
    const sameDay = s.toDateString() === e.toDateString();
    const timeFmt: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' };
    const dateFmt: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' };
    const sTime = new Intl.DateTimeFormat(undefined, timeFmt).format(s);
    const eTime = new Intl.DateTimeFormat(undefined, timeFmt).format(e);
    const date = new Intl.DateTimeFormat(undefined, dateFmt).format(s);
    return { date, range: sameDay ? `${sTime} – ${eTime}` : `${s.toLocaleString()} – ${e.toLocaleString()}` };
  }
  
  export function groupSlotsByLocalDate<T extends { local: { date: string } }>(slots: T[]) {
    const map = new Map<string, T[]>();
    for (const s of slots) {
      const key = s.local.date;
      const arr = map.get(key) || [];
      arr.push(s);
      map.set(key, arr);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .map(([date, list]) => ({ date, slots: list.sort((x, y) => (x.startAt < y.startAt ? -1 : 1)) }));
  }
  