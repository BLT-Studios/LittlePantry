import { observer } from 'mobx-react-lite';
import { useStore } from '@shared/stores/store';
import { useEffect } from 'react';

const AppBootstrap = observer(function AppBootstrap({
  children,
}: {
  children: React.ReactNode;
}) {
  const { appStore } = useStore();

  useEffect(() => {
    void appStore.boot();

    return () => appStore.dispose();
  }, [appStore]);

  if (!appStore.ready) return 'Loading...';

  return <>{children}</>;
});

export default AppBootstrap;
