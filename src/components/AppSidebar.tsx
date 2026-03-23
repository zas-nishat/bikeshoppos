import * as React from 'react';
import { LayoutDashboard, Bike, Users, ShoppingCart, Receipt, Package, Wallet, BarChart3, LogOut, Moon, Sun } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useStore } from '@/store/useStore';
import { ROLE_PERMISSIONS } from '@/types';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter, useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';

const navItems = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard, key: 'dashboard' },
  { title: 'POS / Sales', url: '/pos', icon: ShoppingCart, key: 'pos' },
  { title: 'Bikes', url: '/bikes', icon: Bike, key: 'bikes' },
  { title: 'Customers', url: '/customers', icon: Users, key: 'customers' },
  { title: 'EMI Tracking', url: '/emi', icon: Receipt, key: 'emi' },
  { title: 'Inventory', url: '/inventory', icon: Package, key: 'inventory' },
  { title: 'Expenses', url: '/expenses', icon: Wallet, key: 'expenses' },
  { title: 'Reports', url: '/reports', icon: BarChart3, key: 'reports' },
];

export function AppSidebar() {
  const { state, isMobile, setOpenMobile } = useSidebar();
  const collapsed = state === 'collapsed';
  const { currentUser, logout, darkMode, toggleDarkMode } = useStore();
  const [logoutDialogOpen, setLogoutDialogOpen] = React.useState(false);

  const allowedPages = currentUser ? ROLE_PERMISSIONS[currentUser.role] : [];
  const visibleItems = navItems.filter((item) => allowedPages.includes(item.key));

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <div className="flex items-center gap-2 px-4 py-5 border-b border-sidebar-border">
        <div className="h-8 w-8 rounded-lg bg-sidebar-primary flex items-center justify-center flex-shrink-0">
          <Bike className="h-4 w-4 text-sidebar-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="animate-fade-in">
            <p className="text-sm font-bold text-sidebar-accent-foreground tracking-tight">BikeHub POS</p>
            <p className="text-[10px] text-sidebar-foreground uppercase tracking-widest">Showroom</p>
          </div>
        )}
      </div>
      <SidebarContent className="scrollbar-thin">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-widest">Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === '/'}
                      className="hover:bg-sidebar-accent/60 transition-colors duration-150"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-semibold"
                      onClick={() => {
                        if (isMobile) {
                          setOpenMobile(false);
                        }
                      }}
                    >
                      <item.icon className="mr-2 h-4 w-4 flex-shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-3 space-y-2">
        <Button variant="ghost" size="sm" onClick={toggleDarkMode} className="w-full justify-start text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/60">
          {darkMode ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
          {!collapsed && (darkMode ? 'Light Mode' : 'Dark Mode')}
        </Button>
        {currentUser && (
          <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full justify-start text-sidebar-foreground hover:text-destructive hover:bg-sidebar-accent/60">
                <LogOut className="h-4 w-4 mr-2" />
                {!collapsed && 'Logout'}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Logout</DialogTitle>
                <DialogDescription>
                  Are you sure you want to logout? You will be redirected to the login page.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="secondary" size="sm">Cancel</Button>
                </DialogClose>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    logout();
                    setLogoutDialogOpen(false);
                  }}
                >
                  Confirm
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
