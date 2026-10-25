import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../features/auth/authSlice';
import api from '../../services/api';

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, role } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post(`/auth/${role?.toLowerCase()}/logout`);
    } catch (error) {
      console.error('Logout failed', error);
    } finally {
      dispatch(logout());
      navigate('/login');
    }
  };

  // Role based menus
  const navLinks = {
    UCI: [
      { path: '/dashboard', label: 'Dashboard' },
      { path: '/campaigns', label: 'Campaigns' },
      { path: '/planning', label: 'Planning' },
      { path: '/sheets', label: 'Sheets' },
    ],
    AIC: [
      { path: '/dashboard', label: 'Dashboard' },
      { path: '/assignments', label: 'Assignments' },
    ],
    FIELD: [
      { path: '/dashboard', label: 'Dashboard' },
      { path: '/tasks', label: 'My Tasks' },
    ],
  };

  const currentLinks = navLinks[role] || navLinks['UCI'];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r transform transition-transform md:translate-x-0 md:static ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-5 border-b">
          <h1 className="text-xl font-bold">UCI Portal</h1>
          <p className="text-xs text-gray-500 mt-1">{user?.uciName || role}</p>
        </div>

        <nav className="p-4 space-y-1">
          {currentLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md text-sm ${
                  isActive ? 'bg-black text-white' : 'text-gray-700 hover:bg-gray-100'
                }`
              }
              onClick={() => setIsSidebarOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t">
          <button
            onClick={handleLogout}
            className="w-full px-3 py-2 text-sm bg-red-50 text-red-600 rounded-md hover:bg-red-100"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="h-14 bg-white border-b flex items-center justify-between px-4">
          <button
            className="md:hidden"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            ☰
          </button>
          <div className="text-sm">
            <span className="text-gray-500">Logged in as: </span>
            <span className="font-medium">{user?.username || user?.uciName}</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
