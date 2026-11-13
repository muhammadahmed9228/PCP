import { calculateTeamOmpTotals } from '../../../omp/omp.totals.js';

export function mapOmp(input = {}) {
  const records = Array.isArray(input.records) ? input.records : [];
  const first = key => records.map(record => record[key]).find(value => value !== undefined && value !== null && value !== '') ?? '';
  const header = Object.fromEntries('campaignName sia uciNo uciName ucNumber ucName province district tehsil aicName aicNo areaNo areaName teamNo'.split(' ').map(key => [key,first(key)]));
  const person = key => { const value=records.map(record=>record[key]).find(p=>p && (p.name || p.position || p.cnic || p.states?.length)) || {}; return {name:value.name ?? '',position:value.position ?? '',cnic:value.cnic ?? '',states:Array.isArray(value.states)?value.states:[]}; };
  const fields={households:'totalHouseholds',school:'totalSchoolMadrasa',under1:'totalUnder1Year',oneToFive:'total1to5Years',doses:'totalVaccineDoses',unvacc:'totalUnvaccinatedPast',migrant:'totalMigrantMobile',red:'vitaminARed',blue:'vitaminABlue',marker:'marker',chalk:'chalk',dropper:'dropper',bags:'plasticBags'};
  const combined=(a,b)=>a == null && b == null ? '' : (a ?? 0)+(b ?? 0);
  const translate = values => { const result=Object.fromEntries(Object.entries(fields).map(([key,source])=>[key,values[source] ?? ''])); result.hh05=combined(values.totalUnder1Year,values.total1to5Years); result.grandTotal=values.grandTotalChildren ?? ''; return result; };
  const calculated=calculateTeamOmpTotals(records);
  const days=calculated.days.map(day=>{ const source=records.find(record=>record.campaignDay===day.day) || {}; return {day:day.day,status:source.status ?? '',villageName:source.villageName ?? '',placeName:source.placeName ?? '',communityVaccinationPlace:source.communityVaccinationPlace ?? '',workSequence:source.workSequence ?? '',headFirst:source.headOfFirstHouse ?? '',headLast:source.headOfLastHouse ?? '',areaCategory:source.areaCategory ?? '',routeNo:source.routeNo ?? '',routeName:source.routeName ?? '',...translate(day.values)}; });
  return {...header,leader:person('teamLeader'),member:person('teamMember'),days,totals:translate(calculated.totals)};
}
