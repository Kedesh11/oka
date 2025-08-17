import { redirect } from "next/navigation";

export default function FleetRedirectPage() {
  redirect("/dashboard/agence?tab=fleet");
}
