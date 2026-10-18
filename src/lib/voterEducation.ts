export type EducationLesson = {
  id: string;
  citation: string;
  sourceUrl: string;
  correctAnswer: number;
  copy: Record<string, { summary: string; question: string; options: string[]; explanation: string }>;
};
export type EducationCountry = {
  code: string;
  commissionUrl: string;
  sourceChecked: string;
  lessons: EducationLesson[];
};

export function isCorrectEducationAnswer(lesson: EducationLesson, answer: number | undefined) {
  return Number.isInteger(answer) && answer === lesson.correctAnswer;
}

export function readEducationProgress(country: EducationCountry): string[] {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(`voter-education-v1-${country.code}`) || '[]');
    return Array.isArray(saved) ? country.lessons.filter(lesson => saved.includes(lesson.id)).map(lesson => lesson.id) : [];
  } catch { return []; }
}

export function saveEducationProgress(country: EducationCountry, completed: string[]) {
  try { localStorage.setItem(`voter-education-v1-${country.code}`, JSON.stringify(completed)); } catch { /* Session learning remains available. */ }
}
// Translate citation labels only; retain the exact article numbers and official source URLs.
export function educationCitation(lesson: EducationLesson, language: string) {
  if (language !== 'fr') return lesson.citation;
  return lesson.citation.replace('Constitution of Kenya', 'Constitution du Kenya')
    .replace('Constitution of South Africa', 'Constitution de l’Afrique du Sud')
    .replace('Articles ', 'articles ').replace('Article ', 'article ')
    .replace('sections ', 'articles ').replace('section ', 'article ').replace(' and ', ' et ');
}
