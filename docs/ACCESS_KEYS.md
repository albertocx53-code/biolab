# Sistema de chaves de acesso

Não há e-mail, senha nem login social. O professor recebe uma chave após a compra e a digita na
página inicial.

## Formato

`BIO3D-XXXXX-XXXXX-XXXXX-XXXXX` — 20 caracteres em base32 de Crockford (100 bits de entropia).
A entrada aceita minúsculas, espaços e confusões comuns (O→0, I/L→1). Não existe chave fixa no
código: toda chave é gerada pelo CLI administrativo.

## Armazenamento

- Só o **HMAC-SHA256 da chave com um "pepper"** (`BIOLAB_KEY_PEPPER`) é gravado, além de uma dica
  (`…WXYZ`) para o suporte reconhecer a chave.
- Registro: `id, hash, hint, tier (basico|completo), label, createdAt, revokedAt, expiresAt,
  maxDevices, devices[], orderRef`.
- Implementação atual: `FileKeyStore` (`.data/keys.json`, fora do git), atrás da interface
  `KeyStore` em `lib/auth/store.ts`. Serve para desenvolvimento e um único servidor.
- Para produção com várias instâncias: implementar `KeyStore` sobre Postgres/Supabase usando
  [`docs/db/001_access_keys.sql`](db/001_access_keys.sql).

## Na Vercel (hoje)

A Vercel não guarda arquivos entre requisições, então lá as chaves vêm da variável de ambiente
`BIOLAB_KEYS` (`EnvKeyStore`, somente leitura). Ela contém só os hashes, nunca as chaves.

Primeira configuração (na sua máquina): `npm run vercel:setup` gera os segredos, uma chave
Completo e uma Básico, e imprime as três variáveis para colar na Vercel. Nada é gravado em disco.

Para criar mais chaves depois:

```bash
# na sua máquina, com os MESMOS BIOLAB_KEY_PEPPER e BIOLAB_SESSION_SECRET da Vercel
npm run keys:create -- --tier completo --label "Escola X" --max-devices 0
npm run keys:export      # copie o resultado para BIOLAB_KEYS na Vercel e faça redeploy
```

Limitações deste modo: criar ou revogar chave exige atualizar `BIOLAB_KEYS` e publicar de novo; o
limite de dispositivos não é aplicado (cada instância só lembra os aparelhos em memória); o
limitador de tentativas é por instância. O banco de dados abaixo resolve as três coisas.

## Validação (servidor)

`POST /api/access` → `validateAccessKey()`:

1. Limite de tentativas: 5 falhas em 15 minutos por cliente → HTTP 429 com `Retry-After`.
2. Normaliza, calcula o HMAC, busca o registro pelo hash (a chave em texto nunca é comparada nem gravada).
3. Recusa chave revogada, expirada ou acima do limite de dispositivos (mensagens em pt-BR).
4. Registra o dispositivo (cookie `biolab_device`, armazenado como hash).
5. Emite a sessão.

## Sessão

- Cookie `biolab_session`: `httpOnly`, `SameSite=Lax`, `Secure` em produção, validade de 12 h.
- Conteúdo: `{keyId, tier, iat, exp}` assinado com HMAC (`BIOLAB_SESSION_SECRET`).
- O `middleware.ts` verifica a assinatura em toda rota protegida; as páginas chamam `getSession()`,
  que **consulta o armazenamento de novo**: uma chave revogada perde acesso na próxima navegação,
  mesmo com cookie válido.
- O plano vem do servidor; o cliente nunca decide permissões. O Studio checa `can(tier, 'studio')`.

## Administração

```bash
npm run keys:create -- --tier completo --label "Escola X" --max-devices 3 --expires 2027-12-31
npm run keys:list
npm run keys:revoke -- <id>
```

`--max-devices 0` = ilimitado. A chave em texto aparece **uma única vez**.

## Integração com checkout (próxima fase)

O webhook do provedor de pagamento (Stripe, Mercado Pago, Hotmart etc.) deve: verificar a
assinatura do webhook, chamar `createAccessKey({tier, label, orderRef})` com o id do pedido e
enviar a chave ao comprador. Reembolso/chargeback → `revokeAccessKey`. O campo `orderRef` já existe.

## Pendências antes de produção com várias instâncias

- `KeyStore` em Postgres (tabela pronta em `docs/db/001_access_keys.sql`).
- Limitador de tentativas compartilhado (Redis/Upstash ou tabela) — hoje é em memória por processo.
- Painel administrativo (hoje só CLI).
