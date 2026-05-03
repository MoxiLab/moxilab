import { Header } from '@/sections/Header';
import { Footer } from '@/sections/Footer';
import { Route, Routes } from 'react-router-dom';
import { HomePage } from '@/pages/HomePage';
import { CommandsPage } from '@/pages/CommandsPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { ServerPage } from '@/pages/ServerPage';
import { ModuleConfigPage } from '@/pages/ModuleConfigPage';

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/commands" element={<CommandsPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/dashboard/servers/:guildId" element={<ServerPage />} />
        <Route path="/dashboard/servers/:guildId/modules/:moduleId" element={<ModuleConfigPage />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
