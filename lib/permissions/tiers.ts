/**
 * Access tiers and the capabilities they grant.
 * Authorization is always enforced server-side using these definitions;
 * the client only uses them to decide what to show.
 */
export const TIERS = ['basico', 'completo'] as const;
export type Tier = (typeof TIERS)[number];

export const CAPABILITIES = [
  'explorer.labs', // all six laboratories
  'explorer.presentation',
  'studio.access', // Studio workspace (generators arrive in phase 2)
  'studio.generators',
] as const;
export type Capability = (typeof CAPABILITIES)[number];

const GRANTS: Record<Tier, readonly Capability[]> = {
  basico: ['explorer.labs', 'explorer.presentation'],
  completo: ['explorer.labs', 'explorer.presentation', 'studio.access', 'studio.generators'],
};

export function can(tier: Tier | null | undefined, capability: Capability): boolean {
  if (!tier) return false;
  return GRANTS[tier].includes(capability);
}

export const TIER_LABEL: Record<Tier, string> = {
  basico: 'Plano Básico',
  completo: 'Plano Completo',
};

export function isTier(value: unknown): value is Tier {
  return typeof value === 'string' && (TIERS as readonly string[]).includes(value);
}
