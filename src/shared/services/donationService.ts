/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '@shared/libs/supabaseClient';
import { requireUserId } from './sessionService';
import type { Donation, DonationFeedItem } from '@shared/types/donation';
import type { Tag } from '@shared/types/tag';

export async function createDonation(payload: {
  title: string;
  description?: string;
  zip?: string;
  expiration_date?: string | null;
  ttl?: number | null;
  tagSlugs?: string[];
}) {
  const uid = await requireUserId();

  const { data: donation, error } = await supabase
    .from('donations')
    .insert({
      user_id: uid,
      title: payload.title,
      description: payload.description ?? null,
      zip: payload.zip ?? null,
      expiration_date: payload.expiration_date ?? null,
      ttl: payload.ttl ?? null,
    })
    .select('*')
    .single();

  if (error) throw error;
  if (!donation) throw new Error('donation_create_failed');

  if (payload.tagSlugs?.length) {
    const { data: tags, error: tagErr } = await supabase
      .from('tags')
      .select('id,slug,label')
      .in('slug', payload.tagSlugs);

    if (tagErr) throw tagErr;

    const tagIds = (tags ?? []).map((t) => t.id);
    if (tagIds.length) {
      const { error: dtErr } = await supabase.from('donation_tags').insert(
        tagIds.map((tag_id) => ({
          donation_id: donation.id,
          tag_id,
        }))
      );
      if (dtErr) throw dtErr;
    }
  }

  return donation as Donation;
}

export async function fetchFeedPage(params: {
  limit: number;
  offset: number;
  tagSlugs?: string[] | null;
  requireAllTags?: boolean;
}) {
  const { data, error } = await supabase.rpc('get_donations_feed', {
    p_limit: params.limit,
    p_offset: params.offset,
    p_tag_slugs: params.tagSlugs ?? null,
    p_require_all_tags: params.requireAllTags ?? false,
  });

  if (error) throw error;

  // RPC retrns tags as jsonb; supabase-js gives it as plain JS objects..
  return (data ?? []).map((row: any) => ({
    ...row,
    tags: Array.isArray(row.tags) ? (row.tags as Tag[]) : [],
  })) as DonationFeedItem[];
}

export async function uploadDonationImage(donationId: string, file: File) {
  const ext = file.type.includes('png') ? 'png' : 'jpg';
  const path = `${donationId}/image.${ext}`;

  const { error } = await supabase.storage
    .from('donations')
    .upload(path, file, { upsert: true });

  if (error) throw error;

  const { error: upErr } = await supabase
    .from('donations')
    .update({ image: path })
    .eq('id', donationId);

  if (upErr) throw upErr;

  return path;
}

export function subscribeToDonations(onEvent: (payload: any) => void) {
  const channel = supabase
    .channel('donations-feed')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'donations' },
      onEvent
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export function subscribeToDonationTags(onEvent: (payload: any) => void) {
  const channel = supabase
    .channel('donation-tags-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'donation_tags' },
      onEvent
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
