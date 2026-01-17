import type { Session, User } from '@supabase/supabase-js';
import { makeAutoObservable, runInAction } from 'mobx';
import type ProfileStore from './profileStore';
import { supabase } from '@shared/libs/supabaseClient';

export default class AuthStore {
  initializing = true;
  loading = false;
  session: Session | null = null;
  user: User | null = null;
  error: string | null = null;
  private initialized = false;
  private unsub: (() => void) | null = null;

  constructor(private profileStore: ProfileStore) {
    makeAutoObservable(this);
  }

  get uid() {
    return this.user?.id ?? null;
  }

  async init() {
    if (this.initialized) return;
    this.initialized = true;

    const { data, error } = await supabase.auth.getSession();

    runInAction(() => {
      this.session = data.session ?? null;
      this.user = data.session?.user ?? null;
      this.error = error?.message ?? null;
    });

    if (this.uid) await this.profileStore.refresh();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      runInAction(() => {
        this.session = session ?? null;
        this.user = session?.user ?? null;
        this.error = null;
      });

      setTimeout(() => {
        if (this.uid) {
          void this.profileStore.refresh(true);
        } else {
          this.profileStore.clear();
        }
      }, 0);
    });
    this.unsub = () => sub.subscription.unsubscribe();

    runInAction(() => (this.initializing = false));
  }

  dispose() {
    this.unsub?.();
    this.unsub = null;
  }

  async signin(email: string, password: string) {
    this.loading = true;
    this.error = null;

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    runInAction(() => {
      this.loading = false;
      if (error) this.error = error.message;
    });
  }

  async signUp(email: string, password: string, name: string, zip: string) {
    this.loading = true;
    this.error = null;

    const normalizedEmail = email.trim();

    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: {
          name,
          zip,
        },
      },
    });

    runInAction(() => {
      this.loading = false;
      this.error = error?.message ?? null;
    });

    if (error || !data.user) return;

    await this.profileStore.refresh();
  }

  async signOut() {
    this.loading = true;
    const timeout = (ms: number) =>
      new Promise((_resolve, reject) => {
        setTimeout(() => reject(new Error('signout_timeout')), ms);
      });

    await Promise.race([
      supabase.auth.signOut({ scope: 'local' }),
      timeout(2000),
    ]).catch(() => null);

    void supabase.auth.signOut().catch(() => null);

    runInAction(() => {
      this.session = null;
      this.user = null;
      this.loading = false;
    });

    this.profileStore.clear();
  }
}
