import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchCampaigns } from "../store/campaignSlice";
import { useTranslation } from "react-i18next";
import "../../../i18n/i18n";
import { clearAreas, fetchAreasForCampaign } from "../../areas/store/areaSlice";

const CampaignHistoryPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { campaigns, loading } = useSelector((state) => state.campaigns);
  const { areas } = useSelector((state) => state.areas);
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  useEffect(() => {
    dispatch(fetchCampaigns());
  }, [dispatch]);

  useEffect(() => {
    dispatch(clearAreas());
    if (selectedCampaign?._id) dispatch(fetchAreasForCampaign(selectedCampaign._id));
  }, [dispatch, selectedCampaign]);

  const completedCampaigns = campaigns.filter((campaign) => campaign.status === "Completed");

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">{t("readOnlyRecords")}</p>
        <h2 className="mt-1 text-2xl font-bold text-slate-900">{t("campaignHistory")}</h2>
        <p className="mt-1 text-sm text-slate-500">{t("historyDescription")}</p>
      </div>

      {loading && <p className="text-sm text-slate-500">{t("loadingCampaignHistory")}</p>}

      {!loading && completedCampaigns.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
          {t("noCompletedCampaigns")}
        </div>
      )}

      {completedCampaigns.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Campaign</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">SIA</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Completed</th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {completedCampaigns.map((campaign) => (
                <tr key={campaign._id} className="hover:bg-slate-50">
                  <td className="px-5 py-4 font-semibold text-slate-900">{campaign.campaignName}</td>
                  <td className="px-5 py-4 text-sm text-slate-600">{campaign.nameOfSIA}</td>
                  <td className="px-5 py-4 text-sm text-slate-600">{campaign.completedAt ? new Date(campaign.completedAt).toLocaleDateString() : "—"}</td>
                  <td className="px-5 py-4 text-right">
                    <button type="button" onClick={() => setSelectedCampaign(campaign)} className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100">
                      {t("viewDetails")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedCampaign && (
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900">{selectedCampaign.campaignName}</h3>
              <p className="text-sm text-slate-500">{selectedCampaign.nameOfSIA}</p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">Completed / Read-only</span>
          </div>
          <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <div><dt className="text-slate-500">Start date</dt><dd className="font-semibold text-slate-900">{new Date(selectedCampaign.startDate).toLocaleDateString()}</dd></div>
            <div><dt className="text-slate-500">End date</dt><dd className="font-semibold text-slate-900">{new Date(selectedCampaign.endDate).toLocaleDateString()}</dd></div>
            <div><dt className="text-slate-500">Completed</dt><dd className="font-semibold text-slate-900">{selectedCampaign.completedAt ? new Date(selectedCampaign.completedAt).toLocaleDateString() : "—"}</dd></div>
            <div><dt className="text-slate-500">Areas</dt><dd className="font-semibold text-slate-900">{areas.length}</dd></div>
          </dl>
          {selectedCampaign.campaignDescription && <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">{selectedCampaign.campaignDescription}</p>}
          <button
            type="button"
            onClick={() => navigate(`/dashboard/uci/form2b?campaign=${selectedCampaign._id}`)}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            View daily Form 2B records
          </button>
          {areas.length > 0 && (
            <div className="mt-5">
              <h4 className="mb-2 font-semibold text-slate-900">Campaign areas</h4>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {areas.map((area) => <div key={area._id} className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700">{area.areaNo} — {area.areaName}</div>)}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default CampaignHistoryPage;
