import { useTranslation } from "react-i18next";

const Form2AInventory = ({ data }) => {
  const { t } = useTranslation();
  const { collectiveInventory: inv } = data;
  if (!inv) return null;

  return (
    <div className="space-y-8">
      <h3 className="text-xl font-bold text-gray-800">{t("f2aInventoryTitle")}</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* VACCINES MASTER TABLE */}
        <div className="border rounded shadow-sm">
          <div className="bg-yellow-50 p-3 border-b font-bold text-yellow-900">{t("f2aVaccinesRecord")}</div>
          <table className="w-full text-center text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2 border">{t("f2aTeamType")}</th>
                <th className="p-2 border">{t("received")}</th>
                <th className="p-2 border">{t("used")}</th>
                <th className="p-2 border">{t("returned")}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="p-2 border font-medium text-left">{t("f2aMobileTeams")}</td>
                <td className="p-2 border">{inv.vaccines.mobile.received}</td>
                <td className="p-2 border">{inv.vaccines.mobile.used}</td>
                <td className="p-2 border">{inv.vaccines.mobile.returned}</td>
              </tr>
              <tr>
                <td className="p-2 border font-medium text-left">{t("fixedTeams")}</td>
                <td className="p-2 border">{inv.vaccines.fixed.received}</td>
                <td className="p-2 border">{inv.vaccines.fixed.used}</td>
                <td className="p-2 border">{inv.vaccines.fixed.returned}</td>
              </tr>
              <tr>
                <td className="p-2 border font-medium text-left">{t("transitTeams")}</td>
                <td className="p-2 border">{inv.vaccines.transit.received}</td>
                <td className="p-2 border">{inv.vaccines.transit.used}</td>
                <td className="p-2 border">{inv.vaccines.transit.returned}</td>
              </tr>
            </tbody>
            <tfoot className="bg-yellow-600 text-white font-bold">
              <tr>
                <td className="p-2 border text-left">{t("f2aDailyTotal")}</td>
                <td className="p-2 border">{inv.vaccines.dailyTotal.received}</td>
                <td className="p-2 border">{inv.vaccines.dailyTotal.used}</td>
                <td className="p-2 border">{inv.vaccines.dailyTotal.returned}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* MARKERS MASTER TABLE */}
        <div className="border rounded shadow-sm">
          <div className="bg-gray-100 p-3 border-b font-bold text-gray-800">{t("f2aMarkersRecord")}</div>
          <table className="w-full text-center text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2 border">{t("f2aTeamType")}</th>
                <th className="p-2 border">{t("received")}</th>
                <th className="p-2 border">{t("used")}</th>
                <th className="p-2 border">{t("returned")}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="p-2 border font-medium text-left">{t("f2aMobileTeams")}</td>
                <td className="p-2 border">{inv.markers.mobile.received}</td>
                <td className="p-2 border">{inv.markers.mobile.used}</td>
                <td className="p-2 border">{inv.markers.mobile.returned}</td>
              </tr>
              <tr>
                <td className="p-2 border font-medium text-left">{t("fixedTeams")}</td>
                <td className="p-2 border">{inv.markers.fixed.received}</td>
                <td className="p-2 border">{inv.markers.fixed.used}</td>
                <td className="p-2 border">{inv.markers.fixed.returned}</td>
              </tr>
              <tr>
                <td className="p-2 border font-medium text-left">{t("transitTeams")}</td>
                <td className="p-2 border">{inv.markers.transit.received}</td>
                <td className="p-2 border">{inv.markers.transit.used}</td>
                <td className="p-2 border">{inv.markers.transit.returned}</td>
              </tr>
            </tbody>
            <tfoot className="bg-gray-700 text-white font-bold">
              <tr>
                <td className="p-2 border text-left">{t("f2aDailyTotal")}</td>
                <td className="p-2 border">{inv.markers.dailyTotal.received}</td>
                <td className="p-2 border">{inv.markers.dailyTotal.used}</td>
                <td className="p-2 border">{inv.markers.dailyTotal.returned}</td>
              </tr>
            </tfoot>
          </table>
        </div>

      </div>
    </div>
  );
};

export default Form2AInventory;
