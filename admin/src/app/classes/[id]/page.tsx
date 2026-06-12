import { ClassDetailPage } from "@/features/ClassDetailPage";

export default async function ClassDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ClassDetailPage classId={id} />;
}
