/** סדנאות פעילות להצגה באתר / sitemap: בלי מועד קבוע או עם מועד עתידי */
export function visiblePublicWorkshopsWhere() {
  return {
    status: "active" as const,
    OR: [{ date: null }, { date: { gte: new Date() } }],
  };
}
