import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validateEntry,validEmail,detectImage} from '../lib/validation.ts';

const valid={name:' Example ',person:'Person',category:'Category',description:'Text',whatsapp:'+56 9 1234 5678'};
test('entry validation strips privileged fields and normalizes contacts',()=>{
 const row=validateEntry({...valid,owner_id:'another-account',role:'admin',status:'anything'});
 assert.equal(row.name,'Example');assert.equal(row.whatsapp,'56912345678');assert.equal(row.status,'draft');assert.ok(!('owner_id' in row));assert.ok(!('role' in row));
});
test('invalid payloads, external paths and oversized content are rejected',()=>{
 for(const value of [{...valid,name:''},{...valid,description:'x'.repeat(10001)},{...valid,image:'https://example.com/image.jpg'},{...valid,image:'../private.jpg'},{...valid,whatsapp:'javascript:alert(1)'}])assert.throws(()=>validateEntry(value));
 assert.equal(validEmail('member@example.cl'),true);assert.equal(validEmail('bad@'),false);
});
test('uploads use file bytes rather than trusting declared MIME type',()=>{
 assert.equal(detectImage(new TextEncoder().encode('<svg/>')),null);assert.equal(detectImage(new Uint8Array([255,216,255,0])).ext,'jpg');assert.equal(detectImage(new Uint8Array([137,80,78,71,0])).ext,'png');
});
