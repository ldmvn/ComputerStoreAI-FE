import { ProfileCardSkeleton } from '@/components/ui/PageSkeletons';

export default function Loading() {
  return <ProfileCardSkeleton mode="list" stats={3} rows={3} label="Đang tải đánh giá" />;
}
