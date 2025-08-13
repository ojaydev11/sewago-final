'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Menu,
  X,
  MapPin,
  Phone,
  User,
  Settings,
  LogOut,
  Globe,
  Shield,
  Briefcase
} from "lucide-react";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useLanguage } from "@/providers/language";

// Prevent SSR issues by only rendering on client
export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { data: session, status } = useSession();
  const { lang, setLang } = useLanguage();
  
  // Prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Show loading state during SSR
  if (!isClient || status === 'loading') {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-6 w-24 bg-gray-200 rounded animate-pulse ml-2"></div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  const navigation = [
    { name: "Services", href: "/services" },
    { name: "Pricing", href: "/pricing" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  const getRoleBasedRedirect = () => {
    if (!session?.user) return "/dashboard";
    
    switch (session.user.role) {
      case "customer":
        return "/dashboard";
      case "provider":
        return "/provider";
      case "admin":
        return "/admin";
      default:
        return "/dashboard";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "customer":
        return "Customer";
      case "provider":
        return "Provider";
      case "admin":
        return "Admin";
      default:
        return "User";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "customer":
        return <User className="h-4 w-4" />;
      case "provider":
        return <Briefcase className="h-4 w-4" />;
      case "admin":
        return <Shield className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-bold text-gray-900">SewaGo</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-gray-700 hover:text-primary transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Right Section */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Language Toggle */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                                       <Button variant="ghost" size="sm">
                         <Globe className="h-4 w-4 mr-2" />
                         {lang === 'en' ? 'EN' : 'NE'}
                       </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                                       <DropdownMenuItem onClick={() => setLang('en')}>
                         English
                       </DropdownMenuItem>
                       <DropdownMenuItem onClick={() => setLang('ne')}>
                         नेपाली
                       </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Auth Section */}
            {session?.user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={session.user.image || ""} />
                      <AvatarFallback>
                        {session.user.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:block">{session.user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel>
                    <div className="flex items-center space-x-2">
                      {getRoleIcon(session.user.role)}
                      <span>{getRoleLabel(session.user.role)}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={getRoleBasedRedirect()}>
                      <User className="h-4 w-4 mr-2" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/account">
                      <Settings className="h-4 w-4 mr-2" />
                      Account Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button variant="ghost" size="sm">
                    Sign Up
                  </Button>
                </Link>
                <Link href="/services">
                  <Button size="sm" className="bg-primary hover:bg-primary/90">
                    Book Now
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="space-y-1 pb-3 pt-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* Language Toggle Mobile */}
              <div className="px-3 py-2">
                <div className="flex space-x-2">
                                           <Button
                           variant={lang === 'en' ? 'default' : 'outline'}
                           size="sm"
                           onClick={() => setLang('en')}
                         >
                           EN
                         </Button>
                         <Button
                           variant={lang === 'ne' ? 'default' : 'outline'}
                           size="sm"
                           onClick={() => setLang('ne')}
                         >
                           NE
                         </Button>
                </div>
              </div>

              <div className="pt-4 space-y-2">
                {session?.user ? (
                  <>
                    <div className="px-3 py-2 border-t">
                      <div className="flex items-center space-x-2 mb-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={session.user.image || ""} />
                          <AvatarFallback>
                            {session.user.name?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{session.user.name}</p>
                          <p className="text-xs text-gray-500">{getRoleLabel(session.user.role)}</p>
                        </div>
                      </div>
                    </div>
                    <Link href={getRoleBasedRedirect()}>
                      <Button variant="ghost" className="w-full justify-start">
                        Dashboard
                      </Button>
                    </Link>
                    <Link href="/account">
                      <Button variant="ghost" className="w-full justify-start">
                        Account Settings
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-red-600 hover:text-red-700"
                      onClick={handleSignOut}
                    >
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/auth/login">
                      <Button variant="ghost" className="w-full justify-start">
                        Login
                      </Button>
                    </Link>
                    <Link href="/auth/register">
                      <Button variant="ghost" className="w-full justify-start">
                        Sign Up
                      </Button>
                    </Link>
                    <Link href="/services">
                      <Button className="w-full bg-primary hover:bg-primary/90">
                        Book Now
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
