import { useTranslation } from "react-i18next";

const Form2ASnapshot = ({ data }) => {
  const { t } = useTranslation();
  if (!data) return null;
  const { snapshot, teamCounts } = data;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Sections 1 & 2 */}
        <div className="bg-gray-50 p-4 border rounded shadow-sm">
          <h3 className="font-semibold text-gray-800 border-b pb-2 mb-3">{t("f2aCampaignPersonnel")}</h3>
          <ul className="text-sm space-y-2 text-gray-700">
            <li><strong>{t("campaign")}</strong> {snapshot.campaignName}</li>
            <li><strong>{t("sia")}</strong> {snapshot.sia}</li>
            <li><strong>{t("day")}</strong> {data.campaignDay}</li>
            <li className="pt-2"><strong>{t("uci")}</strong> {snapshot.uciName} ({snapshot.uciNo})</li>
            <li><strong>{t("aic")}</strong> {snapshot.aicName} ({snapshot.aicNo})</li>
          </ul>
        </div>

        {/* Section 3 */}
        <div className="bg-gray-50 p-4 border rounded shadow-sm">
          <h3 className="font-semibold text-gray-800 border-b pb-2 mb-3">{t("f2aAreaInfo")}</h3>
          <ul className="text-sm space-y-2 text-gray-700">
            <li><strong>{t("province")}</strong> {snapshot.province}</li>
            <li><strong>{t("district")}</strong> {snapshot.district}</li>
            <li><strong>{t("townTehsil")}</strong> {snapshot.tehsil}</li>
            <li><strong>{t("uc")}</strong> {snapshot.ucName} ({snapshot.ucNo})</li>
            <li><strong>{t("area")}</strong> {snapshot.areaName} ({snapshot.areaNo})</li>
          </ul>
        </div>

        {/* Section 4 */}
        <div className="bg-blue-50 p-4 border border-blue-200 rounded shadow-sm">
          <h3 className="font-semibold text-blue-900 border-b border-blue-200 pb-2 mb-3">{t("f2aTeamsToday")}</h3>
          <div className="grid grid-cols-3 gap-2 text-center mt-4">
            <div className="bg-white p-2 rounded shadow-sm">
              <span className="block text-2xl font-bold text-blue-700">{teamCounts.totalMobile}</span>
              <span className="text-xs text-gray-600 font-medium">{t("teamTypeMobile")}</span>
            </div>
            <div className="bg-white p-2 rounded shadow-sm">
              <span className="block text-2xl font-bold text-blue-700">{teamCounts.totalFixed}</span>
              <span className="text-xs text-gray-600 font-medium">{t("teamTypeFixed")}</span>
            </div>
            <div className="bg-white p-2 rounded shadow-sm">
              <span className="block text-2xl font-bold text-blue-700">{teamCounts.totalTransit}</span>
              <span className="text-xs text-gray-600 font-medium">{t("teamTypeTransit")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Form2ASnapshot;
