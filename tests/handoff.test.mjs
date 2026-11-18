import test from 'node:test';
import assert from 'node:assert/strict';
import {nextTitle,pressure,checkPermissions} from '../codex-auto-handoff/scripts/handoff.mjs';
test('original digits are kept across repeated handoffs',()=>{
 let prior;
 for(let i=2;i<=12;i++){prior=nextTitle(prior?.name??'方案2026',prior);assert.equal(prior.name,'方案2026'+i)}
});
test('use only last request, including threshold boundaries',()=>{
 for(const [count,want] of [[699,'normal'],[700,'prepare'],[799,'prepare'],[800,'handoff'],[0,'unknown']]){
 assert.equal(pressure({last_token_usage:{total_tokens:count},model_context_window:1000,total_token_usage:{total_tokens:1000000}}),want)}
});
test('custom and incomplete source permissions stop dispatch',()=>{
 for(const ctx of [{},{active_permission_profile:{id:'custom'}},{sandbox_policy:{type:'workspace-write'},permission_profile:{type:'managed',network:'restricted',file_system:{type:'restricted',entries:[{access:'none',path:{type:'path',path:'/secret'}}]}}}]) assert.throws(()=>checkPermissions(ctx,'/example'));
});
test('standalone workspace sessions may omit the named profile',()=>{
 const cwd=process.cwd();
 const special=(kind,access)=>({path:{type:'special',value:{kind}},access});
 const ctx={sandbox_policy:{type:'workspace-write'},permission_profile:{type:'managed',network:'restricted',file_system:{type:'restricted',entries:[special('root','read'),{path:{type:'path',path:cwd},access:'write'},special('tmpdir','write'),special('slash_tmp','write')]}}};
 assert.equal(checkPermissions(ctx,cwd).type,'workspace-write');
 ctx.permission_profile.file_system.entries.push({path:{type:'path',path:cwd},access:'none'});
 assert.throws(()=>checkPermissions(ctx,cwd));
});
