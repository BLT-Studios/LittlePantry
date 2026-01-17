import type { Profile } from '@shared/types/profile';
import { getActiveUserId, requireUserId } from './sessionService';
import { supabase } from '@shared/libs/supabaseClient';

export async function getMyProfile(): Promise<Profile | null> {
  const uid = getActiveUserId();
  if (!uid) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', uid)
    .maybeSingle();

  if (error) throw error;

  return data as Profile | null;
}

export async function getProfileById(id: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;

  return data as Profile | null;
}

export async function updateProfile(patch: Partial<Profile>) {
  const uid = await requireUserId();

  const { error } = await supabase.from('profiles').update(patch).eq('id', uid);

  if (error) throw error;
}

export async function getSignedAvatarUrl(path?: string | null) {
  if (!path) return null;

  const { data, error } = await supabase.storage
    .from('profiles')
    .createSignedUrl(path, 60 * 60);

  if (error) throw error;

  return data.signedUrl;
}

export async function updateAvatar(file: File) {
  const uid = await requireUserId();

  const path = `${uid}/avatar.${file.type.includes('png') ? 'png' : 'jpg'}`;

  const { error } = await supabase.storage
    .from('profiles')
    .upload(path, file, { upsert: true });

  if (error) throw error;

  const { error: upError } = await supabase
    .from('profiles')
    .update({ avatar: path })
    .eq('id', uid);

  if (upError) throw upError;

  return path;
}
