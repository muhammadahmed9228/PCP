import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { fetchForm2B, finalizeForm2B, reopenForm2B, clearForm2B } from "../store/form2bSlice";
import { reopenForm2A } from "../../form2a/store/form2aSlice";
import { fetchCampaigns } from "../../campaigns/store/campaignSlice";
import Form2BSnapshot from "../components/Form2BSnapshot";
import Form2BMobile from "../components/Form2BMobile";
import Form2BFixedTransit from "../components/Form2BFixedTransit";
import Form2BInventory from "../components/Form2BInventory";
import { useTranslation } from "react-i18next";
import "../../../i18n/i18n";

const Form2BPage = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const { data, loading } = useSelector((state) => state.form2b);
  const { campaigns = [] } = useSelector((state) => state.campaigns || {});

  const [selectedCampaignId, setSelectedCampaignId] = useState(() => searchParams.get("campaign") || "");
  const [selectedDay, setSelectedDay] = useState(() => (searchParams.get("campaign") ? "1" : ""));
  const [activeTab, setActiveTab] = useState(1);

  useEffect(() => {
    dispatch(fetchCampaigns());
  }, [dispatch]);

  useEffect(() => {
    if (selectedCampaignId && selectedDay) {
      dispatch(fetchForm2B({ campaignId: selectedCampaignId, day: selectedDay }));
    } else {
      dispatch(clearForm2B());
    }
  }, [selectedCampaignId, selectedDay, dispatch]);

  const isFinalized = data?.status === "Finalized";
  const visibleCampaigns = campaigns.filter((c) => c.status === "Active" || c.status === "Completed");
  const selectedCampaign = campaigns.find((campaign) => campaign._id === selectedCampaignId);
  const isHistorical = selectedCampaign?.status === "Completed";
  const canEdit = selectedCampaign?.status === "Active";

  const handleRefresh = () => {
    if (selectedCampaignId && selectedDay) {
      dispatch(fetchForm2B({ campaignId: selectedCampaignId, day: selectedDay }));
    }
  };

  const handleFinalize = async () => {
    if (window.confirm(t("finalizeForm2bConfirm"))) {
      await dispatch(finalizeForm2B({ campaignId: selectedCampaignId, day: selectedDay }));
    }
  };

  const handleReopen = async () => {
    const reason = window.prompt(t("reopenForm2bReason"));
    if (reason?.trim()) {
      await dispatch(reopenForm2B({ campaignId: selectedCampaignId, day: selectedDay, reason }));
    }
  };

  const handleReopenForm2A = async (areaId) => {
    const reason = window.prompt(t("reopenForm2aReason"));
    if (!areaId || !reason?.trim()) return;

    const result = await dispatch(reopenForm2A({ areaId, day: selectedDay, reason }));
    if (reopenForm2A.fulfilled.match(result)) {
      await dispatch(fetchForm2B({ campaignId: selectedCampaignId, day: selectedDay }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">
          {t("form2bTitle")}
        </h2>
        {selectedCampaignId && selectedDay && !isFinalized && canEdit && (
          <button
            onClick={handleRefresh}
            className="px-4 py-2 text-sm bg-gray-100 border rounded hover:bg-gray-200 font-medium"
          >
            {t("resyncAicReports")}
          </button>
        )}
      </div>

      {/* Campaign & Day Selection Bar */}
      <div className="bg-white p-4 rounded-lg shadow border flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700">{t("campaign")}</label>
          <select
            value={selectedCampaignId}
            onChange={(e) => setSelectedCampaignId(e.target.value)}
            className="mt-1 w-full px-3 py-2 border rounded"
          >
            <option value="">{t("selectCampaign")}</option>
            {visibleCampaigns.map((c) => (
              <option key={c._id} value={c._id}>
                {c.campaignName} ({c.status === "Completed" ? "Historical" : c.nameOfSIA})
              </option>
            ))}
          </select>
        </div>

        <div className="w-full sm:w-48">
          <label className="block text-sm font-medium text-gray-700">{t("campaignDay")}</label>
          <select
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
            className="mt-1 w-full px-3 py-2 border rounded"
          >
            <option value="">{t("selectDay")}</option>
            {[1, 2, 3, 4, 5, 6, 7].map((day) => <option key={day} value={day}>Day {day}</option>)}
          </select>
        </div>
      </div>

      {loading && (
        <div className="p-8 text-center bg-white rounded shadow border text-blue-600 font-medium">
          {t("aggregatingForm2a")}
        </div>
      )}

      {!loading && data && (
        <div className="bg-white shadow rounded-lg flex flex-col">
          {/* Status Banner */}
          <div
            className={`px-6 py-3 border-b flex justify-between items-center ${
              isFinalized ? "bg-red-50" : "bg-yellow-50"
            }`}
          >
            <div>
              <span className="font-semibold text-gray-800">{t("status")}: {data.status}</span>
              {data.reopenReason && (
                <span className="ml-4 text-xs text-gray-600 italic">
                ({t("lastReopenReason")}: {data.reopenReason})
                </span>
              )}
            </div>
            {isFinalized ? (
              <span className="text-red-700 font-bold">{t("lockedAtUcLevel")}</span>
            ) : (
              <span className="text-yellow-700 text-sm font-medium">
                {t("draftCompilesForm2a")}
              </span>
            )}
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b bg-gray-50 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab(1)}
              className={`whitespace-nowrap px-6 py-3 text-sm font-bold ${
                activeTab === 1 ? "border-b-2 border-blue-600 text-blue-700" : "text-gray-500"
              }`}
            >
              {t("form2bTab1")}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab(2)}
              className={`whitespace-nowrap px-6 py-3 text-sm font-bold ${
                activeTab === 2 ? "border-b-2 border-blue-600 text-blue-700" : "text-gray-500"
              }`}
            >
              {t("form2bTab2")}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab(3)}
              className={`whitespace-nowrap px-6 py-3 text-sm font-bold ${
                activeTab === 3 ? "border-b-2 border-blue-600 text-blue-700" : "text-gray-500"
              }`}
            >
              {t("form2bTab3")}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab(4)}
              className={`whitespace-nowrap px-6 py-3 text-sm font-bold ${
                activeTab === 4 ? "border-b-2 border-blue-600 text-blue-700" : "text-gray-500"
              }`}
            >
              {t("form2bTab4")}
            </button>
          </div>

          {/* Tab Panels */}
          <div className="p-6">
            {activeTab === 1 && <Form2BSnapshot data={data} />}
            {activeTab === 2 && <Form2BMobile data={data} onReopenForm2A={data.status === "Draft" ? handleReopenForm2A : undefined} />}
            {activeTab === 3 && <Form2BFixedTransit data={data} onReopenForm2A={data.status === "Draft" ? handleReopenForm2A : undefined} />}
            {activeTab === 4 && <Form2BInventory data={data} />}
          </div>

          {/* Action Footer */}
          <div className="p-6 bg-gray-50 border-t flex justify-end gap-4">
            {!canEdit ? (
              <span className="px-6 py-2 text-sm font-medium text-slate-600">
                {isHistorical ? "Historical record — read-only" : "Select an active campaign to manage this report"}
              </span>
            ) : isFinalized ? (
              <button
                type="button"
                onClick={handleReopen}
                className="px-6 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 font-medium"
              >
                {t("reopenForm2b")}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinalize}
                disabled={data.reportingSummary?.totalAicsReported === 0}
                className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 font-medium"
              >
                {t("verifyFinalizeForm2b")}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Form2BPage;
