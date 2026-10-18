export function validCaptionFile(file: {name:string;size:number}, text:string) {
 return file.name.toLowerCase().endsWith('.vtt') && file.size <= 1024*1024 && /^\uFEFF?WEBVTT(?:\s|$)/.test(text);
}
