import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import GuestLayout from '../components/layout/GuestLayout';
import BettorLayout from '../components/layout/BettorLayout';
import AdminLayout from '../components/layout/AdminLayout';

// Pages
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Profile from '../pages/Profile';
import Matches from '../pages/Matches';
import MatchDetail from '../pages/MatchDetail';
import Teams from '../pages/Teams';
import TeamDetail from '../pages/TeamDetail';
import Leaderboard from '../pages/Leaderboard';
import MyBets from '../pages/MyBets';
import ChampionBet from '../pages/ChampionBet';

// Admin pages
import Dashboard from '../pages/admin/Dashboard';
import SeasonManage from '../pages/admin/SeasonManage';
import TeamManage from '../pages/admin/TeamManage';
import MatchManage from '../pages/admin/MatchManage';
import OddsManage from '../pages/admin/OddsManage';
import UserManage from '../pages/admin/UserManage';

/** Route guard: redirects to /login if not authenticated */
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

/** Route guard: redirects to / if not admin */
function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { isAdmin } = useAuth();
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Guest layout: public pages */}
      <Route element={<GuestLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/matches" element={<Matches />} />
        <Route path="/matches/:id" element={<MatchDetail />} />
        <Route path="/teams" element={<Teams />} />
        <Route path="/teams/:id" element={<TeamDetail />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
      </Route>

      {/* Bettor layout: authenticated pages */}
      <Route
        element={
          <RequireAuth>
            <BettorLayout />
          </RequireAuth>
        }
      >
        <Route path="/profile" element={<Profile />} />
        <Route path="/my-bets" element={<MyBets />} />
        <Route path="/champion-bet" element={<ChampionBet />} />
      </Route>

      {/* Admin layout: admin-only pages */}
      <Route
        element={
          <RequireAuth>
            <RequireAdmin>
              <AdminLayout />
            </RequireAdmin>
          </RequireAuth>
        }
      >
        <Route path="/admin" element={<Dashboard />} />
        <Route path="/admin/seasons" element={<SeasonManage />} />
        <Route path="/admin/teams" element={<TeamManage />} />
        <Route path="/admin/matches" element={<MatchManage />} />
        <Route path="/admin/odds" element={<OddsManage />} />
        <Route path="/admin/users" element={<UserManage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
