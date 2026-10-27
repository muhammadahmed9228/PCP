import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { fetchCampaigns } from "../../campaigns/store/campaignSlice";
import { ampService } from "../services/amp.service";
import AmpSnapshot from "../components/AmpSnapshot";
import { TabAmpPopulations, TabAmpLogistics, TabAmpSocial } from "../components/AmpFormTabs";
import Modal from "../../../components/shared/Modal";
import "../../../i18n/i18n";

const formatDate = date => date ? new Date(date).toLocaleString() : "—";

const AmpReviewPage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { campaigns } = useSelector(state => state.campaigns);
  const [campaignId, setCampaignId] = useState("");
  const [rows, setRows] = useState([]);
  const [areaId, setAreaId] = useState("");
  const [amp, setAmp] = useState(null);
  const [loadingRows, setLoadingRows] = useState(false);
  const [loadingAmp, setLoadingAmp] = useState(false);
  const [busy, setBusy] = useState(false);
  const [reason, setReason] = useState("");
  const [reopenOpen, setReopenOpen] = useState(false);
  const [tab, setTab] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const methods = useForm();

  useEffect(() => { dispatch(fetchCampaigns()); }, [dispatch]);

  useEffect(() => {
    let current = true;
    if (!campaignId) return undefined;
    const load = async () => {
      setLoadingRows(true);
      try {
        const response = await ampService.getReviewList(campaignId);
        if (current) setRows(response.data);
      } catch (error) {
        if (current) toast.error(error.response?.data?.message || t("ampReviewLoadError"));
      } finally {
        if (current) setLoadingRows(false);
      }
    };
    load();
    return () => { current = false; };
  }, [campaignId, refreshKey, t]);

  useEffect(() => {
    let current = true;
    if (!areaId) return undefined;
    const load = async () => {
      setLoadingAmp(true);
      try {
        const response = await ampService.getReview(areaId);
        if (current) setAmp(response.data);
      } catch (error) {
        if (current) {
          setAreaId("");
          setAmp(null);
          setReopenOpen(false);
          setReason("");
          toast.error(error.response?.data?.message || t("ampReviewLoadError"));
        }
      } finally {
        if (current) setLoadingAmp(false);
      }
    };
    load();
    return () => { current = false; };
  }, [areaId, refreshKey, t]);

  useEffect(() => { methods.reset(amp || {}); }, [amp, methods]);

  const changeCampaign = event => {
    setCampaignId(event.target.value);
    setRows([]);
    setAreaId("");
    setAmp(null);
    setLoadingAmp(false);
    setTab(0);
  };

  const toggleArea = selectedAreaId => {
    if (busy) return;
    if (areaId === selectedAreaId) {
      setAreaId("");
      setAmp(null);
      setLoadingAmp(false);
      setReopenOpen(false);
      setReason("");
      setTab(0);
    } else {
      setAreaId(selectedAreaId);
      setAmp(null);
      setLoadingAmp(true);
      setTab(0);
    }
  };

  const review = async action => {
    if (!amp || busy) return;
    const trimmed = reason.trim();
    if (action === "reopen" && !trimmed) {
      toast.error(t("ampReasonRequired"));
      return;
    }
    setBusy(true);
    try {
      const response = action === "approve"
        ? await ampService.approveAMP(areaId)
        : await ampService.reopenAMP(areaId, trimmed);
      setAmp(response.data);
      setRows(current => current.map(row => row.area._id === areaId
        ? { ...row, amp: { ...row.amp, status: response.data.status, reopenCount: response.data.reopenCount, approvedAt: response.data.approvedAt } }
        : row));
      setReopenOpen(false);
      setReason("");
      toast.success(action === "approve" ? t("ampApprovedNotice") : t("ampReopenedNotice"));
    } catch (error) {
      toast.error(error.response?.data?.message || t("ampReviewError"));
      // A competing review may have changed the state; refresh before another action.
      setRefreshKey(key => key + 1);
    } finally {
      setBusy(false);
    }
  };

  const selectedCampaign = campaigns.find(campaign => campaign._id === campaignId);
  const selectedRow = rows.find(row => row.area._id === areaId);
  const assignmentMatches = selectedRow?.aic?._id && String(selectedRow.aic._id) === String(amp?.aic);
  const canReview = amp?.status === "Finalized" && selectedCampaign?.status === "Planning" && assignmentMatches;
  const tabs = [
    { name: t("ampSnapshotTab"), content: <AmpSnapshot data={amp} /> },
    { name: t("ampPopulationsTab"), content: <TabAmpPopulations /> },
    { name: t("ampLogisticsTab"), content: <TabAmpLogistics /> },
    { name: t("ampSocialTab"), content: <TabAmpSocial /> }
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-800">{t("ampReviewTitle")}</h2>
        <p className="mt-1 text-sm text-gray-600">{t("ampReviewIntro")}</p>
        <label htmlFor="amp-review-campaign" className="mt-4 block text-sm font-medium text-gray-700">{t("selectCampaign")}</label>
        <div className="flex flex-wrap items-center gap-3">
          <select id="amp-review-campaign" value={campaignId} onChange={changeCampaign} disabled={busy} className="mt-1 w-full max-w-sm rounded-md border border-gray-300 bg-white px-3 py-2 text-sm disabled:opacity-50">
            <option value="">{t("chooseCampaign")}</option>
            {campaigns.map(campaign => <option key={campaign._id} value={campaign._id}>{campaign.campaignName} ({campaign.status})</option>)}
          </select>
          <button type="button" disabled={!campaignId || busy} onClick={() => setRefreshKey(key => key + 1)} className="rounded border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50">{t("ampRefresh")}</button>
        </div>
      </div>

      {campaignId && (
        <div className="overflow-x-auto rounded-lg border bg-white shadow-sm">
          <table className="min-w-[720px] w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-600"><tr>
              <th className="px-4 py-3">{t("areaNo")}</th><th className="px-4 py-3">{t("areaName")}</th>
              <th className="px-4 py-3">{t("assignedAic")}</th><th className="px-4 py-3">{t("status")}</th>
              <th className="px-4 py-3">{t("ampReopenCount")}</th><th className="px-4 py-3">{t("actions")}</th>
            </tr></thead>
            <tbody className="divide-y">
              {rows.map(row => <tr key={row.area._id}>
                <td className="px-4 py-3">{row.area.areaNo}</td><td className="px-4 py-3">{row.area.areaName}</td>
                <td className="px-4 py-3">{row.aic?.aicName || "—"}</td>
                <td className="px-4 py-3">{row.amp ? t(`ampStatus${row.amp.status}`) : t("noDraftYet")}</td>
                <td className="px-4 py-3">{row.amp?.reopenCount || 0}</td>
                <td className="px-4 py-3"><button type="button" disabled={!row.amp || busy} onClick={() => toggleArea(row.area._id)} aria-expanded={areaId === row.area._id} aria-controls={areaId === row.area._id ? "amp-review-detail" : undefined} className="font-medium text-blue-700 hover:underline disabled:text-gray-400 disabled:no-underline">{areaId === row.area._id ? t("hide") : t("view")}</button></td>
              </tr>)}
              {!loadingRows && rows.length === 0 && <tr><td colSpan="6" className="px-4 py-8 text-center text-gray-500">{t("ampNoAreas")}</td></tr>}
            </tbody>
          </table>
          {loadingRows && <p className="p-4 text-sm text-gray-500">{t("loadingAreas")}</p>}
        </div>
      )}

      {areaId && <div id="amp-review-detail">
      {loadingAmp && <p className="text-gray-600" role="status">{t("ampReviewLoading")}</p>}
      {amp && !loadingAmp && (
        <section className="rounded-lg border bg-white shadow-sm" aria-label={t("ampReviewDetails")}>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b p-5">
            <div><h3 className="text-lg font-semibold text-gray-900">{selectedRow?.area.areaName || amp.areaName} ({amp.areaNo})</h3>
              <p className="text-sm text-gray-600">{amp.aicName} · {t(`ampStatus${amp.status}`)} · {t("ampReopenCount")}: {amp.reopenCount || 0}</p>
              {amp.finalizedAt && <p className="text-xs text-gray-500">{t("ampSubmittedAt")}: {formatDate(amp.finalizedAt)}</p>}
              {amp.approvedAt && <p className="text-xs text-gray-500">{t("ampApprovedAt")}: {formatDate(amp.approvedAt)}</p>}
            </div>
            {canReview && <div className="flex gap-2">
              <button type="button" disabled={busy} onClick={() => review("approve")} className="rounded bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-50">{t("ampApprove")}</button>
              <button type="button" disabled={busy} onClick={() => setReopenOpen(true)} className="rounded border border-amber-600 px-4 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-50 disabled:opacity-50">{t("ampReopen")}</button>
            </div>}
          </div>
          {amp && !assignmentMatches && <p className="border-b border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-900" role="alert">{t("ampAssignmentMismatch")}</p>}
          <div className="flex gap-2 overflow-x-auto border-b px-5 pt-3">
            {tabs.map((item, index) => <button type="button" key={item.name} onClick={() => setTab(index)} className={`whitespace-nowrap px-3 py-2 text-sm ${tab === index ? "border-b-2 border-blue-700 font-semibold text-blue-800" : "text-gray-600"}`}>{item.name}</button>)}
          </div>
          <div className="p-5">
            <FormProvider {...methods}><fieldset disabled aria-label={t("ampReviewDetails")}>{tabs[tab].content}</fieldset></FormProvider>
          </div>
          <div className="border-t p-5">
            <h4 className="font-semibold text-gray-800">{t("ampReviewHistory")}</h4>
            {amp.reviewHistory?.length ? <ol className="mt-3 space-y-3">
              {amp.reviewHistory.map((event, index) => <li key={event._id || index} className="rounded border bg-gray-50 p-3 text-sm">
                <div className="font-medium">{t(`ampStatus${event.action}`)} · {formatDate(event.at)} · {t("ampReviewedBy")}: {amp.uciName || String(event.reviewer)}</div>
                {event.reason && <p className="mt-1 whitespace-pre-wrap break-words text-gray-700">{t("ampReopenReason")}: {event.reason}</p>}
              </li>)}
            </ol> : <p className="mt-2 text-sm text-gray-500">{t("ampNoReviewHistory")}</p>}
          </div>
        </section>
      )}
      </div>}

      <Modal isOpen={reopenOpen} onClose={() => { if (!busy) { setReopenOpen(false); setReason(""); } }} title={t("ampReopenTitle")}>
        <div className="space-y-4 text-sm">
          <label htmlFor="amp-reopen-reason" className="block font-medium text-gray-800">{t("ampReopenReason")}</label>
          <textarea id="amp-reopen-reason" value={reason} onChange={event => setReason(event.target.value)} maxLength={500} required rows={4} className="w-full rounded-md border border-gray-300 p-3" placeholder={t("ampReopenPlaceholder")} />
          <p className="text-xs text-gray-500">{reason.length}/500</p>
          <div className="flex justify-end gap-2">
            <button type="button" disabled={busy} onClick={() => { setReopenOpen(false); setReason(""); }} className="rounded border px-4 py-2">{t("cancel")}</button>
            <button type="button" disabled={busy || !reason.trim()} onClick={() => review("reopen")} className="rounded bg-amber-700 px-4 py-2 font-medium text-white disabled:opacity-50">{t("ampConfirmReopen")}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AmpReviewPage;
