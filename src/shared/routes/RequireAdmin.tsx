import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { useStore } from '@shared/stores/store';
import LoadingPage from '@shared/components/layout/LoadingPage';

export const RequireAdmin = observer(function RequireAdmin() {
  const { appStore, profileStore } = useStore();
  const loc = useLocation();

  if (!appStore.ready) return <LoadingPage />;
  if (!profileStore.profile) return <LoadingPage />;

  if (profileStore.profile.role !== 'admin') {
    return <Navigate to="/" replace state={{ from: loc }} />;
  }

  return <Outlet />;
});
