import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import ExcelJS from 'exceljs';
import JSZip from 'jszip';
import { AMP } from '../src/modules/amp/amp.model.js';
import amp from '../src/modules/exports/sheets/amp/index.js';

test('AMP export maps values, formats dates, sorts history and prints RTL', async () => {
  const wb=amp.build({ areaName:'Sher Shah Town', campaignName:'November Campaign 2026', totalMobileTeams:4,totalFixedTeams:2,totalTransitTeams:1, vaccineCarrierRequired:100,vaccineCarrierAvailable:100, bothAdults:true, isGovtEmployee:true, aicGender:'Male', currentCampaignTotalHH:10000, migrantMobileChildren: '42', finalizedAt:'2026-11-03T12:00:00Z', reviewHistory:[{action:'Approved',reviewer:{uciName:'UCI'},at:'2026-11-04T10:30:00Z'},{action:'Reopened',reason:'Correction',at:'2026-11-03T09:00:00Z'}] });
  const buffer=await wb.xlsx.writeBuffer(); const ws=(await new ExcelJS.Workbook().xlsx.load(buffer)).worksheets[0];
  assert.equal(ws.views[0].rightToLeft,true); assert.equal(ws.getCell('C5').value,10000); assert.equal(ws.getCell('C7').value,7);
  assert.equal(ws.getCell('P7').value,100); assert.equal(ws.getCell('R7').value,100); assert.equal(ws.getCell('D14').value,'ہاں');
  assert.equal(ws.getCell('D15').value,42); assert.equal(ws.getCell('T23').value,'03/11/2026');
  assert.equal(ws.getCell('E28').value,'Reopened'); assert.equal(ws.getCell('E29').value,'Approved');
  const xml=await (await JSZip.loadAsync(buffer)).file('xl/worksheets/sheet1.xml').async('string'); assert.match(xml,/<brk id="19"/);
});

test('AMP template excludes empty history and leaves counts blank', () => {
  const ws=amp.build({}).worksheets[0]; assert.equal(ws.getCell('C7').value,null); assert.equal(ws.getCell('D15').value,null); assert.equal(ws.pageSetup.printArea,'A1:V24');
});

test('AMP export only allows the owning AIC or UCI', async t => {
  const aic=new mongoose.Types.ObjectId(), uci=new mongoose.Types.ObjectId(), id=new mongoose.Types.ObjectId();
  let query;
  t.mock.method(AMP,'findOne', filter => { query=filter; const q={ populate(){return q;}, async lean(){return {_id:id,aic:{_id:aic},uci};} }; return q; });
  await amp.load({ampId:String(id),user:{role:'AIC',_id:aic}});
  await amp.load({ampId:String(id),user:{role:'UCI',_id:uci}});
  await assert.rejects(amp.load({ampId:String(id),user:{role:'AIC',_id:uci}}),e=>e.statusCode===403);
  await assert.rejects(amp.load({user:{role:'UCI',_id:uci}}),e=>e.statusCode===400);
  await amp.load({campaignId:String(id),user:{role:'AIC',_id:aic}}); assert.equal(query.campaign,String(id)); assert.equal(query.aic,aic);
});
