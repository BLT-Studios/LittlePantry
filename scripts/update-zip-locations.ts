/* eslint-disable @typescript-eslint/no-explicit-any */
import 'dotenv/config';
import AdmZip from 'adm-zip';
import { createClient } from '@supabase/supabase-js';

type ZipRow = {
  zip: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  accuracy: number;
};

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

async function downloadBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(
      `Failed to download ${url}: ${res.status} ${res.statusText}`
    );
  }
  const arr = await res.arrayBuffer();
  return Buffer.from(arr);
}

function parseGeoNamesUSTxt(usTxt: string): ZipRow[] {
  // GeoNames fields (tab-delimited):
  // 0 country, 1 postal code, 2 place name, 3 admin name1, 4 admin code1 (state), ...
  // 9 latitude, 10 longitude, 11 accuracy
  const bestByZip = new Map<string, ZipRow>();

  const lines = usTxt.split(/\r?\n/);
  for (const line of lines) {
    if (!line) continue;

    const cols = line.split('\t');
    if (cols.length < 12) continue;

    const country = cols[0];
    if (country !== 'US') continue;

    const zip = cols[1]?.trim();
    if (!zip) continue;

    const city = (cols[2] ?? '').trim();
    const state = (cols[4] ?? '').trim();
    const lat = Number(cols[9]);
    const lng = Number(cols[10]);
    const accuracy = Number(cols[11]);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;

    const row: ZipRow = {
      zip,
      city,
      state,
      lat,
      lng,
      accuracy: Number.isFinite(accuracy) ? accuracy : 0,
    };

    const prev = bestByZip.get(zip);
    if (!prev || row.accuracy > prev.accuracy) {
      bestByZip.set(zip, row);
    }
  }

  return Array.from(bestByZip.values());
}

async function upsertInBatches<T extends Record<string, unknown>>(params: {
  supabase: any;
  table: string;
  rows: T[];
  batchSize: number;
  onConflict: string;
}) {
  const { supabase, table, rows, batchSize, onConflict } = params;

  let done = 0;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);

    const { error } = await supabase.from(table).upsert(batch, { onConflict });

    if (error) throw error;

    done += batch.length;
    console.log(`Upserted ${done}/${rows.length} into ${table}`);
  }
}

async function main() {
  const SUPABASE_URL = requireEnv('SB_URL');
  const SUPABASE_SERVICE_ROLE_KEY = requireEnv('SB_SERVICE_ROLE_KEY');

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  }) as any;

  const sourceUrl = 'https://download.geonames.org/export/zip/US.zip';
  console.log(`Downloading ${sourceUrl} ...`);
  const zipBuf = await downloadBuffer(sourceUrl);

  console.log('Extracting US.txt ...');
  const zip = new AdmZip(zipBuf);
  const entry = zip.getEntry('US.txt');
  if (!entry) throw new Error('US.txt not found in US.zip');

  const usTxt = entry.getData().toString('utf8');

  console.log('Parsing and deduping by best accuracy ...');
  const rows = parseGeoNamesUSTxt(usTxt);

  console.log(`Parsed ${rows.length} unique ZIP rows`);

  const dbRows = rows.map((r) => ({
    zip: r.zip,
    city: r.city,
    state: r.state,
    lat: r.lat,
    lng: r.lng,
  }));

  console.log('Upserting into public.zip_locations ...');
  await upsertInBatches({
    supabase,
    table: 'zip_locations',
    rows: dbRows,
    batchSize: 1000,
    onConflict: 'zip',
  });

  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
