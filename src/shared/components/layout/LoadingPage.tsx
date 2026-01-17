import { Icon } from '../ui/Icon/Icon';

export default function LoadingPage() {
  return (
    <div className="min-h-dvh grid place-items-center">
      <Icon name="spinner" size={96} className="animate-spin text-black-500" />
    </div>
  );
}
