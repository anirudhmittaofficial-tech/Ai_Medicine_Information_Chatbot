import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ChatbotUI from './pages/ChatbotUI';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ChatbotUI />} />
        <Route path="/admin/*" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
