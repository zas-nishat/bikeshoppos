import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { useStore } from '@/store/useStore';
import { Badge } from '@/components/ui/badge';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { currentUser } = useStore();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b bg-card px-4 sticky top-0 z-30">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <span className="text-sm font-medium text-muted-foreground hidden sm:block">Bike Showroom POS</span>
            </div>
            {currentUser && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-foreground font-medium hidden sm:block">{currentUser.name}</span>
                <Badge variant="secondary" className="capitalize text-[10px]">{currentUser.role}</Badge>
              </div>
            )}
          </header>
          <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
