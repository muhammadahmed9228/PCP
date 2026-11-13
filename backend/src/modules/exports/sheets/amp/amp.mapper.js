import { toNum, sum, yesNoUrdu } from '../../core/fieldUtils.js';

export function mapAmp(doc = {}) {
  const text = {sia:'sia',areaNumber:'areaNo',areaName:'areaName',uciName:'uciName',uciNo:'uciNo',campaignName:'campaignName',district:'district',tehsil:'tehsil',ucName:'ucName',ucNumber:'ucNumber',aicName:'aicName',aicPhone:'aicPhoneNo',vaccinatorName:'vaccinatorName',ampStatus:'status'};
  const numeric = {households:'currentCampaignTotalHH',below5:'totalBelow5Years',hhChildren:'totalHHChildren',schoolChildren:'totalSchoolMadrasaChildren',fixedChildren:'expectedFixedPointChildren',transitChildren:'expectedTransitPointChildren',totalChildren:'totalChildren',mobileTeams:'totalMobileTeams',fixedTeams:'totalFixedTeams',transitTeams:'totalTransitTeams',specialTeams:'teamsRequiringSpecialAttention',carrierRequired:'vaccineCarrierRequired',carrierAvailable:'vaccineCarrierAvailable',vitARed:'vitaminARed',vitABlue:'vitaminABlue',doses:'totalVaccineDoses',tally:'totalTallysheets',chalk:'totalChalkBoxes',markers:'markers',bags:'plasticBags',pens:'pens',badge:'totalBadgeCards',teamsGovt:'mobileGovtPerson',teamsFemale:'mobileFemaleMember',teamsLocal:'mobileLocalPerson',vial:'vaccineVial',dropper:'dropper',refusal:'totalRefusalChildren',madrasas:'totalMadrasas',mosques:'totalMosques',highSchools:'totalHighSchools',schoolsBelow5:'totalSchoolsMadrasasBelow5',unvaccLast:'unvaccinatedLastCampaign',unvacc2Plus:'unvaccinatedPastTwoCampaigns',underdose:'totalUnderDoseChildren',protectedAfter:'protectedVaccinationsAfterLast',reopenCount:'reopenCount'};
  const out = Object.fromEntries([...Object.entries(text).map(([k,v])=>[k,doc[v] ?? '']), ...Object.entries(numeric).map(([k,v])=>[k,toNum(doc[v])])]);
  out.aicNo=doc.aic?.aicNo ?? ''; out.cnic=doc.aic?.username ?? ''; out.aicIsGovt=yesNoUrdu(doc.isGovtEmployee); out.bothAdult=yesNoUrdu(doc.bothAdults);
  out.aicGender=({Male:'مرد',Female:'عورت'})[doc.aicGender] ?? ''; out.migrantMobileChildren=toNum(doc.migrantMobileChildren);
  out.totalTeams=sum(out.mobileTeams,out.fixedTeams,out.transitTeams);
  const date=doc.campaign?.startDate ? new Date(doc.campaign.startDate) : null;
  out.year=date && !Number.isNaN(date.getTime()) ? date.getFullYear() : (String(out.campaignName).match(/\b\d{4}\b/)?.[0] ?? '');
  const format=(v,time=false)=>{ if(!v) return ''; const d=new Date(v); if(Number.isNaN(d.getTime())) return ''; const p=n=>String(n).padStart(2,'0'); return `${p(d.getUTCDate())}/${p(d.getUTCMonth()+1)}/${d.getUTCFullYear()}${time ? ` ${p(d.getUTCHours())}:${p(d.getUTCMinutes())}` : ''}`; };
  out.finalizedAt=format(doc.finalizedAt); out.approvedAt=format(doc.approvedAt); out.approvedByName=doc.approvedBy?.uciName ?? '';
  out.history=(doc.reviewHistory || []).map(event=>({action:event.action ?? '',reviewer:event.reviewer?.uciName ?? '',reason:event.reason ?? '',date:format(event.at,true),time:new Date(event.at).getTime()})).sort((a,b)=>(a.time || 0)-(b.time || 0));
  return out;
}
