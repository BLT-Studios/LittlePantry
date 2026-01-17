/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { makeAutoObservable, runInAction } from 'mobx';
import type { Tag } from '@shared/types/tag';
import { fetchAllTags, subscribeToTags } from '@shared/services/tagService';

export default class TagStore {
  tags: Tag[] = [];
  loading = false;
  error: string | null = null;

  private unsub: (() => void) | null = null;
  private refreshTimer: number | null = null;
  private readonly refreshDebounceMs = 500;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  clear() {
    this.stopRealtime();
    this.tags = [];
    this.loading = false;
    this.error = null;
  }

  /** quick lookup helpers */
  get bySlug(): Record<string, Tag> {
    const map: Record<string, Tag> = {};
    for (const t of this.tags) map[t.slug] = t;
    return map;
  }

  get slugs(): string[] {
    return this.tags.map((t) => t.slug);
  }

  get labels(): string[] {
    return this.tags.map((t) => t.label);
  }

  private scheduleRefresh() {
    if (this.refreshTimer) window.clearTimeout(this.refreshTimer);

    this.refreshTimer = window.setTimeout(() => {
      this.refreshTimer = null;
      void this.refresh(true);
    }, this.refreshDebounceMs);
  }

  async refresh(silent = true) {
    if (!silent) {
      this.loading = true;
      this.error = null;
    }

    try {
      const data = await fetchAllTags();
      runInAction(() => {
        this.tags = data;
      });
    } catch (e: any) {
      runInAction(() => {
        this.error = e?.message ?? String(e);
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  startRealtime() {
    if (this.unsub) return;

    this.unsub = subscribeToTags((_payload) => {
      this.scheduleRefresh();
    });
  }

  stopRealtime() {
    if (this.refreshTimer) {
      window.clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }

    this.unsub?.();
    this.unsub = null;
  }
}
