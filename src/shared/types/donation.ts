import type { Tag } from './tag';

export type Donation = {
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

export type DonationFeedItem = Donation & {
  distance_miles: number;
  score: number;
  tags: Tag[];
};
