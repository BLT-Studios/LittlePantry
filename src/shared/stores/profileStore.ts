/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  getMyProfile,
  getSignedAvatarUrl,
  updateAvatar,
  updateProfile,
} from '@shared/services/profileService';
import type { Profile } from '@shared/types/profile';
import { makeAutoObservable, runInAction } from 'mobx';

export default class ProfileStore {
  profile: Profile | null = null;
  avatar: string | null = null;
  loading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  clear() {
    this.profile = null;
    this.avatar = null;
    this.loading = false;
    this.error = null;
  }

  get uid() {
    return this.profile?.id ?? null;
  }

  async updateAvatar(file: File) {
    this.loading = true;
    this.error = null;

    try {
      const signed = await updateAvatar(file);
      const prof = await getMyProfile();

      runInAction(() => {
        this.profile = prof;
        this.avatar = signed;
        this.loading = false;
      });
    } catch (e: any) {
      runInAction(() => {
        this.error = e?.message ?? 'Failed to upload avatar';
        this.loading = false;
      });
    }
  }

  async refresh(silent = true) {
    if (!silent) {
      this.loading = true;
      this.error = null;
    }

    try {
      const prof = await getMyProfile();
      const signed = await getSignedAvatarUrl(prof?.avatar ?? null);

      runInAction(() => {
        this.profile = prof;
        this.avatar = signed;
        this.loading = false;
      });
    } catch (e: any) {
      runInAction(() => {
        this.error = e?.message ?? String(e);
        this.loading = false;
      });
    }
  }

  async updateProfile(patch: Partial<Profile>) {
    const before = this.profile;
    await updateProfile(patch);
    await this.refresh();
    const after = this.profile;

    const changed = Object.keys(patch).filter(
      (k) => (before as any)?.[k] !== (after as any)?.[k]
    );
    if (changed.length) {
      console.info(`Profile Updated: ${{ changes: changed.join(',') }}`);
    }
  }
}
