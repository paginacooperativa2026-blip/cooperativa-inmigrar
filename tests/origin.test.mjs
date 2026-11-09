import {test} from 'node:test';
import assert from 'node:assert/strict';
import {sameOrigin} from '../lib/request-origin.ts';
test('same-origin checks support Next.js internal URLs and Netlify forwarded HTTPS',()=>{
 const request=headers=>new Request('http://localhost:3000/api/manage',{method:'POST',headers});
 assert.equal(sameOrigin(request({host:'127.0.0.1:3000',origin:'http://127.0.0.1:3000'})),true);
 assert.equal(sameOrigin(request({host:'inmigrar.netlify.app',origin:'https://inmigrar.netlify.app','x-forwarded-proto':'https'})),true);
 assert.equal(sameOrigin(request({host:'inmigrar.netlify.app',origin:'https://attacker.test','x-forwarded-proto':'https'})),false);
 assert.equal(sameOrigin(request({host:'inmigrar.netlify.app',origin:'http://inmigrar.netlify.app','x-forwarded-proto':'https'})),false);
 assert.equal(sameOrigin(request({host:'inmigrar.netlify.app'})),false);
 assert.equal(sameOrigin(request({host:'inmigrar.netlify.app',origin:'null'})),false);
});
