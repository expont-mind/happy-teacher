import { ChildLogsPage } from "@/features/ChildLogsPage";

export default async function ChildLogs({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ChildLogsPage childId={id} />;
}
