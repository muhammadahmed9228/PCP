import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm, FormProvider } from "react-hook-form";
import { fetchCampaigns } from "../../campaigns/store/campaignSlice";
import { fetchUcmp, saveUcmpDraft, finalizeUcmp, clearUcmp } from "../store/ucmpSlice";
import { TabAdminPrep, TabPopulationsTeams, TabLogistics, TabSocial } from "../components/UcmpFormTabs";

const UcmpPage = () => {
  const dispatch = useDispatch();
  const { campaigns } = useSelector((state) => state.campaigns);
  const { data: ucmpData, loading } = useSelector((state) => state.ucmp);
  
  const [selectedCampaignId, setSelectedCampaignId] = useState("");
  const [activeTab, setActiveTab] = useState(0);

  const methods = useForm({
    defaultValues: ucmpData || {}
  });

  useEffect(() => {
    dispatch(fetchCampaigns());
  }, [dispatch]);

  // Load UCMP data when campaign changes
  useEffect(() => {
    if (selectedCampaignId) {
      dispatch(fetchUcmp(selectedCampaignId));
    } else {
      dispatch(clearUcmp());
      methods.reset({});
    }
  }, [selectedCampaignId, dispatch, methods]);

  // Reset form when UCMP data is fetched from server
  useEffect(() => {
    if (ucmpData) {
      methods.reset(ucmpData);
    }
  }, [ucmpData, methods]);

  const { user } = useSelector((state) => state.auth);

  const selectedCampaign = campaigns.find(c => c._id === selectedCampaignId);
  const isFinalized = ucmpData?.status === "Finalized";
  const isPlanningPhase = selectedCampaign?.status === "Planning";

  const handleSaveDraft = async (data) => {
    if (!selectedCampaignId) return;
    await dispatch(saveUcmpDraft({ campaignId: selectedCampaignId, data }));
  };

  const handleFinalize = async () => {
    if (window.confirm("Are you sure? Once finalized, the UCMP is locked and cannot be edited.")) {
      await dispatch(finalizeUcmp(selectedCampaignId));
    }
  };

  const tabs = [
    { label: "Admin & Pre-campaign", component: <TabAdminPrep user={user} campaign={selectedCampaign} /> },
    { label: "Populations & Teams", component: <TabPopulationsTeams /> },
    { label: "Logistics & Supplies", component: <TabLogistics /> },
    { label: "Social & Wrap-up", component: <TabSocial /> }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Union Council Micro Plan (UCMP)</h2>
        <select
          value={selectedCampaignId}
          onChange={(e) => setSelectedCampaignId(e.target.value)}
          className="block w-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm"
        >
          <option value="">-- Select Campaign --</option>
          {campaigns.map((camp) => (
            <option key={camp._id} value={camp._id}>{camp.campaignName}</option>
          ))}
        </select>
      </div>

      {!selectedCampaignId ? (
        <div className="bg-white p-8 text-center rounded-lg shadow border"><p className="text-gray-500">Select a campaign to manage its UCMP.</p></div>
      ) : (
        <div className="bg-white shadow rounded-lg flex flex-col">
          
          {/* Status Banner */}
          <div className={`px-6 py-3 border-b flex justify-between items-center ${isFinalized ? "bg-red-50 text-red-800" : "bg-blue-50 text-blue-800"}`}>
            <span className="font-semibold">
              Status: {ucmpData?.status || "No Draft Yet"}
            </span>
            {isFinalized && <span className="text-sm font-medium">Locked (Read-Only)</span>}
          </div>

          {/* Form Provider Wraps the entire multi-tab structure[span_3](start_span)[span_3](end_span) */}
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(handleSaveDraft)} className="flex flex-col flex-1">
              
              {/* Tab Navigation */}
              <div className="flex border-b overflow-x-auto">
                {tabs.map((tab, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveTab(idx)}
                    className={`px-6 py-3 font-medium text-sm whitespace-nowrap ${
                      activeTab === idx ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Active Tab Content */}
              <div className="p-6">
                {/* Wrap content in a disabled fieldset if finalized or campaign not in planning[span_4](start_span)[span_4](end_span) */}
                <fieldset disabled={isFinalized || !isPlanningPhase}>
                  {tabs[activeTab].component}
                </fieldset>
              </div>

              {/* Action Buttons */}
              <div className="p-6 bg-gray-50 border-t flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {!isPlanningPhase && !isFinalized ? "Campaign must be in Planning phase to edit." : ""}
                </span>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={isFinalized || loading || !isPlanningPhase}
                    className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? "Saving..." : "Save Draft"}
                  </button>
                  <button
                    type="button"
                    onClick={methods.handleSubmit(handleFinalize)}
                    disabled={isFinalized || !ucmpData?._id || !isPlanningPhase}
                    className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    Finalize & Lock
                  </button>
                </div>
              </div>

            </form>
          </FormProvider>
        </div>
      )}
    </div>
  );
};

export default UcmpPage;