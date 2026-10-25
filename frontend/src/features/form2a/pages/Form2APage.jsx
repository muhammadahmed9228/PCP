import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchForm2A, finalizeForm2A, clearForm2A } from "../store/form2aSlice";
import Form2ASnapshot from "../components/Form2ASnapshot";
import Form2AMobile from "../components/Form2AMobile";
import Form2AFixedTransit from "../components/Form2AFixedTransit";
import Form2AInventory from "../components/Form2AInventory";

const Form2APage = () => {
  const dispatch = useDispatch();
  const { data, loading } = useSelector((state) => state.form2a);

  const [selectedDay, setSelectedDay] = useState("");
  const [activeTab, setActiveTab] = useState(1);
  const { areaId } = useSelector((state) => state.context);

  useEffect(() => {
    if (selectedDay && areaId) {
      dispatch(fetchForm2A({ areaId, day: selectedDay }));
    } else {
      dispatch(clearForm2A());
    }
  }, [selectedDay, areaId, dispatch]);

  const handleFinalize = async () => {
    if (!areaId || !selectedDay) return;
    if (window.confirm("Are you sure? This will lock Form 2A and make it available for the UCI.")) {
      await dispatch(finalizeForm2A({ areaId, day: selectedDay }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Form 2A: Area Daily Summary</h2>
      </div>

      <div className="bg-white p-4 rounded-lg shadow border flex gap-4">
        <div>
          <label className="block text-sm font-medium">Select Campaign Day to Review</label>
          <select value={selectedDay} onChange={e => setSelectedDay(e.target.value)} className="mt-1 w-64 px-3 py-2 border rounded">
            <option value="">-- Select Day --</option>
            <option value="1">Day 1</option>
            <option value="2">Day 2</option>
            <option value="3">Day 3</option>
          </select>
        </div>
      </div>

      {loading && <p className="text-blue-600 font-medium">Aggregating Field Sheets...</p>}

      {!loading && data && (
        <div className="bg-white shadow rounded-lg flex flex-col">
          <div className={`px-6 py-3 border-b flex justify-between items-center ${data.isFinalized ? "bg-red-50" : "bg-yellow-50"}`}>
            <span className="font-semibold text-gray-800">Status: {data.status}</span>
            {data.isFinalized ? (
              <span className="text-red-700 font-bold">LOCKED</span>
            ) : (
              <span className="text-yellow-700 text-sm">Draft (Auto-updates if field sheets change)</span>
            )}
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b bg-gray-50 overflow-x-auto">
            <button onClick={() => setActiveTab(1)} className={`whitespace-nowrap px-6 py-3 text-sm font-bold ${activeTab === 1 ? 'border-b-2 border-blue-600 text-blue-700' : 'text-gray-500'}`}>1. Overview</button>
            <button onClick={() => setActiveTab(2)} className={`whitespace-nowrap px-6 py-3 text-sm font-bold ${activeTab === 2 ? 'border-b-2 border-blue-600 text-blue-700' : 'text-gray-500'}`}>2. Mobile Teams</button>
            <button onClick={() => setActiveTab(3)} className={`whitespace-nowrap px-6 py-3 text-sm font-bold ${activeTab === 3 ? 'border-b-2 border-blue-600 text-blue-700' : 'text-gray-500'}`}>3. Fixed & Transit</button>
            <button onClick={() => setActiveTab(4)} className={`whitespace-nowrap px-6 py-3 text-sm font-bold ${activeTab === 4 ? 'border-b-2 border-blue-600 text-blue-700' : 'text-gray-500'}`}>4. Collective Inventory</button>
          </div>

          <div className="p-6 overflow-x-auto">
            {activeTab === 1 && <Form2ASnapshot data={data} />}
            {activeTab === 2 && <Form2AMobile data={data} />}
            {activeTab === 3 && <Form2AFixedTransit data={data} />}
            {activeTab === 4 && <Form2AInventory data={data} />}
          </div>

          <div className="p-6 bg-gray-50 border-t flex justify-end">
            <button
              onClick={handleFinalize}
              disabled={data.isFinalized || data.teamCounts.totalMobile === 0}
              className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              {data.isFinalized ? "Finalized" : "Verify & Finalize Form 2A"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Form2APage;