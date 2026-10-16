import { describe, expect, test } from 'bun:test';
import { materialSchema, validateMaterialFile, validateBallot } from '../src/lib/participation';
describe('informed and protected participation', () => {
  test('references reject executable URLs', () => {
    expect(materialSchema.safeParse({title:'Reference',context:'',language:'en',url:'javascript:alert(1)'}).success).toBe(false);
    expect(materialSchema.safeParse({title:'Reference',context:'',language:'en',url:'https://example.org/policy'}).success).toBe(true);
  });
  test('photos and videos can be added while executable files cannot', () => {
    expect(validateMaterialFile({name:'photo.jpg',type:'image/jpeg',size:1024})).toBe('jpg');
    expect(validateMaterialFile({name:'video.mp4',type:'video/mp4',size:1024})).toBe('mp4');
    expect(() => validateMaterialFile({name:'photo.svg',type:'image/svg+xml',size:1024})).toThrow();
  });
  test('ballots cannot select duplicate or nonexistent options', () => {
    expect(() => validateBallot([0,0],3,true,3)).toThrow();
    expect(() => validateBallot([3],3,false,1)).toThrow();
    expect(() => validateBallot([1],3,false,1)).not.toThrow();
  });
});