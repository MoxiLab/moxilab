import { Header } from '@/sections/Header';
import { Footer } from '@/sections/Footer';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { HomePage } from '@/pages/HomePage';
import { CommandsPage } from '@/pages/CommandsPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { ServerPage } from '@/pages/ServerPage';
import { PremiumPage } from '@/pages/PremiumPage';
import { ModuleLandingPage } from '@/pages/ModuleLandingPage';
import { ResourceLandingPage } from '@/pages/ResourceLandingPage';
import { ModuleConfigPage } from './pages/ModuleConfigPage';

function App() {
  const { pathname } = useLocation();
  const isStyledLandingRoute = /\/(modules|resources)\/[^/]+$/.test(pathname);

  return (
    <div className={isStyledLandingRoute ? 'min-h-screen bg-gradient-to-br from-[#1a1630] via-[#13192c] to-[#10263a]' : 'min-h-screen bg-background'}>
      <Toaster position="bottom-right" richColors />
      <Header />
      <Routes>
        <Route path="/" element={<Navigate to="/es" replace />} />
        <Route path="/:lang" element={<HomePage />} />
        <Route path="/:lang/modules/:moduleId" element={<ModuleLandingPage />} />
        <Route path="/:lang/resources/:resourceId" element={<ResourceLandingPage />} />
        <Route path="/commands" element={<CommandsPage />} />
        <Route path="/:lang/commands" element={<CommandsPage />} />
        <Route path="/:lang/comandos" element={<CommandsPage />} />
        <Route path="/:lang/命令" element={<CommandsPage />} />
        <Route path="/:lang/コマンド" element={<CommandsPage />} />
        <Route path="/:lang/명령어" element={<CommandsPage />} />
        <Route path="/premium" element={<PremiumPage />} />
        <Route path="/:lang/premium" element={<PremiumPage />} />
        <Route path="/:lang/高级版" element={<PremiumPage />} />
        <Route path="/:lang/プレミアム" element={<PremiumPage />} />
        <Route path="/:lang/프리미엄" element={<PremiumPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/:lang/dashboard" element={<DashboardPage />} />
        <Route path="/:lang/panel" element={<DashboardPage />} />
        <Route path="/:lang/面板" element={<DashboardPage />} />
        <Route path="/:lang/ダッシュボード" element={<DashboardPage />} />
        <Route path="/:lang/대시보드" element={<DashboardPage />} />
        <Route path="/dashboard/servers/:guildId" element={<ServerPage />} />
        <Route path="/:lang/dashboard/servers/:guildId" element={<ServerPage />} />
        <Route path="/:lang/panel/servers/:guildId" element={<ServerPage />} />
        <Route path="/dashboard/servers/:guildId/modules/:moduleId" element={<ModuleConfigPage />} />
        <Route path="/:lang/dashboard/servers/:guildId/modules/:moduleId" element={<ModuleConfigPage />} />
        <Route path="/:lang/panel/servers/:guildId/modules/:moduleId" element={<ModuleConfigPage />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
