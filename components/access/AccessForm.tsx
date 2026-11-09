'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/ui/Icon';

export function AccessForm({ expired }: { expired: boolean }) {
  const router = useRouter();
  const [key, setKey] = useState('');
  const [error, setError] = useState<string | null>(expired ? 'Sua sessão terminou. Digite sua chave de acesso para continuar.' : null);
  const [pending, setPending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!key.trim()) {
      setError('Digite sua chave de acesso.');
      return;
    }
    setPending(true);
    setError(null);
    try {
      const res = await fetch('/api/access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        router.replace(data.redirect ?? '/explorar');
        router.refresh();
        return;
      }
      setError(data.message ?? 'Não foi possível validar a chave agora. Tente novamente.');
    } catch {
      setError('Sem conexão com o servidor. Verifique sua internet e tente novamente.');
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="w-full space-y-4" noValidate>
      <label htmlFor="access-key" className="block text-sm font-medium text-fg-muted">
        Chave de acesso
      </label>
      <div className={`flex items-center gap-3 rounded-xl border bg-ink-950/60 px-4 transition-colors ${error ? 'border-danger/60' : 'border-line-strong focus-within:border-cyan/70'}`}>
        <Icon name="key" className="shrink-0 text-fg-muted" />
        <input
          id="access-key"
          name="key"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          inputMode="text"
          placeholder="BIO3D-XXXXX-XXXXX-XXXXX-XXXXX"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          aria-invalid={!!error}
          aria-describedby={error ? 'access-error' : 'access-help'}
          className="h-14 w-full bg-transparent font-mono text-[15px] tracking-wider text-fg uppercase placeholder:text-fg-subtle placeholder:normal-case focus:outline-none"
          maxLength={64}
        />
      </div>
      {error ? (
        <p id="access-error" role="alert" className="flex items-start gap-2 text-sm text-danger">
          <Icon name="alert" size={16} className="mt-0.5 shrink-0" />
          {error}
        </p>
      ) : (
        <p id="access-help" className="text-sm text-fg-subtle">
          A chave foi enviada no e-mail de confirmação da compra.
        </p>
      )}
      <button type="submit" className="btn btn-primary h-12 w-full text-[15px]" disabled={pending}>
        {pending ? 'Validando…' : 'Entrar na plataforma'}
        {!pending && <Icon name="arrowRight" size={18} />}
      </button>
    </form>
  );
}
