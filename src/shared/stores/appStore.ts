import { makeAutoObservable, reaction } from 'mobx';
import type AuthStore from './authStore';
import type ProfileStore from './profileStore';
import type DonationStore from './donationStore';
import { ensureAuthSession } from '@shared/services/sessionService';
import type TagStore from './tagStore';

export default class AppStore {
  booted = false;

  constructor(
    private auth: AuthStore,
    private profile: ProfileStore,
    private donations: DonationStore,
    private tags: TagStore
  ) {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  private syncAfterVisibilityOrFocus = async () => {
    if (!this.auth.uid) return;

    try {
      await ensureAuthSession();
    } catch {
      // ignore refresh errors
    }

    this.profile.refresh(true);
  };

  private onVisible = () => {
    if (document.visibilityState === 'visible') {
      void this.syncAfterVisibilityOrFocus();
    }
  };

  private onFocus = () => {
    void this.syncAfterVisibilityOrFocus();
  };

  async boot() {
    if (this.booted) return;
    this.booted = true;

    await this.auth.init();

    reaction(
      () => this.auth.uid,
      async (uid) => {
        if (uid) {
          await this.profile.refresh(true);

          await this.tags.refresh(true);
          this.tags.startRealtime();

          await this.donations.refreshFeed();
          this.donations.startRealtime();
        } else {
          this.profile.clear();
          this.tags.clear();
          this.donations.resetAll();
        }
      },
      { fireImmediately: true }
    );

    document.addEventListener('visibilitychange', this.onVisible);
    window.addEventListener('focus', this.onFocus);
  }

  dispose() {
    document.removeEventListener('visibilitychange', this.onVisible);
    window.removeEventListener('focus', this.onFocus);
  }

  get ready(): boolean {
    return !this.auth.initializing;
  }
}
