import { ProfileCardSkeleton } from '@/components/ui/PageSkeletons';

export default function Loading() {
  return <ProfileCardSkeleton mode="form" rows={3} label="Đang tải bảo mật tài khoản" />;
}
