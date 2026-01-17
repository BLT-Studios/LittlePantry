/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

type DonationRow = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  image: string | null;
  claimed: boolean;
  expiration_date: string | null;
  zip: string | null;
  city: string | null;
  state: string | null;
  lat: number | null;
  lng: number | null;
  ttl: number | null;
  reported: boolean;
  created_at: string;
  updated_at: string;
};

Deno.serve(async (req) => {
  try {
    const expected = Deno.env.get('DONATION_AUDIT_SECRET') ?? '';
    const provided = req.headers.get('x-donation-audit-secret') ?? '';
    if (!expected || provided !== expected) {
      return new Response('Unauthorized', { status: 401 });
    }

    const body = (await req.json()) as {
      event: 'INSERT' | 'UPDATE' | 'DELETE';
      table: string;
      at: string;
      record: Partial<DonationRow>;
    };

    const donationId = body.record?.id;
    if (!donationId)
      return new Response('Missing donation id', { status: 400 });

    const supabase = createClient(
      Deno.env.get('SB_URL')!,
      Deno.env.get('SB_SERVICE_ROLE_KEY')!
    );

    // Fetch freshest donation if it still exists (DELETE won’t)
    let donation: DonationRow | null = null;
    const { data: d } = await supabase
      .from('donations')
      .select('*')
      .eq('id', donationId)
      .maybeSingle();
    donation = (d as DonationRow | null) ?? null;

    const effectiveDonation = donation ?? (body.record as DonationRow);

    // Profile
    const { data: prof } = await supabase
      .from('profiles')
      .select('id,email,name,zip,city,state,lat,lng,role')
      .eq('id', effectiveDonation.user_id)
      .maybeSingle();

    // Tags
    const { data: tags } = await supabase
      .from('donation_tags')
      .select('tags:tag_id (id, slug, label)')
      .eq('donation_id', donationId);

    const tagList = (tags ?? []).map((x: any) => x.tags).filter(Boolean);

    // Write audit snapshot to logs bucket (upsert)
    const log = {
      event: body.event,
      at: body.at,
      donation: effectiveDonation,
      profile: prof ?? null,
      tags: tagList,
    };

    const path = `donations/${donationId}.json`;

    const json = new TextEncoder().encode(JSON.stringify(log, null, 2));

    const up = await supabase.storage.from('logs').upload(path, json, {
      upsert: true,
      contentType: 'application/json',
    });

    if (up.error) throw up.error;

    // if donation was deleted, also delete its images
    if (body.event === 'DELETE') {
      const { data: files } = await supabase.storage
        .from('donations')
        .list(donationId);
      const toRemove = (files ?? []).map((f) => `${donationId}/${f.name}`);
      if (toRemove.length)
        await supabase.storage.from('donations').remove(toRemove);
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
});
