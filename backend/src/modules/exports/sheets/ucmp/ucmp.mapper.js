import { toNum, sum, yesNoUrdu } from '../../core/fieldUtils.js';

export function mapUcmp(doc = {}) {
  const text = 'sia campaignName district tehsil ucName uciChargeName uciPhoneNo ucSecretary ucSecretaryPhoneNo vaccinatorName status'.split(' ');
  const numeric = 'totalAICs totalFemaleAICs totalGovtAICs aicsPastTwoCampaigns currentCampaignTotalHH totalBelow5Years totalHHChildren totalSchoolMadrasaChildren expectedFixedPointChildren expectedTransitPointChildren totalChildren totalMobileTeams totalFixedTeams totalTransitTeams teamsRequiringSpecialAttention totalVaccineDoses totalTallysheets totalChalkBoxes markers plasticBags pens totalBadgeCards vitaminARed vitaminABlue mobileGovtPerson mobileFemaleMember mobileLocalPerson highAttentionHRMPTotal vaccineVial dropper totalRefusalChildren totalMadrasas totalMosques totalHighSchools totalSchoolsMadrasasBelow5 unvaccinatedLastCampaign unvaccinatedPastTwoCampaigns totalUnderDoseChildren protectedVaccinationsAfterLast totalUnder1Year totalVillages newRegionsAdded teamsVisitedBefore teamsWithHHInMaps newHRMPRegistered areaListsVerified'.split(' ');
  const result = Object.fromEntries([...text.map(k => [k, doc[k] ?? '']), ...numeric.map(k => [k, toNum(doc[k])])]);
  result.vaccineCarrierRequired = toNum(doc.vaccineCarrierRequired);
  result.vaccineCarrierAvailable = toNum(doc.vaccineCarrierAvailable);
  result.bothAdults = yesNoUrdu(doc.bothAdults);
  result.totalTeams = sum(result.totalMobileTeams, result.totalFixedTeams, result.totalTransitTeams);
  result.uciNo = doc.uci?.uciNo ?? ''; result.cnic = doc.uci?.username ?? ''; result.ucNumber = doc.uci?.ucNumber ?? '';
  const date = doc.campaign?.startDate ? new Date(doc.campaign.startDate) : null;
  result.year = date && !Number.isNaN(date.getTime()) ? date.getFullYear() : (String(result.campaignName).match(/\b\d{4}\b/)?.[0] ?? '');
  return result;
}
