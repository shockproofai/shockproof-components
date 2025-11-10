import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { AuthTestPage } from './pages/AuthTestPage';
import { ChatTestPage } from './pages/ChatTestPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth-test" element={<AuthTestPage />} />
        <Route path="/chat-test" element={<ChatTestPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
