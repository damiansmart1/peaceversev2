export const speechLocale = (language: string) => ({en:'en-KE',sw:'sw-KE',fr:'fr-FR',ar:'ar',so:'so-SO',am:'am-ET',es:'es-ES',pt:'pt-PT',zh:'zh-CN',hi:'hi-IN',de:'de-DE'}[language] || language);
export function voiceDestination(command: string, language: string): string | undefined {
 const pages: Record<string, [string, string[]][]> = {
 en: [['/', ['home','go home','home page']],['/community',['community']],['/voice',['voice stories','voice','stories']],['/radio',['peace radio','radio']],['/proposals',['proposals','polls']],['/incidents',['incidents','report incident']],['/mediation',['mediation']],['/safety',['safety']],['/help',['help']],['/about',['about']],['/profile',['profile']],['/accessibility',['accessibility']]],
 sw: [['/',['nyumbani']],['/community',['jamii']],['/voice',['hadithi']],['/radio',['redio']],['/proposals',['mapendekezo']],['/incidents',['matukio']],['/mediation',['upatanishi']],['/safety',['usalama']],['/help',['msaada']]],
 fr: [['/',['accueil']],['/community',['communauté']],['/voice',['histoires']],['/radio',['radio']],['/proposals',['propositions']],['/incidents',['incidents']],['/mediation',['médiation']],['/safety',['sécurité']],['/help',['aide']]],
 };
 const normalized = command.toLocaleLowerCase().replace(/[.!?,]/g,'').trim();
 return (pages[language] || pages.en).find(([, aliases]) => aliases.includes(normalized))?.[0];
}
export function isDictationTarget(element: Element | null): element is HTMLInputElement | HTMLTextAreaElement {
 return (element instanceof HTMLTextAreaElement || (element instanceof HTMLInputElement && ['text','search'].includes(element.type))) && !element.disabled && !element.readOnly && element.getAttribute('data-no-dictation') !== 'true';
}
export function appendDictation(value: string, transcript: string) { return value + (value && !/\s$/.test(value) ? ' ' : '') + transcript.trim(); }
export function clampTextSize(size: number) { return Number.isFinite(size) ? Math.max(100, Math.min(200, size)) : 100; }
export interface SpeechEngine {
 lang: string; continuous: boolean; interimResults: boolean;
 onresult: ((event: { results: ArrayLike<ArrayLike<{transcript: string}>> }) => void) | null;
 onerror: ((event: {error: string}) => void) | null;
 onend: (() => void) | null;
 start: () => void; abort: () => void;
}
export function recognitionConstructor(): (new () => SpeechEngine) | undefined {
 const browser = window as unknown as {SpeechRecognition?: new () => SpeechEngine; webkitSpeechRecognition?: new () => SpeechEngine};
 return browser.SpeechRecognition || browser.webkitSpeechRecognition;
}
