import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchForm2B, finalizeForm2B, reopenForm2B, clearForm2B } from "../store/form2bSlice";
import { fetchCampaigns } from "../../campaigns/store/campaignSlice";
import Form2BSnapshot from "../components/Form2BSnapshot";
import Form2BMobile from "../components/Form2BMobile";
import Form2BFixedTransit from "../components/Form2BFixedTransit";
import Form2BInventory from "../components/Form2BInventory";

const Form2BPage = () => {
  const dispatch = useDispatch();
  const { data, loading } = useSelector((state) => state.form2b);
  const { campaigns = [] } = useSelector((state) => state.campaigns || {});

  const [selectedCampaignId, setSelectedCampaignId] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
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
  const activeCampaigns = campaigns.filter((c) => c.status === "Active");

  const handleRefresh = () => {
    if (selectedCampaignId && selectedDay) {
      dispatch(fetchForm2B({ campaignId: selectedCampaignId, day: selectedDay }));
    }
  };

  const handleFinalize = async () => {
    if (window.confirm("Finalize Form 2B for this UC? This locks the daily UC report.")) {
      await dispatch(finalizeForm2B({ campaignId: selectedCampaignId, day: selectedDay }));
    }
  };

  const handleReopen = async () => {
    const reason = window.prompt("Enter reason for reopening Form 2B:");
    if (reason !== null) {
      await dispatch(reopenForm2B({ campaignId: selectedCampaignId, day: selectedDay, reason }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">
          Form 2B: UC Level Daily Performance & Inventory
        </h2>
        {selectedCampaignId && selectedDay && !isFinalized && (
          <button
            onClick={handleRefresh}
            className="px-4 py-2 text-sm bg-gray-100 border rounded hover:bg-gray-200 font-medium"
          >
            Re-Sync AIC Reports
          </button>
        )}
      </div>

      {/* Campaign & Day Selection Bar */}
      <div className="bg-white p-4 rounded-lg shadow border flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700">Active Campaign</label>
          <select
            value={selectedCampaignId}
            onChange={(e) => setSelectedCampaignId(e.target.value)}
            className="mt-1 w-full px-3 py-2 border rounded"
          >
            <option value="">-- Select Active Campaign --</option>
            {activeCampaigns.map((c) => (
              <option key={c._id} value={c._id}>
                {c.campaignName} ({c.nameOfSIA})
              </option>
            ))}
          </select>
        </div>

        <div className="w-full sm:w-48">
          <label className="block text-sm font-medium text-gray-700">Campaign Day</label>
          <select
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
            className="mt-1 w-full px-3 py-2 border rounded"
          >
            <option value="">-- Select Day --</option>
            <option value="1">Day 1</option>
            <option value="2">Day 2</option>
            <option value="3">Day 3</option>
          </select>
        </div>
      </div>

      {loading && (
        <div className="p-8 text-center bg-white rounded shadow border text-blue-600 font-medium">
          Aggregating finalized Form 2A reports across all AICs...
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
              <span className="font-semibold text-gray-800">Status: {data.status}</span>
              {data.reopenReason && (
                <span className="ml-4 text-xs text-gray-600 italic">
                  (Last Reopen Reason: {data.reopenReason})
                </span>
              )}
            </div>
            {isFinalized ? (
              <span className="text-red-700 font-bold">LOCKED AT UC LEVEL</span>
            ) : (
              <span className="text-yellow-700 text-sm font-medium">
                Draft (Automatically compiles finalized AIC Form 2As)
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
              1. UC Overview & Teams (Sec 1-4)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab(2)}
              className={`whitespace-nowrap px-6 py-3 text-sm font-bold ${
                activeTab === 2 ? "border-b-2 border-blue-600 text-blue-700" : "text-gray-500"
              }`}
            >
              2. Mobile Teams AIC Summary (Sec 5)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab(3)}
              className={`whitespace-nowrap px-6 py-3 text-sm font-bold ${
                activeTab === 3 ? "border-b-2 border-blue-600 text-blue-700" : "text-gray-500"
              }`}
            >
              3. Fixed & Transit AIC Summary (Sec 6-7)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab(4)}
              className={`whitespace-nowrap px-6 py-3 text-sm font-bold ${
                activeTab === 4 ? "border-b-2 border-blue-600 text-blue-700" : "text-gray-500"
              }`}
            >
              4. Daily Inventory Summary (Sec 8)
            </button>
          </div>

          {/* Tab Panels */}
          <div className="p-6">
            {activeTab === 1 && <Form2BSnapshot data={data} />}
            {activeTab === 2 && <Form2BMobile data={data} />}
            {activeTab === 3 && <Form2BFixedTransit data={data} />}
            {activeTab === 4 && <Form2BInventory data={data} />}
          </div>

          {/* Action Footer */}
          <div className="p-6 bg-gray-50 border-t flex justify-end gap-4">
            {isFinalized ? (
              <button
                type="button"
                onClick={handleReopen}
                className="px-6 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 font-medium"
              >
                Reopen Form 2B (Authorized Override)
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinalize}
                disabled={data.reportingSummary?.totalAicsReported === 0}
                className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 font-medium"
              >
                Verify & Finalize Form 2B
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Form2BPage;