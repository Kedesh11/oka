import { redirect } from "next/navigation";

export default function VoyagesRedirectPage() {
  redirect("/dashboard/agence?tab=voyages");
}
