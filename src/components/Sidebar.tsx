import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  BookOpen, 
  FileText, 
  CreditCard, 
  LogOut, 
  Menu, 
  X,
  User
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    // Desktop (>= lg) sempre expandido; mobile inicia colapsado
    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
    return isDesktop ? false : true;
  });
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, refreshUser } = useAuth();
  // Sincroniza com breakpoint usando resize: desktop sempre expandido, mobile colapsado
  useEffect(() => {
    if (typeof window === "undefined") return;
    const updateByViewport = () => {
      const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
      setIsCollapsed(isDesktop ? false : true);
    };
    updateByViewport();
    window.addEventListener("resize", updateByViewport);
    return () => window.removeEventListener("resize", updateByViewport);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token"); // remove token
    refreshUser()
    toast({
      title: "Logout realizado",
      description: "Até logo!",
    });
    navigate("/");
  };

  const navItems = [
    {
      title: "Meus PDFs",
      href: "/dashboard",
      icon: FileText,
    },
    {
      title: "Comprar Tokens",
      href: "/tokens",
      icon: CreditCard,
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed lg:sticky top-0 left-0 z-50 h-screen
          bg-card border-r border-border/50
          transition-all duration-300 ease-in-out
           ${isCollapsed ? '-translate-x-full lg:translate-x-0' : ''} w-64
          lg:translate-x-0
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border/50">
            {!isCollapsed && (
              <div className="flex items-center gap-2">
                <div className="p-2 gradient-primary rounded-xl">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-lg">My Idea</h2>
                  <p className="text-xs text-muted-foreground">Dashboard</p>
                </div>
              </div>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="lg:hidden"
            >
              {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
            </Button>
          </div>

          {/* User Info */}
          <div className="p-6 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <User className="h-5 w-5 text-primary"/>
              </div>
              {!isCollapsed && (
                <div className="flex-1">
                  <p className="font-medium">{user.email.split('@')[0]}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                    <span className="text-sm font-medium text-primary">{user.tokens} tokens</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <div className="space-y-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  end={item.href === "/dashboard"}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-smooth group ${
                      isActive
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                    }`
                  }
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!isCollapsed && (
                    <span className="font-medium">{item.title}</span>
                  )}
                </NavLink>
              ))}
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border/50">
            <Separator className="mb-4" />
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-5 w-5" />
              {!isCollapsed && "Sair"}
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile toggle button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsCollapsed(false)}
        className={`
          fixed top-4 left-4 z-30 lg:hidden shadow-card
          ${!isCollapsed ? "hidden" : "flex"}
        `}
      >
        <Menu className="h-4 w-4" />
      </Button>
    </>
  );
};

export default Sidebar;