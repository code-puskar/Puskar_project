import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Map, User, LogOut, Loader2, LayoutList } from 'lucide-react';
import { buttonVariants } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup
} from '../ui/menu';

export function Navbar() {
  const { user, isLoading, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo Section */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-primary text-primary-foreground p-1.5 rounded-md transition-colors">
            <Map className="w-4 h-4" />
          </div>
          <span className="font-semibold text-sm tracking-tight text-foreground flex items-center gap-1.5">
            RoadmapHub
          </span>
        </Link>

        {/* Right Nav */}
        <div className="flex items-center gap-4">
          <Link to="/roadmap" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Roadmap
          </Link>

          {user?.role === 'admin' && (
            <Link to="/admin" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors ml-2">
              Admin
            </Link>
          )}

          <div className="h-4 w-px bg-border mx-2" />

          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          ) : user ? (
            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger className="relative h-8 w-8 rounded-full focus:outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                  <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center border border-border">
                    <User className="h-4 w-4 text-secondary-foreground" />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer w-full flex items-center">
                      <LayoutList className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} variant="destructive" className="cursor-pointer flex items-center">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                Sign In
              </Link>
              <Link to="/signup" className={buttonVariants({ size: "sm" })}>
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
