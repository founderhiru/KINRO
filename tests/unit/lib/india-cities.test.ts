import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ALL_BREEDS, breedSectionsWithServerSuggestions } from '@/lib/dog-breeds';
import { findKnownCity, INDIA_CITIES, MAJOR_CITIES, MORE_CITY_NAMES } from '@/lib/india-cities';

function entriesFrom(source: string): string[] {
  return [
    ...source.matchAll(
      /name:\s*["']([^"']+)["'],\s*latitude:\s*(-?[\d.]+),\s*longitude:\s*(-?[\d.]+)/g,
    ),
  ].map((m) => `${m[1]}|${Number(m[2])}|${Number(m[3])}`);
}

describe('India city catalogue', () => {
  it('lists the ten major metros, each with known coordinates', () => {
    expect(MAJOR_CITIES).toEqual([
      'Delhi NCR',
      'Mumbai',
      'Bengaluru',
      'Hyderabad',
      'Chennai',
      'Kolkata',
      'Guwahati',
      'Pune',
      'Ahmedabad',
      'Chandigarh',
    ]);
    for (const city of MAJOR_CITIES) expect(findKnownCity(city)).toBeDefined();
  });

  it('keeps the rest of the list free of the majors and of duplicates', () => {
    for (const city of MAJOR_CITIES) expect(MORE_CITY_NAMES).not.toContain(city);
    expect(new Set(MORE_CITY_NAMES).size).toBe(MORE_CITY_NAMES.length);
    expect(MORE_CITY_NAMES.length + MAJOR_CITIES.length).toBe(INDIA_CITIES.length);
  });

  it('finds a city case-insensitively and returns undefined for an unknown one', () => {
    expect(findKnownCity('  kolkata ')?.name).toBe('Kolkata');
    expect(findKnownCity('Somewhereville')).toBeUndefined();
  });

  it('matches the mobile app copy so the two cannot drift apart', () => {
    const mobile = readFileSync(join(process.cwd(), 'mobile/src/lib/india-cities.ts'), 'utf8');
    const web = readFileSync(join(process.cwd(), 'src/lib/india-cities.ts'), 'utf8');
    expect(entriesFrom(web)).toEqual(entriesFrom(mobile));
    expect(entriesFrom(web).length).toBe(INDIA_CITIES.length);
  });
});

describe('Breed catalogue', () => {
  it('matches the mobile app copy', () => {
    const grab = (source: string) =>
      [
        ...source
          .replace(/\/\*[\s\S]*?\*\//g, '')
          .replace(/\/\/.*$/gm, '')
          .matchAll(/["']([^"'\n]+)["']/g),
      ]
        .map((m) => m[1])
        .filter((value) => value !== 'en-IN');
    const mobile = readFileSync(join(process.cwd(), 'mobile/src/lib/dog-breeds.ts'), 'utf8');
    const web = readFileSync(join(process.cwd(), 'src/lib/dog-breeds.ts'), 'utf8');
    expect(grab(web)).toEqual(grab(mobile));
  });

  it('adds breeds already on file that the catalogue lacks, without duplicating known ones', () => {
    const sections = breedSectionsWithServerSuggestions([
      'Labrador Retriever',
      'Kombai ',
      'Garden Mutt',
    ]);
    expect(sections[0]?.title).toBe('From the community');
    expect(sections[0]?.options).toEqual(
      ['Kombai ', 'Garden Mutt'].filter(
        (b) => !ALL_BREEDS.map((x) => x.toLowerCase()).includes(b.toLowerCase()),
      ),
    );
    expect(sections[0]?.options).not.toContain('Labrador Retriever');
  });
});
