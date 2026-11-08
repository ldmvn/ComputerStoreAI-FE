import { Skeleton } from '@/components/ui/Skeleton';

export function HomePageSkeleton() {
  return (
    <div role="status" aria-busy="true" aria-label="Đang tải trang chủ">
      <div className="container mx-auto space-y-4 px-3 py-4 lg:px-4">
        <div className="grid gap-4 lg:grid-cols-[17rem_minmax(0,1fr)_22rem]">
          <div className="hidden space-y-3 rounded-xl border border-slate-200 bg-white p-4 lg:block">
            {Array.from({ length: 11 }, (_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-7 w-7 shrink-0 rounded-md" />
                <Skeleton className="h-4 w-3/4 rounded" />
              </div>
            ))}
          </div>
          <Skeleton className="aspect-[16/9] w-full rounded-xl lg:aspect-auto lg:h-[26rem]" />
          <div className="hidden gap-4 lg:grid lg:grid-rows-2">
            <Skeleton className="h-full w-full rounded-xl" />
            <Skeleton className="h-full w-full rounded-xl" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map(i => <Skeleton key={i} className="aspect-[16/6] w-full rounded-xl" />)}
        </div>
        <div className="space-y-4 pt-4">
          <Skeleton className="h-7 w-64 rounded-lg" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="space-y-3 rounded-xl border border-slate-200 bg-white p-3">
                <Skeleton className="aspect-square w-full rounded-lg" />
                <Skeleton className="h-4 w-full rounded" />
                <Skeleton className="h-4 w-1/2 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

type InfoVariant = 'article' | 'cards' | 'faq' | 'form';

function InfoBody({ variant }: { variant: InfoVariant }) {
  if (variant === 'faq') {
    return (
      <div className="space-y-6">
        <Skeleton className="h-11 w-full max-w-md rounded-xl" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-9 w-28 rounded-full" />)}
        </div>
        <div className="space-y-3">
          {Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
        </div>
      </div>
    );
  }
  if (variant === 'cards') {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        {[0, 1].map(i => (
          <div key={i} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <Skeleton className="h-48 w-full rounded-none" />
            <div className="space-y-3 p-5">
              <Skeleton className="h-5 w-2/3 rounded" />
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-5/6 rounded" />
              <Skeleton className="h-4 w-1/2 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (variant === 'form') {
    return (
      <div className="grid gap-6 lg:grid-cols-3">
        {[0, 1, 2].map(i => (
          <div key={i} className="space-y-3 rounded-xl border border-slate-200 bg-white p-5">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <Skeleton className="h-5 w-1/2 rounded" />
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-3/4 rounded" />
          </div>
        ))}
        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 lg:col-span-3">
          <Skeleton className="h-5 w-48 rounded" />
          {[0, 1, 2].map(i => <Skeleton key={i} className="h-11 w-full rounded-lg" />)}
          <Skeleton className="h-11 w-40 rounded-lg" />
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-8">
      {[0, 1, 2, 3].map(i => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-6 w-1/3 rounded" />
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-11/12 rounded" />
          <Skeleton className="h-4 w-4/5 rounded" />
        </div>
      ))}
    </div>
  );
}

export function InfoPageSkeleton({ variant = 'article', toc = false, label = 'Đang tải nội dung trang' }: { variant?: InfoVariant; toc?: boolean; label?: string }) {
  return (
    <div role="status" aria-busy="true" aria-label={label} className="container mx-auto px-4 py-8 md:py-12">
      <Skeleton className="mb-6 h-4 w-56 rounded" />
      <div className="mb-8 space-y-3 border-b border-slate-200 pb-6">
        <Skeleton className="h-8 w-1/2 max-w-md rounded-lg" />
        <Skeleton className="h-4 w-full max-w-2xl rounded" />
      </div>
      {toc ? (
        <div className="grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
          <div className="hidden space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4 lg:block">
            <Skeleton className="h-3 w-16 rounded" />
            {Array.from({ length: 7 }, (_, i) => <Skeleton key={i} className="h-8 w-full rounded-lg" />)}
          </div>
          <InfoBody variant={variant} />
        </div>
      ) : (
        <InfoBody variant={variant} />
      )}
    </div>
  );
}

export function AuthPageSkeleton() {
  return (
    <main role="status" aria-busy="true" aria-label="Đang tải trang đăng nhập" className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <Skeleton className="mx-auto h-8 w-40 rounded-lg" />
        <Skeleton className="mx-auto h-4 w-56 rounded" />
        <Skeleton className="h-11 w-full rounded-lg" />
        <Skeleton className="h-11 w-full rounded-lg" />
        <Skeleton className="h-11 w-full rounded-xl" />
        <Skeleton className="h-4 w-1/2 rounded" />
      </div>
    </main>
  );
}

export function StatusCardSkeleton({ label = 'Đang xử lý' }: { label?: string }) {
  return (
    <main role="status" aria-busy="true" aria-label={label} className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-md space-y-4 rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <Skeleton className="mx-auto h-14 w-14 rounded-full" />
        <Skeleton className="mx-auto h-6 w-2/3 rounded" />
        <Skeleton className="mx-auto h-4 w-5/6 rounded" />
        <Skeleton className="mx-auto h-11 w-40 rounded-xl" />
      </div>
    </main>
  );
}

export function BuildPcChooserSkeleton() {
  return (
    <div role="status" aria-busy="true" aria-label="Đang tải trang xây dựng PC" className="container mx-auto max-w-lg px-4 py-12">
      <Skeleton className="mb-3 h-8 w-3/4 rounded-lg" />
      <Skeleton className="mb-8 h-4 w-full rounded" />
      <div className="flex flex-col gap-4">
        {[0, 1].map(i => (
          <div key={i} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5">
            <Skeleton className="h-12 w-12 shrink-0 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-1/2 rounded" />
              <Skeleton className="h-4 w-full rounded" />
            </div>
            <Skeleton className="h-5 w-5 shrink-0 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function AiBuildPcSkeleton() {
  return (
    <div role="status" aria-busy="true" aria-label="Đang tải trang AI Build PC" className="mx-auto max-w-4xl space-y-6 px-2 py-4">
      <Skeleton className="h-4 w-40 rounded" />
      <div className="space-y-3">
        <Skeleton className="h-10 w-full max-w-xl rounded-lg" />
        <Skeleton className="h-10 w-3/4 max-w-lg rounded-lg" />
      </div>
      <div className="flex flex-wrap gap-4">
        {[0, 1, 2].map(i => <Skeleton key={i} className="h-4 w-56 rounded" />)}
      </div>
      <Skeleton className="h-32 w-full rounded-2xl" />
      <div className="space-y-3">
        <Skeleton className="h-3 w-24 rounded" />
        <div className="flex flex-wrap gap-3">
          {[48, 40, 64, 56].map((w, i) => <Skeleton key={i} className="h-10 rounded-full" style={{ width: `${w * 0.28}rem` }} />)}
        </div>
      </div>
      <div className="space-y-3">
        <Skeleton className="h-3 w-40 rounded" />
        <div className="flex flex-wrap gap-3">
          {Array.from({ length: 7 }, (_, i) => <Skeleton key={i} className="h-10 w-32 rounded-full" />)}
        </div>
      </div>
    </div>
  );
}

export function ManualBuildSkeleton() {
  return (
    <div role="status" aria-busy="true" aria-label="Đang tải trang tự chọn linh kiện" className="w-full space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64 rounded-lg" />
        <Skeleton className="h-4 w-full max-w-2xl rounded" />
      </div>
      <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-[minmax(0,1fr)_280px] lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="flex items-center gap-4 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
              <Skeleton className="h-12 w-12 shrink-0 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3 rounded" />
                <Skeleton className="h-3 w-1/2 rounded" />
              </div>
              <Skeleton className="h-9 w-24 rounded-lg" />
            </div>
          ))}
        </div>
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
          <Skeleton className="h-5 w-1/2 rounded" />
          {[0, 1, 2].map(i => <Skeleton key={i} className="h-4 w-full rounded" />)}
          <Skeleton className="h-8 w-2/3 rounded" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function ProfileCardSkeleton({ mode = 'list', stats = 0, rows = 4, label = 'Đang tải' }: { mode?: 'list' | 'form' | 'cards'; stats?: number; rows?: number; label?: string }) {
  return (
    <div role="status" aria-busy="true" aria-label={label} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-40 rounded" />
          <Skeleton className="h-3 w-28 rounded" />
        </div>
      </div>
      {stats > 0 && (
        <div className="grid border-b border-slate-100" style={{ gridTemplateColumns: `repeat(${stats}, minmax(0, 1fr))` }}>
          {Array.from({ length: stats }, (_, i) => (
            <div key={i} className="space-y-2 px-5 py-4">
              <Skeleton className="h-3 w-16 rounded" />
              <Skeleton className="h-6 w-10 rounded" />
            </div>
          ))}
        </div>
      )}
      <div className="p-5">
        {mode === 'form' && (
          <div className="grid gap-5 sm:grid-cols-2">
            {Array.from({ length: rows }, (_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3 w-24 rounded" />
                <Skeleton className="h-11 w-full rounded-lg" />
              </div>
            ))}
            <Skeleton className="h-11 w-40 rounded-lg sm:col-span-2" />
          </div>
        )}
        {mode === 'list' && (
          <div className="space-y-4">
            {Array.from({ length: rows }, (_, i) => (
              <div key={i} className="flex items-center gap-4 border-b border-slate-100 pb-4 last:border-b-0 last:pb-0">
                <Skeleton className="h-14 w-14 shrink-0 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-2/3 rounded" />
                  <Skeleton className="h-3 w-1/3 rounded" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            ))}
          </div>
        )}
        {mode === 'cards' && (
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: rows }, (_, i) => (
              <div key={i} className="space-y-3 rounded-xl border border-slate-200 p-4">
                <Skeleton className="h-4 w-1/2 rounded" />
                <Skeleton className="h-3 w-full rounded" />
                <Skeleton className="h-3 w-3/4 rounded" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function OrderDetailSkeleton() {
  return (
    <div role="status" aria-busy="true" aria-label="Đang tải đơn hàng" className="mx-auto max-w-3xl space-y-5">
      <Skeleton className="h-4 w-40 rounded" />
      <Skeleton className="h-20 w-full rounded-2xl" />
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
        {[0, 1, 2].map(i => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 shrink-0 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4 rounded" />
              <Skeleton className="h-3 w-1/3 rounded" />
            </div>
            <Skeleton className="h-5 w-20 rounded" />
          </div>
        ))}
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Skeleton className="h-36 w-full rounded-2xl" />
        <Skeleton className="h-36 w-full rounded-2xl" />
      </div>
    </div>
  );
}
