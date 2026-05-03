import { redirect } from "next/navigation";

/** קישור ישן מתשלום אונליין — מפנה לרשימת הסדנאות */
export default function WorkshopsSuccessRedirectPage() {
  redirect("/workshops");
}
