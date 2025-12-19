import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { useStore } from '@shared/stores/store';
import LoadingPage from '@shared/components/layout/LoadingPage';

export const RequireAuth = observer(function RequireAuth() {
  const { authStore, appStore } = useStore();
  const loc = useLocation();

  if (!appStore.ready) return <LoadingPage />;

  if (!authStore.uid) {
    return <Navigate to="/" replace state={{ from: loc }} />;
  }
  return <Outlet />;
});
