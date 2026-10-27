import { useTranslation } from "react-i18next";
const THEMES = {
  indigo: {
    title: "text-indigo-900",
    header: "bg-indigo-50 text-indigo-900",
    footer: "bg-indigo-600 text-white",
    footerBg: "#4f46e5"
  },
  teal: {
    title: "text-teal-900",
    header: "bg-teal-50 text-teal-900",
    footer: "bg-teal-700 text-white",
    footerBg: "#0f766e"
  }
};

const TeamTable = ({ title, perfs, totals, bgColor = "indigo", teamType, onReopenSheet }) => {
  const { t } = useTranslation();
  if (!perfs || perfs.length === 0) {
    return <div className="p-4 text-gray-500 italic border rounded">{t("f2aNoTeamReports", { title })}</div>;
  }

  const theme = THEMES[bgColor] || THEMES.indigo;

  // Calculate total vaccinated fallback from perfs if totals object doesn't have it
  const totalVaccinated = totals?.vaccinatedChildren != null
    ? totals.vaccinatedChildren
    : perfs.reduce((sum, p) => sum + (Number(p.vaccinatedChildren) || 0), 0);

  return (
    <div className="mb-8">
      <h3 className={`text-lg font-bold mb-3 ${theme.title}`}>{t("f2aTeamPerformance", { title })}</h3>
      <div className="overflow-x-auto border rounded-sm">
        <table className="min-w-full text-sm text-center border-collapse">
          <thead className={theme.header}>
            <tr>
              <th className="border p-2">{t("teamNo")}</th>
              <th className="border p-2">{t("f2aMembers")}</th>
              <th className="border p-2 bg-green-50">{t("f2aTotalVaccinated")}</th>
              <th className="border p-2">{t("f2aAfpNotified")}</th>
              <th className="border p-2">{t("f2aZeroDoseRI")}</th>
              <th className="border p-2">{t("f2aVaccinesUsed")}</th>
              <th className="border p-2">{t("f2aMarkersUsed")}</th>
              {onReopenSheet && <th className="border p-2">{t("actions")}</th>}
            </tr>
          </thead>
          <tbody>
            {perfs.map((p, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="border p-2 font-bold">{p.teamNo}</td>
                <td className="border p-2 text-left">
                  <div>{p.leaderName}</div>
                  <div className="text-gray-500 text-xs">{p.memberName}</div>
                </td>
                <td className="border p-2 bg-green-50 font-bold">{p.vaccinatedChildren}</td>
                <td className="border p-2">{p.afpCases}</td>
                <td className="border p-2">{p.zeroDoseRI}</td>
                <td className="border p-2">{p.vaccines?.used || 0}</td>
                <td className="border p-2">{p.markers?.used || 0}</td>
                {onReopenSheet && <td className="border p-2"><button type="button" onClick={() => onReopenSheet(p.team, teamType)} className="whitespace-nowrap rounded bg-orange-100 px-2 py-1 text-xs font-semibold text-orange-800 hover:bg-orange-200">{t("f2aReopenSheet")}</button></td>}
              </tr>
            ))}
          </tbody>
          <tfoot 
            className={`${theme.footer} font-bold`}
            style={{ backgroundColor: theme.footerBg, color: "#ffffff" }}
          >
            <tr>
              <td className="border p-2" colSpan="2">{t("f2aTotals", { title })}</td>
              <td className="border p-2">{totalVaccinated}</td>
              <td className="border p-2" colSpan="4">{t("f2aRestInventory")}</td>
              {onReopenSheet && <td className="border p-2">-</td>}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

const Form2AFixedTransit = ({ data, onReopenSheet }) => {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <TeamTable 
        title={t("f2aFixedSection")} 
        perfs={data.fixedPerformances} 
        totals={data.aggregatedFixedTotals} 
        bgColor="indigo" 
        teamType="fixed"
        onReopenSheet={onReopenSheet}
      />
      
      <TeamTable 
        title={t("f2aTransitSection")} 
        perfs={data.transitPerformances} 
        totals={data.aggregatedTransitTotals} 
        bgColor="teal" 
        teamType="transit"
        onReopenSheet={onReopenSheet}
      />
    </div>
  );
};

export default Form2AFixedTransit;
