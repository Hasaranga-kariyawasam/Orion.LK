import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0D1117] relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-[-150px] left-[-150px] w-[400px] h-[400px] rounded-full bg-[#ea364c]/10 blur-[100px] pointer-events-none animate-pulse" />
        <div className="absolute bottom-[-100px] right-[-100px] w-[300px] h-[300px] rounded-full bg-[#ff6b35]/6 blur-[80px] pointer-events-none" />

        <div className="flex flex-col items-center gap-8 z-10">
          {/* Glowing spinner ring */}
          <div className="w-16 h-16 rounded-full border-[2.5px] border-[#ea364c]/20 border-t-[#ea364c] animate-spin"
               style={{ boxShadow: '0 0 20px rgba(234,54,76,0.35)' }} />

          {/* Brand name */}
          <div className="text-center">
            <div className="font-black text-2xl tracking-widest"
                 style={{
                   fontFamily: "'Orbitron', sans-serif",
                   background: 'linear-gradient(135deg, #ea364c, #ff6b35)',
                   WebkitBackgroundClip: 'text',
                   WebkitTextFillColor: 'transparent',
                   filter: 'drop-shadow(0 0 12px rgba(234,54,76,0.5))'
                 }}>
              ORION<span style={{ WebkitTextFillColor: 'rgba(255,255,255,0.3)', fontSize: '0.6em' }}>.LK</span>
            </div>
          </div>

          {/* Loading bar */}
          <div className="w-48 h-[3px] rounded-full overflow-hidden bg-white/8">
            <div className="h-full rounded-full animate-pulse"
                 style={{ background: 'linear-gradient(90deg, #ea364c, #ff6b35)', boxShadow: '0 0 10px rgba(234,54,76,0.6)', width: '60%' }} />
          </div>
        </div>
      </div>
    );
  }


  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
