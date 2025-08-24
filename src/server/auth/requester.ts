import { prisma } from "@/server/db/prisma";

export type Requester = {
  email?: string;
  role: "Admin" | "Agence" | "Client" | string;
  userId?: number;
  agenceId?: number | null;
  isAgencyOwner?: boolean;
};

export async function getRequesterFromHeaders(headers: Headers): Promise<Requester> {
  const email = headers.get("x-user-email") || undefined;
  const role = (headers.get("x-user-role") || "").trim() as Requester["role"];
  const agenceIdHeader = headers.get("x-user-agence-id");
  if (!email) {
    const agenceId = agenceIdHeader != null && agenceIdHeader !== "" && !Number.isNaN(Number(agenceIdHeader))
      ? Number(agenceIdHeader)
      : null;
    return { email: undefined, role: role || "Client", agenceId };
  }
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, role: true, agenceId: true } });
  let isAgencyOwner = false;
  if (user?.agenceId) {
    const ag = await prisma.agence.findUnique({ where: { id: user.agenceId }, select: { email: true } });
    if (ag?.email && ag.email.toLowerCase() === email.toLowerCase()) isAgencyOwner = true;
  }
  return {
    email,
    role: (user?.role as any) || role || "Client",
    userId: user?.id,
    agenceId: user?.agenceId ?? null,
    isAgencyOwner,
  };
}
