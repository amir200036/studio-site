/** סדנאות פעילות להצגה באתר / sitemap: בלי מועד קבוע או עם מועד עתידי */
export function visiblePublicWorkshopsWhere() {
  return {
    status: "active" as const,
    OR: [{ date: null }, { date: { gte: new Date() } }],
  };
}

/**
 * אותו כלל כמו visiblePublicWorkshopsWhere, לבדיקת סדנה בודדת.
 * בלי זה, סדנה שהמועד שלה עבר יורדת מהרשימה אבל נשארת פתוחה בקישור ישיר.
 */
export function isPubliclyVisibleWorkshop<T extends { status: string; date: Date | null }>(
  workshop: T | null,
  now: Date = new Date()
): workshop is T {
  if (!workshop || workshop.status !== "active") return false;
  return workshop.date === null || workshop.date >= now;
}
