import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchForm2A, finalizeForm2A, reopenForm2A, clearForm2A } from "../store/form2aSlice";
import { reopenTallySheet } from "../../tallySheet/store/tallySheetSlice";
import { reopenFixedSheet } from "../../fixedSheet/store/fixedSheetSlice";
import { reopenTransitSheet } from "../../transitSheet/store/transitSheetSlice";
import Form2ASnapshot from "../components/Form2ASnapshot";
import Form2AMobile from "../components/Form2AMobile";
import Form2AFixedTransit from "../components/Form2AFixedTransit";
import Form2AInventory from "../components/Form2AInventory";
import { useTranslation } from "react-i18next";

const Form2APage = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { data, loading } = useSelector((state) => state.form2a);

  const [selectedDay, setSelectedDay] = useState("");
  const [activeTab, setActiveTab] = useState(1);
  const { areaId } = useSelector((state) => state.context);
  const { user } = useSelector((state) => state.auth);
  const isUci = user?.role === "UCI";

  useEffect(() => {
    if (selectedDay && areaId) {
      dispatch(fetchForm2A({ areaId, day: selectedDay }));
    } else {
      dispatch(clearForm2A());
    }
  }, [selectedDay, areaId, dispatch]);

  const handleFinalize = async () => {
    if (!areaId || !selectedDay) return;
    if (window.confirm(t("f2aFinalizeConfirm"))) {
      await dispatch(finalizeForm2A({ areaId, day: selectedDay }));
    }
  };

  const handleReopen = async () => {
    const reason = window.prompt(t("f2aReopenReason"));
    if (reason?.trim()) {
      await dispatch(reopenForm2A({ areaId, day: selectedDay, reason }));
    }
  };

  const handleReopenSheet = async (teamId, teamType) => {
    const reason = window.prompt(t("f2aReopenSheetReason", { type: t(`teamType${teamType === "tally" ? "Mobile" : teamType === "fixed" ? "Fixed" : "Transit"}`) }));
    if (!teamId || !reason?.trim()) return;

    const reopenActions = {
      tally: reopenTallySheet,
      fixed: reopenFixedSheet,
      transit: reopenTransitSheet
    };
    const action = reopenActions[teamType];
    if (!action) return;

    const result = await dispatch(action({ teamId, day: selectedDay, reason }));
    if (action.fulfilled.match(result)) {
      dispatch(fetchForm2A({ areaId, day: selectedDay }));
    }
  };

  const isFinalized = data?.status === "Finalized";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">{t("f2aTitle")}</h2>
      </div>

      <div className="bg-white p-4 rounded-lg shadow border flex gap-4">
        <div>
          <label className="block text-sm font-medium">{t("f2aSelectDay")}</label>
          <select value={selectedDay} onChange={e => setSelectedDay(e.target.value)} className="mt-1 w-64 px-3 py-2 border rounded">
            <option value="">{t("geoSelectDay")}</option>
            {[1, 2, 3, 4, 5, 6, 7].map((day) => <option key={day} value={day}>{t("geoDay", { day })}</option>)}
          </select>
        </div>
      </div>

      {loading && <p className="text-blue-600 font-medium">{t("f2aAggregating")}</p>}

      {!loading && data && (
        <div className="bg-white shadow rounded-lg flex flex-col">
          <div className={`px-6 py-3 border-b flex justify-between items-center ${isFinalized ? "bg-red-50" : "bg-yellow-50"}`}>
            <span className="font-semibold text-gray-800">{t("f2aStatus")}: {data.status === "Finalized" ? t("f2aFinalized") : t(`ampStatus${data.status}`, { defaultValue: data.status })}</span>
            {isFinalized ? (
              <span className="text-red-700 font-bold">{t("locked")}</span>
            ) : (
              <span className="text-yellow-700 text-sm">{t("f2aDraftNotice")}</span>
            )}
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b bg-gray-50 overflow-x-auto">
            <button onClick={() => setActiveTab(1)} className={`whitespace-nowrap px-6 py-3 text-sm font-bold ${activeTab === 1 ? 'border-b-2 border-blue-600 text-blue-700' : 'text-gray-500'}`}>1. {t("f2aOverview")}</button>
            <button onClick={() => setActiveTab(2)} className={`whitespace-nowrap px-6 py-3 text-sm font-bold ${activeTab === 2 ? 'border-b-2 border-blue-600 text-blue-700' : 'text-gray-500'}`}>2. {t("f2aMobileTeams")}</button>
            <button onClick={() => setActiveTab(3)} className={`whitespace-nowrap px-6 py-3 text-sm font-bold ${activeTab === 3 ? 'border-b-2 border-blue-600 text-blue-700' : 'text-gray-500'}`}>3. {t("f2aFixedTransit")}</button>
            <button onClick={() => setActiveTab(4)} className={`whitespace-nowrap px-6 py-3 text-sm font-bold ${activeTab === 4 ? 'border-b-2 border-blue-600 text-blue-700' : 'text-gray-500'}`}>4. {t("f2aInventory")}</button>
          </div>

          <div className="p-6 overflow-x-auto">
            {activeTab === 1 && <Form2ASnapshot data={data} />}
            {activeTab === 2 && <Form2AMobile data={data} onReopenSheet={!isFinalized ? handleReopenSheet : undefined} />}
            {activeTab === 3 && <Form2AFixedTransit data={data} onReopenSheet={!isFinalized ? handleReopenSheet : undefined} />}
            {activeTab === 4 && <Form2AInventory data={data} />}
          </div>

          <div className="p-6 bg-gray-50 border-t flex justify-end">
            {isUci && isFinalized ? (
              <button onClick={handleReopen} className="px-6 py-2 bg-orange-600 text-white rounded hover:bg-orange-700">
                {t("f2aReopen")}
              </button>
            ) : (
              <button
                onClick={handleFinalize}
                disabled={isFinalized || (data.teamCounts.totalMobile + data.teamCounts.totalFixed + data.teamCounts.totalTransit) === 0 || isUci}
                className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                {isFinalized ? t("f2aFinalized") : t("f2aFinalize")}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Form2APage;
