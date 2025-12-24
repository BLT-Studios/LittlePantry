import type { IconName } from '@shared/components/ui/Icon/IconMap';

export type NavTab = {
  id: string;
  label: string;
  path: string;
  icon: IconName;
};

export const NAVIGATION_TABS: readonly NavTab[] = [
  { id: 'home', label: 'Home', path: '/', icon: 'home' },
  { id: 'profile', label: 'Profile', path: '/profile', icon: 'profile' },
] as const;
