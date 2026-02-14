import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import ChatPage from './pages/ChatPage';
import ModelManager from './pages/ModelManager';
import MCPControls from './pages/MCPControls';
import Settings from './pages/Settings';
import { useSelector } from 'react-redux';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/models"
          element={
            <ProtectedRoute>
              <ModelManager />
            </ProtectedRoute>
          }
        />

        <Route
          path="/mcp"
          element={
            <ProtectedRoute>
              <MCPControls />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />

        {/* Default Redirect */}
        <Route path="*" element={<Navigate to="/chat" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
