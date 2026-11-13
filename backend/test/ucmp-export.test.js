import test from 'node:test';
import assert from 'node:assert/strict';
import ExcelJS from 'exceljs';
import JSZip from 'jszip';
import ucmp from '../src/modules/exports/sheets/ucmp/index.js';
import { buildExcelWorkbook } from '../src/utils/excelExport.js';

test('UCMP workbook preserves populated values, blank fields and print layout after serialization', async () => {
  const workbook = ucmp.build({ campaignName: 'Campaign 2026', campaign: { startDate: '2027-01-01' }, uci: { uciNo: '7', username: '123', ucNumber: '2' }, totalMobileTeams: '2', totalFixedTeams: 3, totalTransitTeams: 1, bothAdults: false, vitaminARed: 10, totalChildren: 99, teamsRequiringSpecialAttention: 3, vaccineCarrierRequired: '5', vaccineCarrierAvailable: 0 });
  const buffer = await workbook.xlsx.writeBuffer();
  const restored = await new ExcelJS.Workbook().xlsx.load(buffer);
  const ws = restored.worksheets[0];
  assert.equal(ws.views[0].rightToLeft, true);
  assert.equal(ws.pageSetup.orientation, 'landscape');
  assert.equal(ws.getCell('C2').value, 'Campaign 2026');
  assert.equal(ws.getCell('Q1').value, '__ / __ / 2027');
  assert.equal(ws.getCell('C8').value, 6);
  assert.equal(ws.getCell('D15').value, 'نہیں');
  assert.equal(ws.getCell('V6').value, 99);
  assert.equal(ws.getCell('T9').value, 10);
  assert.equal(ws.getCell('M8').value, 3);
  assert.equal(ws.getCell('P8').value, 5);
  assert.equal(ws.getCell('R8').value, 0);
  assert.equal(ws.pageSetup.printArea, 'A1:V26');
  const xml = await (await JSZip.loadAsync(buffer)).file('xl/worksheets/sheet1.xml').async('string');
  assert.match(xml, /<brk id="21"/);
});

test('blank template leaves numeric values blank and generic exports still work', async () => {
  const ws = ucmp.build({}).worksheets[0];
  assert.equal(ws.getCell('C8').value, null);
  assert.equal(ws.getCell('D15').value, null);
  assert.equal(ws.getCell('P8').value, null);
  assert.equal(ws.getCell('R8').value, null);
  const generic = await buildExcelWorkbook({ example: 12 }, 'example');
  assert.equal(generic.getWorksheet('Summary').getCell('B2').value, 12);
});
