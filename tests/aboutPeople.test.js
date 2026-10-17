import {expect,test} from 'bun:test';
import {personSchema,validatePortrait} from '../src/lib/aboutPeople';
test('founders, team and partner profiles accept bios and fun introductions',()=>{for(const category of ['founder','team','partner'])expect(personSchema.safeParse({name:'Amina',role_title:'Lead',category,organization:'PeaceVerse',bio:'Peacebuilder',fun_intro:'Weekend drummer',website_url:'',linkedin_url:'',display_order:0,is_published:false,image_path:null}).success).toBe(true);});
test('portrait uploads reject executable images',()=>{expect(()=>validatePortrait({type:'image/svg+xml',size:100})).toThrow();expect(validatePortrait({type:'image/jpeg',size:100})).toBe('jpg');});
test('portrait size accepts 5 MB and rejects larger files',()=>{expect(validatePortrait({type:'image/png',size:5*1024*1024})).toBe('png');expect(()=>validatePortrait({type:'image/png',size:5*1024*1024+1})).toThrow();});
