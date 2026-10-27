import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm, FormProvider } from "react-hook-form";
import { fetchAmp, saveAmpDraft, finalizeAmp, clearAmp } from "../store/ampSlice";
import { TabAmpPopulations, TabAmpLogistics, TabAmpSocial } from "../components/AmpFormTabs";
import AmpSnapshot from "../components/AmpSnapshot";
import { useTranslation } from "react-i18next";
import "../../../i18n/i18n";
import ExportExcelButton from "../../../components/shared/ExportExcelButton";

const AmpPage = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { data: ampData, loading } = useSelector((state) => state.amp);
  const context = useSelector((state) => state.context);
  
  const [customAreaId, setCustomAreaId] = useState("");
  const activeAreaId = customAreaId || context.areaId || "";
  const [activeTab, setActiveTab] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const methods = useForm({
    defaultValues: ampData || {}
  });

  useEffect(() => {
    if (activeAreaId && activeAreaId.length === 24) {
      dispatch(fetchAmp(activeAreaId));
    } else {
      dispatch(clearAmp());
      methods.reset({});
    }
  }, [activeAreaId, dispatch, methods]);

  useEffect(() => {
    if (ampData) {
      methods.reset(ampData);
    }
  }, [ampData, methods]);

  const isFinalized = ampData?.status === "Finalized" || ampData?.status === "Approved";

  const handleSaveDraft = async (data) => {
    if (activeAreaId.length !== 24 || submitting) return;
    setSubmitting(true);
    try {
      await dispatch(saveAmpDraft({ areaId: activeAreaId, data }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinalize = async (data) => {
    if (submitting || activeAreaId.length !== 24) return;
    if (window.confirm(t("finalizeAmpConfirm"))) {
      setSubmitting(true);
      // Submit the values currently on screen, including edits since the last Save Draft.
      try {
        const saved = await dispatch(saveAmpDraft({ areaId: activeAreaId, data }));
        if (saveAmpDraft.fulfilled.match(saved)) await dispatch(finalizeAmp(activeAreaId));
      } finally {
        setSubmitting(false);
      }
    }
  };

  const tabs = [
    { label: t("ampSnapshotTab"), component: <AmpSnapshot data={ampData} /> },
    { label: t("ampPopulationsTab"), component: <TabAmpPopulations /> },
    { label: t("ampLogisticsTab"), component: <TabAmpLogistics /> },
    { label: t("ampSocialTab"), component: <TabAmpSocial /> }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{t("areaMicroPlanTitle")}</h2>
          {context.areaName && (
            <p className="text-sm text-gray-500">
              {t("assignedArea")}: <span className="font-semibold text-gray-700">{context.areaName} ({context.areaNo})</span>
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder={t("assignedAreaIdPlaceholder")}
            value={activeAreaId}
            onChange={(e) => setCustomAreaId(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md w-72 shadow-sm text-sm"
          />
          <ExportExcelButton collectionName="amp" data={ampData} disabled={!ampData} />
          <button type="button" disabled={activeAreaId.length !== 24 || submitting} onClick={() => dispatch(fetchAmp(activeAreaId))} className="rounded border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50">{t("ampRefresh")}</button>
        </div>
      </div>

      {!activeAreaId || activeAreaId.length !== 24 ? (
        <div className="bg-white p-8 text-center rounded-lg shadow border">
          <p className="text-gray-500">{t("validAreaIdHint")}</p>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg flex flex-col">
          
          <div className={`px-6 py-3 border-b flex justify-between items-center ${ampData?.status === "Approved" ? "bg-green-50 text-green-800" : isFinalized ? "bg-blue-50 text-blue-800" : ampData?.status === "Reopened" ? "bg-amber-50 text-amber-900" : "bg-green-50 text-green-800"}`}>
            <span className="font-semibold">
              {t("status")}: {ampData?.status ? t(`ampStatus${ampData.status}`) : t("noDraftYet")}
            </span>
            {isFinalized && <span className="text-sm font-medium">{t("lockedReadOnly")}</span>}
          </div>

          {ampData?.status === "Reopened" && (
            <div className="border-b border-amber-200 bg-amber-50 px-6 py-4 text-sm text-amber-950" role="status">
              <p className="font-semibold">{t("ampReopenedNotice")}</p>
              <p className="mt-1 whitespace-pre-wrap break-words">{t("ampReopenReason")}: {ampData.reviewHistory?.filter(event => event.action === "Reopened").at(-1)?.reason || "—"}</p>
              <p className="mt-1">{t("ampReopenCount")}: {ampData.reopenCount || 0}</p>
            </div>
          )}

          {ampData?.status === "Approved" && (
            <p className="border-b border-green-200 bg-green-50 px-6 py-3 text-sm font-semibold text-green-900" role="status">{t("ampApprovedNotice")}</p>
          )}

          {!!ampData?.reviewHistory?.length && (
            <details className="border-b px-6 py-3 text-sm text-gray-700">
              <summary className="cursor-pointer font-semibold">{t("ampReviewHistory")} ({ampData.reviewHistory.length})</summary>
              <ol className="mt-3 space-y-2">
                {ampData.reviewHistory.map((event, index) => <li key={event._id || index} className="rounded border bg-gray-50 p-3">
                  <span className="font-medium">{t(`ampStatus${event.action}`)}</span> · {event.at ? new Date(event.at).toLocaleString() : "—"} · {t("ampReviewedBy")}: {ampData.uciName || String(event.reviewer)}
                  {event.reason && <p className="mt-1 whitespace-pre-wrap break-words">{t("ampReopenReason")}: {event.reason}</p>}
                </li>)}
              </ol>
            </details>
          )}

          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(handleSaveDraft)} className="flex flex-col flex-1">
              
              <div className="flex border-b overflow-x-auto bg-gray-50">
                {tabs.map((tab, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveTab(idx)}
                    className={`px-6 py-3 font-medium text-sm whitespace-nowrap ${
                      activeTab === idx ? "border-b-2 border-green-600 text-green-700 bg-white" : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-6">
                <fieldset disabled={isFinalized}>
                  {tabs[activeTab].component}
                </fieldset>
              </div>

              <div className="p-6 bg-gray-50 border-t flex justify-end gap-4">
                <button
                  type="submit"
                  disabled={isFinalized || loading || submitting}
                  className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? t("saving") : t("saveDraft")}
                </button>
                <button
                  type="button"
                  onClick={methods.handleSubmit(handleFinalize)}
                  disabled={isFinalized || submitting || !ampData?._id}
                  className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {t("finalizeLock")}
                </button>
              </div>
            </form>
          </FormProvider>
        </div>
      )}
    </div>
  );
};

export default AmpPage;
