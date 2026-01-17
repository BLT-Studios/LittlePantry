export type UserRole = 'user' | 'org' | 'admin';

export interface Profile {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  avatar: string | null;
  zip: string | null;
  city: string | null;
  state: string | null;
  lat: number | null;
  lng: number | null;
  radius: number | null;
  gender: string | null;
  age: number | null;
  created_at: string;
  updated_at: string;
}
