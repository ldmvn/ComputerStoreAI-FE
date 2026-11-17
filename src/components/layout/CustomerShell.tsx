import Header from './Header';
import Footer from './Footer';
import FloatingSupportWidget from './support-widget/FloatingSupportWidget';
import CategoryHeroBackdrop from './CategoryHeroBackdrop';
import MobileBottomNav from './MobileBottomNav';

export default function CustomerShell({ children, contentClassName = 'flex-1', fillViewport = true, compactFooter = false }: {
  children: React.ReactNode;
  contentClassName?: string;
  fillViewport?: boolean;
  compactFooter?: boolean;
}) {
  return (
    <div className={`flex flex-col pb-[calc(3.5rem+env(safe-area-inset-bottom))] lg:pb-0 ${fillViewport ? 'min-h-screen' : ''}`}>
      <Header />
      <CategoryHeroBackdrop />
      <main className={contentClassName}>{children}</main>
      <Footer compact={compactFooter} />
      <FloatingSupportWidget />
      <MobileBottomNav />
    </div>
  );
}
