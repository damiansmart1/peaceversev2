import {describe,expect,test} from 'bun:test';
import {voiceDestination,appendDictation,clampTextSize,speechLocale} from '../src/lib/accessibilitySpeech';
import {validCaptionFile} from '../src/lib/accessibilityMedia';
describe('accessibility behavior',()=>{
 test('read-aloud text sizing supports 100 to 200 percent without invalid values',()=>{expect(clampTextSize(200)).toBe(200);expect(clampTextSize(300)).toBe(200);expect(clampTextSize(80)).toBe(100);expect(clampTextSize(NaN)).toBe(100);});
 test('voice navigation routes radio and stories to their own pages',()=>{expect(voiceDestination('Peace radio','en')).toBe('/radio');expect(voiceDestination('Voice stories','en')).toBe('/voice');expect(voiceDestination('Mediation','en')).toBe('/mediation');expect(voiceDestination('delete account','en')).toBeUndefined();});
 test('navigation recognizes Swahili and French commands',()=>{expect(voiceDestination('Upatanishi','sw')).toBe('/mediation');expect(voiceDestination('Communauté','fr')).toBe('/community');expect(speechLocale('sw')).toBe('sw-KE');});
 test('dictation preserves existing typed content',()=>{expect(appendDictation('Existing words',' new words ')).toBe('Existing words new words');expect(appendDictation('','Hello')).toBe('Hello');});
 test('caption loading accepts WebVTT and rejects unrelated files',()=>{expect(validCaptionFile({name:'captions.vtt',size:10},'WEBVTT\n\n')).toBe(true);expect(validCaptionFile({name:'captions.vtt',size:10},'<script>')).toBe(false);expect(validCaptionFile({name:'captions.html',size:10},'WEBVTT\n')).toBe(false);expect(validCaptionFile({name:'captions.vtt',size:1048577},'WEBVTT\n')).toBe(false);});
});
