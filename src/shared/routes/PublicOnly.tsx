import { Navigate, Outlet } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { useStore } from '@shared/stores/store';

export const PublicOnly = observer(function PublicOnly() {
  const { authStore, appStore } = useStore();

  if (!appStore.ready) {
    return <div style={{ padding: 40 }}>Loading app…</div>;
  }
  if (authStore.uid) return <Navigate to="/" replace />;

  return <Outlet />;
});
