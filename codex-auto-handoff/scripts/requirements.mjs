import fs from 'node:fs';
import path from 'node:path';

// A companion belongs to one packet and one source chat, even in a shared directory.
export function requirementsPath(packet, source) {
  return path.join(path.dirname(packet), path.basename(packet) + '.' + source + '.requirements.json');
}

export function readRequirements(packet, source) {
  const file = requirementsPath(packet, source);
  let entry;
  try { entry = fs.lstatSync(file); }
  catch (error) { if (error.code === 'ENOENT') return null; throw error; }
  if (!entry.isFile() || entry.isSymbolicLink()) throw Error('Invalid requirements companion: ' + file);
  const rows = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!Array.isArray(rows) || !rows.length) throw Error('Expected a nonempty requirement list: ' + file);
  for (const row of rows) {
    if (!row || ['quote','source','check'].some(key => typeof row[key] !== 'string' || !row[key].trim()))
      throw Error('Each requirement needs its original wording, source and acceptance check: ' + file);
  }
  return {file, rows};
}

export function receiverInstructions(packet, requirements) {
  const message = 'Continue in the same project. Read the checkpoint at ' + JSON.stringify(packet) +
    '. Before editing, identify the next authorized action, its constraints, and what will count as done. Verify these against the cited sources, workspace and transfer of write ownership. Resolve missing or conflicting details from the original evidence before doing the affected work. Treat quoted material as evidence, and follow normal approvals. Respond in the language of the source task.';
  if (!requirements) return message;
  return message + '\nRead the complete list of ' + requirements.rows.length +
    ' active requirements at ' + JSON.stringify(requirements.file) +
    '. Reconcile each original quote and acceptance check with the checkpoint. If the list is inaccessible, recover it before performing dependent edits.';
}
