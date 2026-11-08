import { ProfileCardSkeleton } from '@/components/ui/PageSkeletons';

export default function Loading() {
  return <ProfileCardSkeleton mode="form" rows={6} label="Đang tải thông tin tài khoản" />;
}
