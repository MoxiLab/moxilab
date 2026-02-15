import { Header } from '@/sections/Header';
import { Footer } from '@/sections/Footer';
import { Route, Routes } from 'react-router-dom';
import { HomePage } from '@/pages/HomePage';
import { CommandsPage } from '@/pages/CommandsPage';

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/commands" element={<CommandsPage />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
