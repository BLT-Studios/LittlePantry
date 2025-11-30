import { observer } from 'mobx-react-lite';
import { useStore } from '@shared/stores/store';

const AppBootstrap = observer(function AppBootstrap({
  children,
}: {
  children: React.ReactNode;
}) {
  const { appStore } = useStore();

  if (!appStore.ready) return 'Loading...';

  return <>{children}</>;
});

export default AppBootstrap;
