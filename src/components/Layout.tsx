import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { HardHat, Home, Users, Briefcase, BarChart3, Settings, LogOut, Menu, X, FileText, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function Layout() {
  const { role, user, signOut } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isAdmin = role === 'ADMIN';

  const navItems = [
    { name: 'Início', path: '/', icon: Home, show: true },
    { name: 'Projetos', path: '/projects', icon: Briefcase, show: true },
    { name: 'Dashboard', path: '/dashboard', icon: BarChart3, show: isAdmin },
    { name: 'Relatórios', path: '/relatorios', icon: FileText, show: isAdmin },
    { name: 'Auditoria (Fotos)', path: '/admin/auditoria', icon: Camera, show: isAdmin },
    { name: 'Funcionários', path: '/admin/funcionarios', icon: Users, show: isAdmin },
    { name: 'Gerenciar Projetos', path: '/admin/projects', icon: HardHat, show: isAdmin },
    { name: 'Usuários', path: '/admin/usuarios', icon: Settings, show: isAdmin },
  ];

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMenu = () => setIsMobileMenuOpen(false);
  
  const userName = user?.email?.split('@')[0].toUpperCase() || 'Usuário';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between bg-blue-950 text-white p-4 shadow-md sticky top-0 z-30">
        <div className="flex items-center space-x-2">
          <HardHat size={24} />
          <span className="font-bold tracking-tight">TARGOS PRESENÇA</span>
        </div>
        <button onClick={toggleMenu} className="p-2 -mr-2">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-blue-950 text-white transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 flex flex-col shadow-xl",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 hidden md:flex items-center space-x-3 mb-6">
          <div className="bg-white/10 p-2 rounded-lg">
            <HardHat size={28} className="text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">TARGOS</span>
        </div>

        <div className="px-4 pb-4">
          <div className="bg-blue-900/50 rounded-xl p-4 mb-6 border border-blue-800/50">
            <p className="text-xs text-blue-300 font-medium uppercase tracking-wider mb-1">Olá,</p>
            <p className="font-semibold truncate">{userName}</p>
            <p className="text-xs text-blue-300 mt-1">{role === 'ADMIN' ? 'Administrador' : 'Operador'}</p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navItems.filter(item => item.show).map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path !== '/' && location.pathname.startsWith(item.path));
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeMenu}
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors font-medium",
                  isActive 
                    ? "bg-blue-900 text-white shadow-sm" 
                    : "text-blue-100 hover:bg-blue-900/50 hover:text-white"
                )}
              >
                <item.icon size={20} className={cn("opacity-80", isActive && "opacity-100")} />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 mt-auto">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-blue-200 hover:text-white hover:bg-red-500/20 hover:text-red-100 py-6"
            onClick={signOut}
          >
            <LogOut size={20} className="mr-3" />
            Sair
          </Button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden animate-in fade-in"
          onClick={closeMenu}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col w-full min-w-0 max-h-screen overflow-y-auto">
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
