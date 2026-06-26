/** פרטי קשר קבועים של הסטודיו — לא ניתנים לשינוי מהפאנל */

export const STUDIO_ADDRESS = "אבנר בן יהודה 41, נס ציונה";
export const STUDIO_STREET = "אבנר בן יהודה 41";
export const STUDIO_CITY = "נס ציונה";
export const STUDIO_PHONE = "0525771221";

export function formatStudioPhone(phone = STUDIO_PHONE): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10 && digits.startsWith("0")) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return phone;
}

export const STUDIO_MAP_EMBED_URL =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1693.3392116638338!2d34.78527685110109!3d31.915333642324743!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1502b75f9a9475d7%3A0x496e85a16407ed8a!2z15nXkyDXmdeV16bXqNeqIC0g16HXmNeV15PXmdeVINec16fXk9eo15XXqiDXlden16jXnteZ16fXlA!5e0!3m2!1siw!2sil!4v1777821449278!5m2!1siw!2sil";
