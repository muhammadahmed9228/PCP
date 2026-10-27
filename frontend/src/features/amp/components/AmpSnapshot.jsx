import { useTranslation } from "react-i18next";

const AmpSnapshot = ({ data }) => {
  const { t } = useTranslation();
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Section 1: Campaign & SIA */}
        <div className="bg-gray-50 p-4 border rounded shadow-sm">
          <h4 className="font-semibold text-gray-800 border-b pb-2 mb-3">
            {t("ampSnapshotSection1")}
          </h4>
          <ul className="text-sm space-y-2 text-gray-700">
            <li><strong>{t("campaignName")}:</strong> {data.campaignName || t("notAvailableShort")}</li>
            <li><strong>{t("teamSiaName")}:</strong> {data.sia || t("notAvailableShort")}</li>
            <li><strong>{t("areaNumber")}:</strong> {data.areaNo || t("notAvailableShort")}</li>
            <li><strong>{t("areaName")}:</strong> {data.areaName || t("notAvailableShort")}</li>
          </ul>
        </div>

        {/* Section 2: Administrative Geography */}
        <div className="bg-gray-50 p-4 border rounded shadow-sm">
          <h4 className="font-semibold text-gray-800 border-b pb-2 mb-3">
            {t("ampSnapshotSection2")}
          </h4>
          <ul className="text-sm space-y-2 text-gray-700">
            <li><strong>{t("district")}:</strong> {data.district || t("notAvailableShort")}</li>
            <li><strong>{t("townTehsil")}:</strong> {data.tehsil || t("notAvailableShort")}</li>
            <li><strong>{t("ucName")}:</strong> {data.ucName || t("notAvailableShort")}</li>
            <li><strong>{t("ucNumber")}:</strong> {data.ucNumber || t("notAvailableShort")}</li>
            <li className="pt-1 border-t text-xs text-gray-500">
              <strong>{t("uci")}:</strong> {data.uciName || t("notAvailableShort")} ({data.uciNo || t("notAvailableShort")})
            </li>
          </ul>
        </div>

        {/* Section 3: AIC Snapshot Info */}
        <div className="bg-blue-50 p-4 border border-blue-200 rounded shadow-sm">
          <h4 className="font-semibold text-blue-900 border-b border-blue-200 pb-2 mb-3">
            {t("ampSnapshotSection3")}
          </h4>
          <ul className="text-sm space-y-2 text-blue-950">
            <li><strong>{t("aicName")}:</strong> {data.aicName || t("notAvailableShort")}</li>
            <li><strong>{t("phoneNumber")}:</strong> {data.aicPhoneNo || t("notAvailableShort")}</li>
            <li><strong>{t("gender")}:</strong> {data.aicGender ? t(data.aicGender.toLowerCase()) : t("notAvailableShort")}</li>
            <li><strong>{t("governmentEmployee")}:</strong> {data.isGovtEmployee ? t("yes") : t("no")}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AmpSnapshot;
