import { useTranslation } from "react-i18next";
const Form2AMobile = ({ data, onReopenSheet }) => {
  const { t } = useTranslation();
  const perfs = data.mobilePerformances || [];
  const totals = data.aggregatedMobileTotals || {};

  if (perfs.length === 0) {
    return <div className="p-6 text-center text-gray-500">{t("f2aNoMobile")}</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-gray-800">{t("f2aMobilePerformance")}</h3>
      <div className="overflow-x-auto pb-4 border border-gray-200 rounded-sm">
        <table className="min-w-max w-full text-xs text-center border-collapse">
          <thead className="bg-blue-50 text-blue-900 sticky top-0">
            <tr>
              <th className="border p-2" rowSpan="3">{t("teamNo")}</th>
              <th className="border p-2" rowSpan="3">{t("f2aMembers")}</th>
              <th className="border p-2" colSpan="2" rowSpan="2">{t("f2aHouseholds")}</th>
              <th className="border p-2" colSpan="2" rowSpan="2">{t("f2aTargetChild")}</th>
              <th className="border p-2" colSpan="2" rowSpan="2">{t("f2aVaccinatedHH")}</th>
              <th className="border p-2 bg-red-50" colSpan="4">{t("f2aRecordedMissed")}</th>
              <th className="border p-2 bg-green-50" colSpan="4">{t("f2aCoveredMissed")}</th>
              <th className="border p-2" colSpan="3" rowSpan="2">{t("f2aOtherVacc")}</th>
              <th className="border p-2" colSpan="2" rowSpan="2">{t("f2aMmp")}</th>
              <th className="border p-2" colSpan="2" rowSpan="2">{t("f2aHouses")}</th>
              <th className="border p-2" colSpan="3" rowSpan="2">{t("f2aVaccines")}</th>
              <th className="border p-2" colSpan="2" rowSpan="2">{t("f2aCases")}</th>
            </tr>
            <tr className="bg-blue-100">
              <th className="border p-1 bg-red-100" colSpan="2">{t("f2aNotAvailable61")}</th>
              <th className="border p-1 bg-red-100" colSpan="2">{t("f2aRefusal62")}</th>
              <th className="border p-1 bg-green-100" colSpan="2">{t("f2aNotAvailable71")}</th>
              <th className="border p-1 bg-green-100" colSpan="2">{t("f2aRefusal72")}</th>
            </tr>
            <tr className="bg-blue-50">
              <th className="border p-1">{t("f2aTarget")}</th>
              <th className="border p-1">{t("f2aVisited")}</th>
              <th className="border p-1">{t("f2aUnderOne")}</th>
              <th className="border p-1">{t("f2aOneToFive")}</th>
              <th className="border p-1">{t("f2aUnderOne")}</th>
              <th className="border p-1">{t("f2aOneToFive")}</th>
              {/* Field 6 sub-columns */}
              <th className="border p-1 bg-red-50">{t("f2aUnderOne")}</th>
              <th className="border p-1 bg-red-50">{t("f2aOneToFive")}</th>
              <th className="border p-1 bg-red-50">{t("f2aUnderOne")}</th>
              <th className="border p-1 bg-red-50">{t("f2aOneToFive")}</th>
              {/* Field 7 sub-columns */}
              <th className="border p-1 bg-green-50">{t("f2aUnderOne")}</th>
              <th className="border p-1 bg-green-50">{t("f2aUnderFive")}</th>
              <th className="border p-1 bg-green-50">{t("f2aUnderOne")}</th>
              <th className="border p-1 bg-green-50">{t("f2aOneToFive")}</th>
              {/* Other columns */}
              <th className="border p-1">{t("f2aSchool")}</th>
              <th className="border p-1">{t("f2aGuest")}</th>
              <th className="border p-1">{t("f2aStreet")}</th>
              <th className="border p-1">{t("f2aTotal")}</th>
              <th className="border p-1">{t("f2aVaccinated")}</th>
              <th className="border p-1">{t("f2aZeroHouse")}</th>
              <th className="border p-1">{t("f2aLock")}</th>
              <th className="border p-1">{t("f2aReceivedShort")}</th>
              <th className="border p-1">{t("used")}</th>
              <th className="border p-1">{t("f2aReturnedShort")}</th>
              <th className="border p-1">{t("AFP")}</th>
              <th className="border p-1">{t("f2aZeroDoseShort")}</th>
              {onReopenSheet && <th className="border p-1" rowSpan="3">{t("actions")}</th>}
            </tr>
          </thead>
          <tbody>
            {perfs.map((p, idx) => (
              <tr key={idx} className="hover:bg-gray-50 border-b">
                <td className="border p-2 font-bold">{p.teamNo}</td>
                <td className="border p-2 text-left">
                  <div className="font-medium">{p.leaderName}</div>
                  <div className="text-gray-500">{p.memberName}</div>
                </td>
                <td className="border p-2">{p.targetHouseholds}</td>
                <td className="border p-2">{p.visitedHouseholds}</td>
                <td className="border p-2">{p.ompChildrenUnder1}</td>
                <td className="border p-2">{p.ompChildren1to5}</td>
                <td className="border p-2 bg-green-50">{p.vaccUnder1}</td>
                <td className="border p-2 bg-green-50">{p.vacc1to5}</td>
                {/* 6. Recorded Missed */}
                <td className="border p-2 bg-red-50/40">{p.recordedMissed?.notAvailable?.under1 || 0}</td>
                <td className="border p-2 bg-red-50/40">{p.recordedMissed?.notAvailable?.oneToFive || 0}</td>
                <td className="border p-2 bg-red-50/40">{p.recordedMissed?.refusal?.under1 || 0}</td>
                <td className="border p-2 bg-red-50/40">{p.recordedMissed?.refusal?.oneToFive || 0}</td>
                {/* 7. Covered Missed */}
                <td className="border p-2 bg-green-50/40">{p.coveredMissed?.notAvailable?.under1 || 0}</td>
                <td className="border p-2 bg-green-50/40">{p.coveredMissed?.notAvailable?.under5 || 0}</td>
                <td className="border p-2 bg-green-50/40">{p.coveredMissed?.refusal?.under1 || 0}</td>
                <td className="border p-2 bg-green-50/40">{p.coveredMissed?.refusal?.oneToFive || 0}</td>
                {/* 8 - 17 */}
                <td className="border p-2">{p.schoolVaccinated}</td>
                <td className="border p-2">{p.guestVaccinated}</td>
                <td className="border p-2">{p.streetVaccinated}</td>
                <td className="border p-2">{p.mmpTotal}</td>
                <td className="border p-2 bg-green-50">{p.mmpVaccinated}</td>
                <td className="border p-2 text-red-600">{p.zeroHouses}</td>
                <td className="border p-2 text-red-600">{p.lockHouses}</td>
                <td className="border p-2">{p.vaccines?.received}</td>
                <td className="border p-2 bg-yellow-50">{p.vaccines?.used}</td>
                <td className="border p-2">{p.vaccines?.returned}</td>
                <td className="border p-2">{p.afpCases}</td>
                <td className="border p-2">{p.zeroDoseRI}</td>
                {onReopenSheet && <td className="border p-2"><button type="button" onClick={() => onReopenSheet(p.team, "tally")} className="whitespace-nowrap rounded bg-orange-100 px-2 py-1 text-xs font-semibold text-orange-800 hover:bg-orange-200">{t("f2aReopenSheet")}</button></td>}
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-blue-600 text-white font-bold">
            <tr>
              <td className="border p-2" colSpan="2">{t("f2aAreaTotals")}</td>
              <td className="border p-2">{totals.targetHouseholds || 0}</td>
              <td className="border p-2">{totals.visitedHouseholds || 0}</td>
              <td className="border p-2">{totals.ompChildrenUnder1 || 0}</td>
              <td className="border p-2">{totals.ompChildren1to5 || 0}</td>
              <td className="border p-2">{totals.vaccUnder1 || 0}</td>
              <td className="border p-2">{totals.vacc1to5 || 0}</td>
              {/* Totals for 6. Recorded Missed */}
              <td className="border p-2">{totals.recordedMissed?.notAvailable?.under1 || 0}</td>
              <td className="border p-2">{totals.recordedMissed?.notAvailable?.oneToFive || 0}</td>
              <td className="border p-2">{totals.recordedMissed?.refusal?.under1 || 0}</td>
              <td className="border p-2">{totals.recordedMissed?.refusal?.oneToFive || 0}</td>
              {/* Totals for 7. Covered Missed */}
              <td className="border p-2">{totals.coveredMissed?.notAvailable?.under1 || 0}</td>
              <td className="border p-2">{totals.coveredMissed?.notAvailable?.under5 || 0}</td>
              <td className="border p-2">{totals.coveredMissed?.refusal?.under1 || 0}</td>
              <td className="border p-2">{totals.coveredMissed?.refusal?.oneToFive || 0}</td>
              {/* Totals for 8 - 17 */}
              <td className="border p-2">{totals.schoolVaccinated || 0}</td>
              <td className="border p-2">{totals.guestVaccinated || 0}</td>
              <td className="border p-2">{totals.streetVaccinated || 0}</td>
              <td className="border p-2">{totals.mmpTotal || 0}</td>
              <td className="border p-2">{totals.mmpVaccinated || 0}</td>
              <td className="border p-2">{totals.zeroHouses || 0}</td>
              <td className="border p-2">{totals.lockHouses || 0}</td>
              <td className="border p-2" colSpan="3">{t("f2aSeeInventory")}</td>
              <td className="border p-2">{totals.afpCases || 0}</td>
              <td className="border p-2">{totals.zeroDoseRI || 0}</td>
              {onReopenSheet && <td className="border p-2">-</td>}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default Form2AMobile;
