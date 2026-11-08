import CustomerShell from '@/components/layout/CustomerShell';
import { HomePageSkeleton } from '@/components/ui/PageSkeletons';

export default function Loading() {
  return (
    <CustomerShell contentClassName="shrink-0" fillViewport={false}>
      <HomePageSkeleton />
    </CustomerShell>
  );
}
