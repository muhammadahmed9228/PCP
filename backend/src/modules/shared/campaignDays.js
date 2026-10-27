export const CAMPAIGN_DAYS = Object.freeze([1, 2, 3, 4, 5, 6, 7]);
export const MOBILE_CAMPAIGN_DAYS = Object.freeze([1, 2, 3]);

export const isValidCampaignDay = (day) => CAMPAIGN_DAYS.includes(Number(day));
export const isMobileCampaignDay = (day) => MOBILE_CAMPAIGN_DAYS.includes(Number(day));
