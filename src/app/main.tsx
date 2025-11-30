import ReactDOM from 'react-dom/client';
import '@shared/styles/index.css';
import { StoreContext, store } from '@shared/stores/store';
import AppBootstrap from './AppBootstrap';
import HomePage from '.';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StoreContext.Provider value={store}>
    <AppBootstrap>
      <HomePage />
    </AppBootstrap>
  </StoreContext.Provider>
);
