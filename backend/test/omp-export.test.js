import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import ExcelJS from 'exceljs';
import JSZip from 'jszip';
import { OMP } from '../src/modules/omp/omp.model.js';
import omp from '../src/modules/exports/sheets/omp/index.js';

test('team workbook covers all days, totals, missing values and page break', async () => {
  const records = [
    { campaignDay:1,status:'Draft',campaignName:'November Campaign 2026',teamNo:'01',teamLeader:{name:'Sehrish',states:['G','F']},totalHouseholds:1000,totalUnder1Year:500,total1to5Years:1000,totalSchoolMadrasa:200,totalVaccineDoses:900,totalUnvaccinatedPast:20,totalMigrantMobile:40,vitaminARed:200,vitaminABlue:200,marker:2,chalk:2,dropper:2,plasticBags:2 },
    { campaignDay:2,status:'Finalized',totalHouseholds:1300,totalUnder1Year:400,total1to5Years:400,totalSchoolMadrasa:100,totalVaccineDoses:200,totalUnvaccinatedPast:20,totalMigrantMobile:40,vitaminARed:130,vitaminABlue:130,marker:30,chalk:30,dropper:30,plasticBags:30 },
    { campaignDay:3,status:'Finalized',totalHouseholds:1000,totalUnder1Year:500,total1to5Years:500,totalSchoolMadrasa:100,totalVaccineDoses:200,totalUnvaccinatedPast:200,totalMigrantMobile:10,vitaminARed:130,vitaminABlue:130,marker:20,chalk:20,dropper:20,plasticBags:20 }
  ];
  const buffer=await omp.build({records}).xlsx.writeBuffer();
  const ws=(await new ExcelJS.Workbook().xlsx.load(buffer)).worksheets[0];
  assert.equal(ws.views[0].rightToLeft,true); assert.equal(ws.getColumn(6).width,20);
  assert.equal(ws.getCell('A5').value,'01'); assert.equal(ws.getCell('C5').value,'G ✓');
  for(const [cell,value] of Object.entries({L18:3300,M18:400,N18:3300,O18:3700,P18:1300,Q18:240,R18:90,S18:460,T18:460,C18:52,E18:52,F18:52,G18:52})) assert.equal(ws.getCell(cell).value,value,cell);
  assert.equal(ws.getCell('P4').alignment.textRotation,undefined);
  assert.equal(ws.getCell('A2').alignment.textRotation,90);
  const xml=await (await JSZip.loadAsync(buffer)).file('xl/worksheets/sheet1.xml').async('string'); assert.match(xml,/<brk id="21"/);
  const blank=omp.build({}).worksheets[0]; assert.equal(blank.getCell('L18').value,null); assert.equal(blank.getCell('D15').value,'تیسرے دن کا کام');
});

test('load validates IDs and restricts records to role and owner', async t => {
  const campaignId=String(new mongoose.Types.ObjectId()),teamId=String(new mongoose.Types.ObjectId()),owner=new mongoose.Types.ObjectId();
  let scope;
  t.mock.method(OMP,'find',query=>{scope=query;return {sort:()=>({lean:async()=>[{campaignDay:1}]})};});
  await omp.load({campaignId,teamId,user:{role:'AIC',_id:owner}}); assert.equal(scope.aic,owner); assert.equal(scope.team,teamId); assert.equal(scope.campaign,campaignId);
  await omp.load({campaignId,teamId,user:{role:'UCI',_id:owner}}); assert.equal(scope.uci,owner);
  await assert.rejects(omp.load({campaignId,teamId,user:{role:'FieldTeam',_id:owner}}),e=>e.statusCode===403);
  await assert.rejects(omp.load({campaignId,teamId:'bad',user:{role:'AIC',_id:owner}}),e=>e.statusCode===400);
});
