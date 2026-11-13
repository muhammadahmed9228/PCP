import { mkdir } from 'node:fs/promises';
import { getSheet } from '../src/modules/exports/sheets/registry.js';

const key = process.argv[2];
const sheet = getSheet(key);
if (!sheet) throw new Error('Unknown template key.');
await mkdir('templates', { recursive: true });
await (await sheet.build({})).xlsx.writeFile(`templates/${sheet.key}_blank_template.xlsx`);
