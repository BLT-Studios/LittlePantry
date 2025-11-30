import ReactDOM from 'react-dom/client';
import '@shared/styles/index.css';
import { StoreContext, store } from '@shared/stores/store';
import AppBootstrap from './AppBootstrap';
import AppRoutes from './routes';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StoreContext.Provider value={store}>
    <AppBootstrap>
      <AppRoutes />
    </AppBootstrap>
  </StoreContext.Provider>
);
