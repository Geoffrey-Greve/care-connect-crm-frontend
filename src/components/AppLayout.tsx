import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "./ui/button";
import { LogOutIcon } from "lucide-react";
import { useAppDispatch } from "@/redux/store";
import { clearUser } from "@/redux/slice/authSlice";
import { persistor } from "@/redux/store";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const dispatch = useAppDispatch();

  const handleLogout = async () => {
    // Clear user data from Redux state
    dispatch(clearUser());
    
    // Purge persisted Redux state (which includes the token)
    await persistor.purge();
    
    // Clear any manual token entries from localStorage (if any)
    localStorage.removeItem("token");
    
    // Redirect to login page
    window.location.href = "/auth/login";
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center border-b px-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <SidebarTrigger className="h-8 w-8" />
            <div className="ml-4">
              <h1 className="text-lg font-semibold">CareConnect</h1>
              <p className="text-xs text-muted-foreground">By Provider Compliance</p>
            </div>
            <div className="ml-auto">
              <Button variant="destructive" size="icon" onClick={handleLogout}>
                <LogOutIcon className="h-4 w-4" />
              </Button>
            </div>
          </header>
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}