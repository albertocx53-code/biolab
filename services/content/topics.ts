/**
 * Server-side topic resolution for Studio: turns an Explorer topic reference
 * into trusted metadata from the shared catalog (never from the URL).
 */
import 'server-only';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { Structure } from '@/data/biology/schema';
import type { StudioTopicRef } from '@/data/studio/contract';
import { buildHumanIndex, type HumanIndex, type RawHumanCatalog } from '@/laboratories/human/catalog';

let human: Promise<HumanIndex> | null = null;
function humanIndex() {
  human ??= fs
    .readFile(path.join(process.cwd(), 'public/models/human/v1/catalog.json'), 'utf8')
    .then((t) => buildHumanIndex(JSON.parse(t) as RawHumanCatalog));
  return human;
}

export async function resolveTopic(ref: StudioTopicRef): Promise<Structure | null> {
  if (ref.laboratoryId === 'anatomia-humana') {
    return (await humanIndex()).structures.get(ref.structureId) ?? null;
  }
  return null; // other laboratories: catalogs arrive with their phases
}
