import { Navigate, Outlet } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { useStore } from '@shared/stores/store';
import LoadingPage from '@shared/components/layout/LoadingPage';

export const PublicOnly = observer(function PublicOnly() {
  const { authStore, appStore } = useStore();

  if (!appStore.ready) return <LoadingPage />;
  if (authStore.uid) return <Navigate to="/" replace />;

  return <Outlet />;
});
