import { createContext, useContext } from 'react';
import UIStore from './uiStore';
import AppStore from './appStore';

class RootStore {
  uiStore = new UIStore();

  appStore = new AppStore(this.uiStore);
}

export const store = new RootStore();
export const StoreContext = createContext(store);
export function useStore() {
  return useContext(StoreContext);
}
