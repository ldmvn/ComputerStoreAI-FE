import { ProfileCardSkeleton } from '@/components/ui/PageSkeletons';

export default function Loading() {
  return <ProfileCardSkeleton mode="cards" stats={3} rows={4} label="Đang tải địa chỉ" />;
}
