import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import BoardListPage from './pages/BoardListPage';
import BoardDetailPage from './pages/BoardDetailPage';
import BoardFormPage from './pages/BoardFormPage';
import UserManagementPage from './pages/UserManagementPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-900 text-white">
          <Navbar />
          <main className="max-w-screen-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <Routes>
              {/* 공개 라우트 */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />

              {/* 인증이 필요한 라우트 (USER, ADMIN 공통) */}
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<BoardListPage />} />
                <Route path="/board/:id" element={<BoardDetailPage />} />
                <Route path="/board/new" element={<BoardFormPage />} />
                <Route path="/board/edit/:id" element={<BoardFormPage />} />
              </Route>

              {/* 관리자 권한이 필요한 라우트 (ADMIN 전용) */}
              <Route element={<ProtectedRoute requiredRole="ROLE_ADMIN" />}>
                <Route path="/admin" element={<UserManagementPage />} />
              </Route>
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
