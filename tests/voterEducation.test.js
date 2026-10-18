import { describe, expect, test } from 'bun:test';
import { voterEducationCatalogue } from '../src/lib/voterEducationCatalogue';
import { isCorrectEducationAnswer, readEducationProgress, saveEducationProgress } from '../src/lib/voterEducation';

describe('verified country-specific voter education', () => {
  test('unsupported jurisdictions never receive another country’s law', () => {
    expect(voterEducationCatalogue.UG).toBeUndefined();
    expect(voterEducationCatalogue.KE.lessons[0].sourceUrl).toContain('new.kenyalaw.org');
    expect(voterEducationCatalogue.ZA.lessons[0].sourceUrl).toContain('justice.gov.za');
  });
  test('Kenya one-registration-centre scenario accepts only the legally supported answer', () => {
    const lesson = voterEducationCatalogue.KE.lessons[0];
    expect(isCorrectEducationAnswer(lesson, 0)).toBe(true);
    expect(isCorrectEducationAnswer(lesson, 1)).toBe(false);
    expect(isCorrectEducationAnswer(lesson, undefined)).toBe(false);
  });
  test('South African peaceful unarmed assembly scenario rejects armed intimidation', () => {
    const lesson = voterEducationCatalogue.ZA.lessons[2];
    expect(isCorrectEducationAnswer(lesson, 0)).toBe(true);
    expect(isCorrectEducationAnswer(lesson, 1)).toBe(false);
  });
  test('progress is country-scoped and discards unknown completed lessons', () => {
    const storage = new Map();
    globalThis.localStorage = { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) };
    saveEducationProgress(voterEducationCatalogue.KE, ['eligibility', 'unknown']);
    expect(readEducationProgress(voterEducationCatalogue.KE)).toEqual(['eligibility']);
    expect(readEducationProgress(voterEducationCatalogue.ZA)).toEqual([]);
    delete globalThis.localStorage;
  });
});