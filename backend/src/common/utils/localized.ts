/** Bilingual text, the same shape as the frontend `Localized` type. (A type alias so it is assignable to Prisma JSON.) */
export type Localized = {
  id: string;
  en: string;
};

export type Language = 'id' | 'en';

export function localized(id: string, en: string = id): Localized {
  return { id, en };
}

/** Accept either a stored Localized object or a legacy plain string. */
export function asLocalized(value: unknown): Localized {
  if (value && typeof value === 'object' && 'id' in value && 'en' in value) {
    const record = value as Record<string, unknown>;
    return { id: String(record.id), en: String(record.en) };
  }
  const text = value == null ? '' : String(value);
  return { id: text, en: text };
}

export function pickLanguage(value: unknown, lang: Language): string {
  return asLocalized(value)[lang];
}
