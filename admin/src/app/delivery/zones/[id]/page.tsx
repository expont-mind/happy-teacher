import { DeliveryZoneDetailPage } from "@/features/DeliveryZoneDetailPage";

export default async function ZoneDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <DeliveryZoneDetailPage zoneId={id} />;
}
