import type { Session } from "next-auth";
import type { Principal } from "@digicolony/shared";

export function principalFromSession(session: Session | null): Principal | null {
  if (!session?.user?.id) {
    return null;
  }

  return {
    kind: "user",
    user: {
      id: session.user.id,
      role: session.user.role,
      clientId: session.user.clientId ?? undefined,
      permissions: session.user.permissions
    }
  };
}
