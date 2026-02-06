import { PaymentDetailPage } from "@/features/PaymentDetailPage";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PaymentDetail({ params }: PageProps) {
  const { id } = await params;
  return <PaymentDetailPage id={id} />;
}
