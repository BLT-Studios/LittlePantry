/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { makeAutoObservable, runInAction } from 'mobx';
import type { DonationFeedItem } from '@shared/types/donation';
import {
  createDonation,
  fetchFeedPage,
  subscribeToDonations,
  subscribeToDonationTags,
} from '@shared/services/donationService';

type FeedFilters = {
  tagSlugs: string[];
  requireAllTags: boolean;
};

export default class DonationStore {
  donations: DonationFeedItem[] = [];
  loading = false;
  error: string | null = null;

  pageSize = 10;
  hasMore = true;
  private offset = 0;

  filters: FeedFilters = {
    tagSlugs: [],
    requireAllTags: false,
  };

  private unsub: (() => void) | null = null;
  private unsubTags: (() => void) | null = null;

  private refreshTimer: number | null = null;
  private readonly refreshDebounceMs = 500;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  /** Data-only reset. Does NOT touch realtime subscription. */
  resetData() {
    this.donations = [];
    this.error = null;
    this.hasMore = true;
    this.offset = 0;
  }

  /** Full reset (used on logout mostly, and disspose). */
  resetAll() {
    this.stopRealtime();
    this.resetData();
    this.loading = false;
  }

  private scheduleRefresh() {
    if (this.refreshTimer) window.clearTimeout(this.refreshTimer);

    this.refreshTimer = window.setTimeout(() => {
      this.refreshTimer = null;
      void this.refreshFeed();
    }, this.refreshDebounceMs);
  }

  private wantsTagRealtime() {
    return this.filters.tagSlugs.length > 0;
  }

  private ensureTagRealtime() {
    const should = this.wantsTagRealtime();

    if (should && !this.unsubTags) {
      this.unsubTags = subscribeToDonationTags((_payload) => {
        this.scheduleRefresh();
      });
    }

    if (!should && this.unsubTags) {
      this.unsubTags();
      this.unsubTags = null;
    }
  }

  async refreshFeed() {
    if (this.loading) return;

    this.loading = true;
    this.error = null;

    try {
      const firstPage = await fetchFeedPage({
        limit: this.pageSize,
        offset: 0,
        tagSlugs: this.filters.tagSlugs.length ? this.filters.tagSlugs : null,
        requireAllTags: this.filters.requireAllTags,
      });

      runInAction(() => {
        this.donations = firstPage;
        this.offset = firstPage.length;
        this.hasMore = firstPage.length === this.pageSize;
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

  /** Infinite scroll paging */
  async loadNextPage() {
    if (this.loading || !this.hasMore) return;

    this.loading = true;
    this.error = null;

    try {
      const page = await fetchFeedPage({
        limit: this.pageSize,
        offset: this.offset,
        tagSlugs: this.filters.tagSlugs.length ? this.filters.tagSlugs : null,
        requireAllTags: this.filters.requireAllTags,
      });

      runInAction(() => {
        this.donations.push(...page);
        this.offset += page.length;
        if (page.length < this.pageSize) this.hasMore = false;
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

  async createDonation(input: {
    title: string;
    description?: string;
    zip?: string;
    expiration_date?: string | null;
    ttl?: number | null;
    tagSlugs?: string[];
  }) {
    this.loading = true;
    this.error = null;

    try {
      await createDonation(input);
      await this.refreshFeed();
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

  setFilters(next: Partial<FeedFilters>) {
    this.filters = { ...this.filters, ...next };

    this.ensureTagRealtime();

    this.resetData();

    void this.refreshFeed();
  }

  /** Start realtime subscription (only once) */
  startRealtime() {
    if (this.unsub) return;

    this.unsub = subscribeToDonations((_payload) => {
      this.scheduleRefresh();
    });

    this.ensureTagRealtime();
  }

  stopRealtime() {
    if (this.refreshTimer) {
      window.clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }

    this.unsub?.();
    this.unsub = null;

    this.unsubTags?.();
    this.unsubTags = null;
  }
}
