import ArrowLeft from '@assets/icons/arrow-left.svg';
import ArrowRight from '@assets/icons/arrow-right.svg';
import ChevronLeft from '@assets/icons/chevron-left.svg';
import ChevronRight from '@assets/icons/chevron-right.svg';
import Chat from '@assets/icons/chat.svg';
import Home from '@assets/icons/home.svg';
import Profile from '@assets/icons/profile.svg';
import Settings from '@assets/icons/settings.svg';
import Close from '@assets/icons/close.svg';
import Users from '@assets/icons/users.svg';
import Notify from '@assets/icons/notify.svg';
import Spinner from '@assets/icons/spinner.svg';
import Refresh from '@assets/icons/refresh.svg';
import Check from '@assets/icons/check.svg';
import ExternalLink from '@assets/icons/external-link.svg';
import Locked from '@assets/icons/locked.svg';
import Edit from '@assets/icons/edit.svg';

export const icons = {
  'arrow-left': ArrowLeft,
  'arrow-right': ArrowRight,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  chat: Chat,
  home: Home,
  profile: Profile,
  settings: Settings,
  close: Close,
  users: Users,
  notify: Notify,
  spinner: Spinner,
  refresh: Refresh,
  check: Check,
  'external-link': ExternalLink,
  locked: Locked,
  edit: Edit,
} as const;

export type IconName = keyof typeof icons;
export type IconAsset = (typeof icons)[IconName];
