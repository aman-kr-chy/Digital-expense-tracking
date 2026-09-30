import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Groups from './pages/Groups';
import Friends from './pages/Friends';
import AddExpense from './pages/AddExpense';
import SettleUp from './pages/SettleUp';
import { VisitorCountProvider } from './components/VisitorCount';

const PrivateRoute = ({ children }) => {
  const { userInfo } = useSelector((state) => state.auth);
  return userInfo ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <VisitorCountProvider>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          <Route
            path="/"
            element={
              <PrivateRoute>
                <MainLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="groups" element={<Groups />} />
            <Route path="friends" element={<Friends />} />
            <Route path="add-expense" element={<AddExpense />} />
            <Route path="settle-up" element={<SettleUp />} />
          </Route>
        </Routes>
      </VisitorCountProvider>
    </Router>
  );
}

export default App;
