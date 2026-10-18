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