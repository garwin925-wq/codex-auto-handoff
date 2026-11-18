import {readRequirements,receiverInstructions} from './requirements.mjs';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {createInterface} from 'node:readline';
import {createHash} from 'node:crypto';

const codexHome=process.env.CODEX_HOME || path.join(os.homedir(),'.codex');
const uuid=/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i;
const canon=p=>fs.realpathSync.native(p).toLowerCase();
export function nextTitle(sourceTitle,previous){
 const base=previous?.base || sourceTitle?.trim() || '原对话';
 const number=(previous?.number ?? 1)+1;
 return {base,number,name:base+number};
}
function inside(root,file){
 const rel=path.relative(canon(root),canon(file));
 return rel!== '..' && !rel.startsWith('..'+path.sep) && !path.isAbsolute(rel);
}
export function pressure(info){
 const used=info?.last_token_usage?.total_tokens, limit=info?.model_context_window;
 if(!Number.isSafeInteger(used)||used<=0||!Number.isSafeInteger(limit)||limit<=0)return 'unknown';
 return used>=0.8*limit?'handoff':used>=0.7*limit?'prepare':'normal';
}
async function telemetry(file,id){
 if(!uuid.test(id)||!path.basename(file).includes(id)||!inside(path.join(codexHome,'sessions'),file))throw Error('Unverified session path');
 const stream=fs.createReadStream(file,{encoding:'utf8'});
 let meta,ctx,info;
 for await(const line of createInterface({input:stream,crlfDelay:Infinity})){
  if(!line.includes('"session_meta"')&&!line.includes('"turn_context"')&&!line.includes('"token_count"')&&!line.includes('"compacted"'))continue;
  let e;try{e=JSON.parse(line)}catch{continue}
  if(e.type==='session_meta')meta=e.payload;
  if(e.type==='turn_context'){if(ctx?.model!==e.payload.model)info=null;ctx=e.payload}
  if(e.type==='compacted')info=null;
  if(e.type==='event_msg'&&e.payload.type==='token_count'&&e.payload.info)info=e.payload.info;
 }
 if(meta?.id!==id)throw Error('Source identity mismatch');
 return {meta,ctx,info};
}
export function checkPermissions(ctx,cwd){
 const policy=ctx.sandbox_policy;
 const profile=ctx.permission_profile;
 if(!['workspace-write','read-only'].includes(policy?.type)||(ctx.active_permission_profile?.id != null && ![':workspace',':read-only'].includes(ctx.active_permission_profile.id))||profile?.type!=='managed'||profile.network!=='restricted'||policy.network_access||profile.file_system?.type!=='restricted')throw Error('Use native handoff for this permission profile');
 if(Object.keys(policy).some(k=>!['type','writable_roots','network_access','exclude_tmpdir_env_var','exclude_slash_tmp'].includes(k)))throw Error('Unsupported sandbox field');
 const writable=policy.type==='workspace-write';
 const roots=writable?[cwd,...(policy.writable_roots??[])].map(canon):[];
 const allowedWrite=new Set(roots);
 const allowedRead=new Set(roots.flatMap(p=>['.git','.codex','.agents','.aws'].map(d=>path.join(p,d))));
 const observedWrite=new Set();
 const special=new Set();
 for(const {path:entry,access} of profile.file_system.entries){
  if(entry.type==='special'){
   const kind=entry.value?.kind;
   if(access==='read'&&kind==='root'||writable&&access==='write'&&['tmpdir','slash_tmp'].includes(kind)){special.add(kind);continue}
  }else if(entry.type==='path'){
   if(access==='write'&&allowedWrite.has(canon(entry.path))){observedWrite.add(canon(entry.path));continue}
   if(access==='read'&&allowedRead.has(path.join(canon(path.dirname(entry.path)),path.basename(entry.path).toLowerCase())))continue;
  }
  throw Error('Unrepresentable filesystem restriction; use native handoff');
 }
 if(!special.has('root')||roots.some(p=>!observedWrite.has(p))||writable&&(special.has('tmpdir')===!!policy.exclude_tmpdir_env_var||special.has('slash_tmp')===!!policy.exclude_slash_tmp))throw Error('Incomplete source filesystem policy');
 return policy;
}
export class Client{
 constructor(exe,cwd){
  const env={...process.env,CODEX_HOME:codexHome};
  // Standalone app-server has no desktop package identity. Use its own Windows
  // tool runner with the sandbox and approval policy checked at thread/start.
  delete env.CODEX_WINDOWS_REGISTERED_CORE;
  this.child=spawn(exe,['app-server','--stdio'],{cwd,windowsHide:true,stdio:['pipe','pipe','ignore'],env});
  this.calls=new Map();this.seq=0;
  this.closed=new Promise(resolve=>this.child.once('close',resolve));
  this.end=new Promise(resolve=>this.finish=resolve);
  this.child.on('error',e=>this.finish({status:'error',error:e.message}));
  this.child.on('close',()=>{for(const p of this.calls.values())p.reject(Error('App Server closed'));this.finish({status:'disconnected'})});
  createInterface({input:this.child.stdout}).on('line',line=>{
   let m;try{m=JSON.parse(line)}catch{return}
   if(m.method&&m.id!=null){this.finish({status:'attention_required',request:m.method});return}
   const p=this.calls.get(m.id);
   if(p){this.calls.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);return}
   if(m.params?.threadId!==this.thread)return;
   if(m.method==='item/completed'&&m.params.item?.type==='agentMessage')this.message=m.params.item.text;
   if(m.method==='turn/completed')this.finish(m.params.turn);
  });
 }
 call(method,params){
  const id=++this.seq;
  return new Promise((resolve,reject)=>{
   const t=setTimeout(()=>{this.calls.delete(id);reject(Error('RPC timed out '+method))},45000);
   this.calls.set(id,{resolve:r=>{clearTimeout(t);resolve(r)},reject:e=>{clearTimeout(t);reject(e)}});
   this.child.stdin.write(JSON.stringify({id,method,params})+'\n');
  });
 }
 async init(){
  await this.call('initialize',{clientInfo:{name:'windows_project_handoff',version:'2'},capabilities:{experimentalApi:true}});
  this.child.stdin.write('{"method":"initialized"}\n');
 }
 async close(){this.child.stdin.end();this.child.kill();await this.closed}
}
export async function dispatch({source,cwd,packet,exe}){
 if(!uuid.test(source)||!path.isAbsolute(packet)||!inside(cwd,packet))throw Error('Invalid source or handoff location');
 if(!fs.statSync(packet).isFile())throw Error('Handoff must be a regular file');
 const requirements=readRequirements(packet,source);
 const snapshot=fs.readFileSync(packet);
 if(snapshot.length===0)throw Error('Empty handoff');
 if(!path.isAbsolute(exe))throw Error('Provide the absolute path to the installed Codex executable');
 const rpc=new Client(exe,cwd);
 let receipt,fd,rec={source},turn;
 const record=o=>{Object.assign(rec,o);fs.writeFileSync(receipt+'.next',JSON.stringify(rec,null,2),{flag:'wx'});fs.renameSync(receipt+'.next',receipt)};
 try{
  await rpc.init();
  const src=(await rpc.call('thread/read',{threadId:source,includeTurns:false})).thread;
  if(src.id!==source||canon(cwd)!==canon(src.cwd))throw Error('Source workspace mismatch');
  let cursor,projects=[];
  do{const r=await rpc.call('project/list',{cursor});projects.push(...r.data);cursor=r.nextCursor}while(cursor);
  const matches=projects.filter(p=>(!src.projectId||p.id===src.projectId)&&p.roots.some(r=>{try{return inside(r.path,cwd)}catch{return false}}));
  if(matches.length!==1)throw Error('Saved project missing or ambiguous');
  const projectId=matches[0].id;
  const {ctx,meta}=await telemetry(src.path,source);
  if(!ctx||canon(ctx.cwd)!==canon(cwd)||!ctx.model||!ctx.effort||!meta.model_provider||!ctx.approval_policy||!ctx.approvals_reviewer)throw Error('Incomplete source settings');
  const policy=checkPermissions(ctx,cwd),mode=policy.type;
  const writable=mode==='workspace-write';
  const settings={model_reasoning_effort:ctx.effort};
  for(const [k,v] of Object.entries(policy))if(writable&&k!=='type')settings['sandbox_workspace_write.'+k]=v;
  const stateRoot=path.join(codexHome,'handoff-state');
  const dir=path.join(stateRoot,'receipts');fs.mkdirSync(dir,{recursive:true});
  if(!inside(codexHome,dir))throw Error('Receipt directory outside Codex home');
  receipt=path.join(dir,source+'.json');
  try{fd=fs.openSync(receipt,'wx')}catch(e){if(e.code==='EEXIST')throw Error('Already claimed; inspect '+receipt);throw e}
  fs.closeSync(fd);
  record({stage:'creating',packet,projectId,sha256:createHash('sha256').update(snapshot).digest('hex')});
  const start=await rpc.call('thread/start',{cwd:src.cwd,projectId,sandbox:mode,model:ctx.model,modelProvider:meta.model_provider,approvalPolicy:ctx.approval_policy,approvalsReviewer:ctx.approvals_reviewer,config:settings});
  rpc.thread=start.thread.id;record({thread:rpc.thread,stage:'created'});
  if(start.thread.projectId!==projectId||canon(start.thread.cwd)!==canon(cwd)||start.model!==ctx.model||start.modelProvider!==meta.model_provider||start.reasoningEffort!==ctx.effort||JSON.stringify(start.approvalPolicy)!==JSON.stringify(ctx.approval_policy)||start.approvalsReviewer!==ctx.approvals_reviewer)throw Error('Effective settings mismatch');
  if(start.sandbox.type!==({'workspace-write':'workspaceWrite','read-only':'readOnly','danger-full-access':'dangerFullAccess'})[mode]||!!start.sandbox.networkAccess!==!!policy.network_access)throw Error('Effective sandbox mismatch');
  if(writable){
   const roots=a=>(a??[]).map(p=>path.resolve(p).toLowerCase()).sort().join('\n');
   if(roots(start.sandbox.writableRoots)!==roots(policy.writable_roots)||!!start.sandbox.excludeTmpdirEnvVar!==!!policy.exclude_tmpdir_env_var||!!start.sandbox.excludeSlashTmp!==!!policy.exclude_slash_tmp)throw Error('Workspace permissions mismatch');
  }
  if(!uuid.test(rpc.thread))throw Error('Invalid receiver identity');
  const names=path.join(stateRoot,'titles');
  fs.mkdirSync(names,{recursive:true});
  const prior=path.join(names,source+'.json');
  const title=nextTitle(src.name,fs.existsSync(prior)?JSON.parse(fs.readFileSync(prior,'utf8')):null);
  fs.writeFileSync(path.join(names,rpc.thread+'.json'),JSON.stringify(title),{flag:'wx'});
  await rpc.call('thread/name/set',{threadId:rpc.thread,name:title.name});
  record({name:title.name});
  const prompt=receiverInstructions(packet,requirements);
  const handoffText=snapshot.length<=24000?'\n已保存的交接原文如下，若有变化以磁盘现场为准。\n'+snapshot.toString('utf8'):'';
  turn=(await rpc.call('turn/start',{threadId:rpc.thread,disabledPluginIds:ctx.disabled_plugin_ids??[],input:[{type:'text',text:prompt+handoffText,text_elements:[]}]})).turn.id;
  record({turn,stage:'running'});console.log(JSON.stringify({thread:rpc.thread,receipt}));
  const result=await rpc.end;
  if(result.status==='attention_required')await rpc.call('turn/interrupt',{threadId:rpc.thread,turnId:turn});
  record({stage:result.status,error:result.error??null});
  if(result.status!=='completed')throw Error('Receiver '+result.status);
  return {thread:rpc.thread,message:rpc.message,receipt};
 }finally{await rpc.close();if(receipt&&fd!==undefined)record({writerReleased:true})}
}
if(process.argv[1]&&import.meta.url===(await import('node:url')).pathToFileURL(path.resolve(process.argv[1])).href){
 try{
  const [mode,p,exe]=process.argv.slice(2);
  if(mode==='signal'){
   let input='';for await(const b of process.stdin)input+=b;
   const e=JSON.parse(input);
   const t=await telemetry(e.transcript_path,e.session_id);
   const s=pressure(t.info);
   console.log(JSON.stringify(['prepare','handoff'].includes(s)?{hookSpecificOutput:{hookEventName:'PostToolUse',additionalContext:s==='handoff'?'最近一次请求已到交接区间。在安全小步骤结束时保存现场，按全局规则调用 Windows 自动换聊。':'最近一次请求已到准备区间，请更新当前任务交接。'}}:{}));
  }else if(mode==='continue'){await dispatch({source:process.env.CODEX_THREAD_ID,cwd:process.cwd(),packet:p,exe})}
  else throw Error('Unknown command');
 }catch(e){if(process.argv[2]==='signal')console.log('{}');else{console.error(e.message);process.exitCode=1}}
}
