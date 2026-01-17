/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '@shared/libs/supabaseClient';
import type { Tag } from '@shared/types/tag';

export async function fetchAllTags(): Promise<Tag[]> {
  const { data, error } = await supabase
    .from('tags')
    .select('id,slug,label')
    .order('label', { ascending: true });

  if (error) throw error;
  return (data ?? []) as Tag[];
}

export function subscribeToTags(onEvent: (payload: any) => void) {
  const channel = supabase
    .channel('tags-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'tags' },
      onEvent
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
