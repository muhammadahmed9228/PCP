import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm, FormProvider } from "react-hook-form";
import { fetchAmp, saveAmpDraft, finalizeAmp, clearAmp } from "../store/ampSlice";
import { TabAmpPopulations, TabAmpLogistics, TabAmpSocial } from "../components/AmpFormTabs";
import AmpSnapshot from "../components/AmpSnapshot";

const AmpPage = () => {
  const dispatch = useDispatch();
  const { data: ampData, loading } = useSelector((state) => state.amp);
  const context = useSelector((state) => state.context);
  
  const [customAreaId, setCustomAreaId] = useState("");
  const activeAreaId = customAreaId || context.areaId || "";
  const [activeTab, setActiveTab] = useState(0);

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

  const isFinalized = ampData?.status === "Finalized";

  const handleSaveDraft = async (data) => {
    if (activeAreaId.length !== 24) return;
    await dispatch(saveAmpDraft({ areaId: activeAreaId, data }));
  };

  const handleFinalize = async () => {
    if (window.confirm("Are you sure? Once finalized, the AMP is locked and cannot be edited.")) {
      await dispatch(finalizeAmp(activeAreaId));
    }
  };

  const tabs = [
    { label: "Area Snapshot (Sec 1-3)", component: <AmpSnapshot data={ampData} /> },
    { label: "Populations & Teams (Sec 4-5)", component: <TabAmpPopulations /> },
    { label: "Logistics & Supplies (Sec 6-10)", component: <TabAmpLogistics /> },
    { label: "Social & Records (Sec 11-13)", component: <TabAmpSocial /> }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Area Micro Plan (AMP)</h2>
          {context.areaName && (
            <p className="text-sm text-gray-500">
              Assigned Area: <span className="font-semibold text-gray-700">{context.areaName} ({context.areaNo})</span>
            </p>
          )}
        </div>
        <input 
          type="text" 
          placeholder="Enter Assigned Area ID..." 
          value={activeAreaId}
          onChange={(e) => setCustomAreaId(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md w-72 shadow-sm text-sm"
        />
      </div>

      {!activeAreaId || activeAreaId.length !== 24 ? (
        <div className="bg-white p-8 text-center rounded-lg shadow border">
          <p className="text-gray-500">Provide a valid 24-character Area ID to view and manage its AMP.</p>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg flex flex-col">
          
          <div className={`px-6 py-3 border-b flex justify-between items-center ${isFinalized ? "bg-red-50 text-red-800" : "bg-green-50 text-green-800"}`}>
            <span className="font-semibold">
              Status: {ampData?.status || "No Draft Yet"}
            </span>
            {isFinalized && <span className="text-sm font-medium">Locked (Read-Only)</span>}
          </div>

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
                  disabled={isFinalized || loading}
                  className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save Draft"}
                </button>
                <button
                  type="button"
                  onClick={methods.handleSubmit(handleFinalize)}
                  disabled={isFinalized || !ampData?._id}
                  className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  Finalize & Lock
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