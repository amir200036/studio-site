/**
 * פריסת כרטיסים בלי כרטיס יתום בסוף.
 *
 * רשת של 3 עמודות עם 4 כרטיסים משאירה כרטיס בודד בשורה השנייה, ועם 5 —
 * שניים צמודים לצד אחד. 2 ו-4 נפרסים ב-2 עמודות; כל מספר אחר ב-3 עמודות,
 * והשורה האחרונה ממורכזת (flex-wrap + justify-center).
 */
export function cardGrid(count: number): { container: string; item: string } {
  const twoColumns = count === 2 || count === 4;
  return {
    container: "flex flex-wrap justify-center gap-6",
    item: twoColumns
      ? "w-full md:w-[calc((100%_-_1.5rem)/2)]"
      : "w-full md:w-[calc((100%_-_1.5rem)/2)] lg:w-[calc((100%_-_3rem)/3)]",
  };
}
