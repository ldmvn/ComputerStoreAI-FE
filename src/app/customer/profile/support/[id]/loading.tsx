import { ProfileCardSkeleton } from '@/components/ui/PageSkeletons';

export default function Loading() {
  return <ProfileCardSkeleton mode="list" rows={3} label="Đang tải yêu cầu hỗ trợ" />;
}
