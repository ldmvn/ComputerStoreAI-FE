import { ProfileCardSkeleton } from '@/components/ui/PageSkeletons';

export default function Loading() {
  return <ProfileCardSkeleton mode="list" stats={4} rows={4} label="Đang tải đơn hàng" />;
}
