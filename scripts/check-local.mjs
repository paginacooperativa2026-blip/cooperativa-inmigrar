import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const base='http://127.0.0.1:5173';
const cookie='__sites_local_auth=1';
const auth={Cookie:cookie,Origin:base,'Content-Type':'application/json'};
const api=(data,headers=auth)=>fetch(base+'/api/manage',{method:'POST',headers,body:JSON.stringify(data)});
assert.equal((await fetch(base+'/api/manage')).status,403,'Anonymous users cannot manage');
assert.equal((await api({entry:{}},{...auth,Origin:'https://example.org'})).status,403,'Cross-origin mutation rejected');
assert.equal((await api({entry:{}})).status,400,'Required fields validated');
const entry={name:'Prueba temporal',person:'Integrante de prueba',category:'Pruebas',description:'Registro de comprobación local, se elimina al finalizar.',status:'draft',ownerEmail:'seedy@sites.test'};
assert.equal((await api({entry})).status,200);
let managed=await (await fetch(base+'/api/manage',{headers:{Cookie:cookie}})).json();
const record=managed.entries.find(i=>i.name===entry.name);assert.ok(record);
try{
 assert.ok(!(await (await fetch(base+'/api/catalog')).json()).some(i=>i.id===record.id),'Draft hidden from catalog');
 const form=new FormData();form.set('image',new Blob([await readFile('public/logo-inmigrar.png')],{type:'image/png'}),'test.png');
 const upload=await fetch(base+'/api/upload',{method:'POST',headers:{Cookie:cookie,Origin:base},body:form});assert.equal(upload.status,200);const {key}=await upload.json();
 assert.equal((await fetch(base+'/api/images/'+key)).status,404,'Unpublished images hidden from anonymous visitors');
 assert.equal((await api({id:record.id,entry:{...entry,image:key,status:'published'}})).status,200);
 const visible=(await (await fetch(base+'/api/catalog')).json()).find(i=>i.id===record.id);assert.ok(visible);assert.ok(!('ownerEmail' in visible));
 assert.equal((await fetch(base+'/api/images/'+key)).status,200);
 assert.equal((await api({id:record.id,entry:{...entry,image:key,status:'draft'}})).status,200);
 assert.equal((await fetch(base+'/api/images/'+key)).status,404,'Unpublishing removes public image access');
 const invalid=new FormData();invalid.set('image',new Blob(['<svg/>'],{type:'image/svg+xml'}),'bad.svg');assert.equal((await fetch(base+'/api/upload',{method:'POST',headers:{Cookie:cookie,Origin:base},body:invalid})).status,400,'SVG rejected');
}finally{assert.equal((await api({id:record.id,action:'delete'})).status,200)}
assert.ok(!(await (await fetch(base+'/api/catalog')).json()).some(i=>i.id===record.id));
console.log('PASS: authentication, origin checks, validation, draft/public visibility, upload, edit, unpublish, delete and public field filtering.');
