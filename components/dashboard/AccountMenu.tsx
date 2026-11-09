'use client';

import { useRouter } from 'next/navigation';
import { Icon } from '@/components/ui/Icon';

export function LogoutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      className="btn btn-ghost h-9 px-3 text-[13px]"
      onClick={async () => {
        await fetch('/api/access/logout', { method: 'POST' });
        router.replace('/');
        router.refresh();
      }}
    >
      <Icon name="logout" size={15} /> Sair
    </button>
  );
}
