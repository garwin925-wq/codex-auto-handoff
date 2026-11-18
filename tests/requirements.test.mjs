import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {readRequirements,requirementsPath,receiverInstructions} from '../codex-auto-handoff/scripts/requirements.mjs';

test('a correction omitted from the checkpoint remains available to its own receiver', t => {
 const dir=mkdtempSync(path.join(tmpdir(),'handoff-'));
 t.after(()=>rmSync(dir,{recursive:true,force:true}));
 const packet=path.join(dir,'STATE.md');
 writeFileSync(packet,'Continue testing.');
 assert.equal(readRequirements(packet,'first'),null);
 const file=requirementsPath(packet,'first');
 writeFileSync(file,JSON.stringify([{quote:'Keep the threshold at 80%',source:'user correction, turn 2',check:'Compare configured threshold before and after'}]));
 const req=readRequirements(packet,'first');
 assert.equal(req.rows[0].quote,'Keep the threshold at 80%');
 assert.ok(receiverInstructions(packet,req).includes(JSON.stringify(file)));
 assert.equal(readRequirements(packet,'second'),null);
 writeFileSync(file,'[{"quote":"Keep the threshold at 80%"}]');
 assert.throws(()=>readRequirements(packet,'first'),/acceptance check/);
});
