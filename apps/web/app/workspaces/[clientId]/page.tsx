import { redirect } from "next/navigation";

export default async function ClientWorkspaceRedirect({
  params
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;

  redirect(`/clients/${clientId}`);
}
