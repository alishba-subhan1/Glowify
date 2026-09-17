/**
 * Booking `date` is stored in MongoDB as an ISO calendar string YYYY-MM-DD (HTML date input).
 * Parse as local calendar day to avoid UTC shift.
 */
export function formatAppointmentDate(isoDate, locale) {
  if (!isoDate) return "—";
  const s = String(isoDate).trim();
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return s;
  const [, y, mo, d] = m;
  const dt = new Date(Number(y), Number(mo) - 1, Number(d));
  if (Number.isNaN(dt.getTime())) return s;
  return dt.toLocaleDateString(locale, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

/** Short note so you can cross-check Compass / Mongo: exact field value */
export function storageDateCaption(isoDate) {
  if (!isoDate) return "";
  const s = String(isoDate).trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return "";
  return `Database field date: ${s}`;
}
