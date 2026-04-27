import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'manager' | 'editor';
}

export default function ProtectedRoute({ children, requiredRole }: Props) {
  const [loading, setLoading]     = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setLoading(false);
        return;
      }

      if (requiredRole) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .maybeSingle();

        // admin має доступ до всього; інші ролі — лише до свого рівня
        const role = profile?.role ?? 'user';
        const allowed = role === 'admin' || role === requiredRole;
        setAuthorized(allowed);
      } else {
        // Без вимоги ролі — достатньо бути авторизованим
        setAuthorized(true);
      }

      setLoading(false);
    })();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) setAuthorized(false);
    });

    return () => subscription.unsubscribe();
  }, [requiredRole]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-blue animate-spin" />
      </div>
    );
  }

  if (!authorized) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
