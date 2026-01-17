import { createContext, useContext } from 'react';
import UIStore from './uiStore';
import AppStore from './appStore';
import ProfileStore from './profileStore';
import AuthStore from './authStore';
import DonationStore from './donationStore';
import TagStore from './tagStore';

class RootStore {
  uiStore = new UIStore();
  profileStore = new ProfileStore();
  authStore = new AuthStore(this.profileStore);
  donationStore = new DonationStore();
  tagStore = new TagStore();
  appStore = new AppStore(
    this.authStore,
    this.profileStore,
    this.donationStore,
    this.tagStore
  );
}

export const store = new RootStore();
export const StoreContext = createContext(store);
export function useStore() {
  return useContext(StoreContext);
}
