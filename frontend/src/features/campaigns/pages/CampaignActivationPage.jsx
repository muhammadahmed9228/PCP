import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCampaigns } from "../store/campaignSlice";
import { bootstrapContext } from "../../context/store/contextSlice";
import { campaignActivationService } from "../services/campaign.activation.service";
import { campaignService } from "../services/campaign.service";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import "../../../i18n/i18n";

const CampaignActivationPage = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { campaigns } = useSelector((state) => state.campaigns);
  
  const [selectedCampaignId, setSelectedCampaignId] = useState("");
  const [readiness, setReadiness] = useState(null);
  const [checking, setChecking] = useState(false);
  const [activating, setActivating] = useState(false);

  useEffect(() => {
    dispatch(fetchCampaigns());
  }, [dispatch]);

  const planningCampaigns = campaigns.filter(c => c.status === "Planning");

  useEffect(() => {
    const checkStatus = async () => {
      if (!selectedCampaignId) {
        setReadiness(null);
        return;
      }
      try {
        setChecking(true);
        const report = await campaignActivationService.checkReadiness(selectedCampaignId);
        setReadiness(report.data); // Assumes ApiResponse format
      } catch {
        toast.error("Failed to fetch readiness report");
      } finally {
        setChecking(false);
      }
    };
    checkStatus();
  }, [selectedCampaignId]);

  const handleActivate = async () => {
    if (!window.confirm("Activate this campaign? AICs will be notified and field operations will begin.")) return;
    
    try {
      setActivating(true);
      await campaignService.updateCampaignStatus(selectedCampaignId, "Active");
      toast.success("Campaign Activated Successfully! Field sheets can now be generated.");
      dispatch(fetchCampaigns()); // Refresh global list
      dispatch(bootstrapContext());
      setSelectedCampaignId(""); // Reset selection
    } catch (error) {
      // The backend 400 ApiError will return the array of errors if it fails the double-check[span_7](start_span)[span_7](end_span)
      const errs = error.response?.data?.errors || [error.response?.data?.message];
      errs.forEach(err => toast.error(err));
    } finally {
      setActivating(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">{t("activationChecklist")}</h2>
      
      <div className="bg-white p-4 rounded-lg shadow border">
        <label className="block text-sm font-medium text-gray-700">{t("selectPlanningCampaign")}</label>
        <select 
          value={selectedCampaignId}
          onChange={(e) => setSelectedCampaignId(e.target.value)}
          className="mt-1 block w-64 px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="">{t("chooseCampaign")}</option>
          {planningCampaigns.map(camp => (
            <option key={camp._id} value={camp._id}>{camp.campaignName}</option>
          ))}
        </select>
        {planningCampaigns.length === 0 && (
          <p className="text-sm text-gray-500 mt-2">{t("noPlanningCampaigns")}</p>
        )}
      </div>

      {checking && <p className="text-blue-600 font-medium">{t("runningVerification")}</p>}

      {readiness && !checking && (
        <div className="bg-white shadow rounded-lg overflow-hidden border">
          <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">{t("preActivationReport")}</h3>
            {readiness.isReady ? (
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">{t("readyToActivate")}</span>
            ) : (
              <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">{t("requirementsMissing")}</span>
            )}
          </div>
          
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              {readiness.ucmpReady ? <span className="text-green-600 text-xl">✅</span> : <span className="text-red-600 text-xl">❌</span>}
              <span className="font-medium text-gray-700">{t("ucmpFinalized")}</span>
            </div>
            <div className="flex items-center gap-3">
              {readiness.ampsReady ? <span className="text-green-600 text-xl">✅</span> : <span className="text-red-600 text-xl">❌</span>}
              <span className="font-medium text-gray-700">{t("allAmpsApproved")}</span>
            </div>
            <div className="flex items-center gap-3">
              {readiness.ompsReady ? <span className="text-green-600 text-xl">✅</span> : <span className="text-red-600 text-xl">❌</span>}
              <span className="font-medium text-gray-700">{t("allOmpsFinalized")}</span>
            </div>

            {!readiness.isReady && readiness.errors.length > 0 && (
              <div className="mt-6 bg-red-50 p-4 rounded-md border border-red-200">
                <h4 className="text-red-800 font-semibold mb-2">{t("pendingRequirements")}</h4>
                <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                  {readiness.errors.map((err, i) => <li key={i}>{err}</li>)}
                </ul>
              </div>
            )}
          </div>

          <div className="p-6 bg-gray-50 border-t flex justify-end">
            <button
              onClick={handleActivate}
              disabled={!readiness.isReady || activating}
              className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {activating ? t("activating") : t("activateCampaign")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignActivationPage;
