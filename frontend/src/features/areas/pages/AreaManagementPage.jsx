import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { fetchAreasForCampaign, createNewArea, editArea, removeArea, clearAreas } from "../store/areaSlice";
import { fetchCampaigns } from "../../campaigns/store/campaignSlice";
import { fetchAICs } from "../../aics/store/aicSlice";
import { createAreaSchema } from "../validations/area.schema";
import Modal from "../../../components/shared/Modal";

const AreaManagementPage = () => {
  const dispatch = useDispatch();
  const { campaigns } = useSelector((state) => state.campaigns);
  const { aics } = useSelector((state) => state.aics);
  const { areas, loading: areasLoading } = useSelector((state) => state.areas);

  const [selectedCampaignId, setSelectedCampaignId] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArea, setEditingArea] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createAreaSchema),
  });

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    setValue: setEditValue,
    formState: { errors: editErrors },
  } = useForm({
    resolver: zodResolver(createAreaSchema),
  });

  // Initial data load for Campaigns and all registered AICs
  useEffect(() => {
    dispatch(fetchCampaigns());
    dispatch(fetchAICs());
  }, [dispatch]);

  // Fetch areas when a campaign is selected
  useEffect(() => {
    if (selectedCampaignId) {
      dispatch(fetchAreasForCampaign(selectedCampaignId));
    } else {
      dispatch(clearAreas());
    }
  }, [selectedCampaignId, dispatch]);

  const selectedCampaign = campaigns.find((c) => c._id === selectedCampaignId);

  // Filter AICs strictly to those that have been assigned to this specific campaign
  const assignedAicsToCampaign = aics.filter((aic) =>
    selectedCampaign?.aics?.includes(aic._id)
  );

  const onSubmit = async (data) => {
    if (!selectedCampaignId) return;

    const payload = {
      ...data,
      campaignId: selectedCampaignId,
    };

    const resultAction = await dispatch(createNewArea(payload));
    if (createNewArea.fulfilled.match(resultAction)) {
      setIsModalOpen(false);
      reset();
      dispatch(fetchAreasForCampaign(selectedCampaignId));
    }
  };

  const handleOpenEdit = (area) => {
    setEditingArea(area);
    setEditValue("areaNo", area.areaNo);
    setEditValue("areaName", area.areaName);
    setEditValue("areaDescription", area.areaDescription || "");
    const aicIdValue = typeof area.aic === "object" ? area.aic?._id : area.aic;
    setEditValue("aicId", aicIdValue || "");
  };

  const onEditSubmit = async (data) => {
    if (!editingArea) return;

    const resultAction = await dispatch(
      editArea({
        id: editingArea._id,
        areaData: data,
      })
    );

    if (editArea.fulfilled.match(resultAction)) {
      setEditingArea(null);
      resetEdit();
      dispatch(fetchAreasForCampaign(selectedCampaignId));
    }
  };

  const handleDeleteArea = async (area) => {
    if (
      window.confirm(
        `Are you sure you want to delete Area ${area.areaNo} ("${area.areaName}")? This action cannot be undone.`
      )
    ) {
      await dispatch(removeArea(area._id));
    }
  };

  const isPlanningPhase = selectedCampaign?.status === "Planning";
  const isCompleted = selectedCampaign?.status === "Completed";

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Manage Campaign Areas</h2>
          <p className="text-sm text-gray-500 mt-1">
            Create, update, and manage designated areas and their assigned Area Incharges (AICs).
          </p>
        </div>

        <div className="flex items-center gap-4">
          <select
            value={selectedCampaignId}
            onChange={(e) => setSelectedCampaignId(e.target.value)}
            className="block w-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">-- Select a Campaign --</option>
            {campaigns.map((camp) => (
              <option key={camp._id} value={camp._id}>
                {camp.campaignName} ({camp.status})
              </option>
            ))}
          </select>

          <button
            onClick={() => setIsModalOpen(true)}
            disabled={!selectedCampaignId || !isPlanningPhase}
            className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            title={!isPlanningPhase ? "Areas can only be created during the Planning phase" : ""}
          >
            + Create & Assign Area
          </button>
        </div>
      </div>

      {!selectedCampaignId ? (
        <div className="bg-white p-8 text-center rounded-lg shadow border border-gray-200">
          <p className="text-gray-500">Please select a campaign to view or manage its areas.</p>
        </div>
      ) : areasLoading ? (
        <p className="text-gray-500">Loading areas...</p>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Area No</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Area Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Assigned AIC</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">AIC Phone</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {areas.map((area) => (
                <tr key={area._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    <span className="px-2.5 py-1 rounded bg-blue-50 text-blue-700 font-mono text-xs">
                      {area.areaNo}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="font-medium">{area.areaName}</div>
                    {area.areaDescription && (
                      <div className="text-xs text-gray-400 mt-0.5">{area.areaDescription}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <span className="font-medium text-gray-900">{area.aic?.aicName || "Unknown AIC"}</span>
                    {area.aic?.aicNo && (
                      <span className="text-xs text-gray-500 block">AIC No: {area.aic?.aicNo}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {area.aic?.phoneNumber || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleOpenEdit(area)}
                      disabled={isCompleted}
                      className="text-blue-600 hover:text-blue-900 mr-4 disabled:opacity-40 disabled:cursor-not-allowed"
                      title={isCompleted ? "Completed campaigns cannot be modified" : "Edit Area"}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteArea(area)}
                      disabled={!isPlanningPhase}
                      className="text-red-600 hover:text-red-900 disabled:opacity-40 disabled:cursor-not-allowed"
                      title={!isPlanningPhase ? "Areas can only be deleted during the Planning phase" : "Delete Area"}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {areas.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-sm text-gray-500">
                    No areas have been created and assigned for this campaign yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Area Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Area & Assign AIC">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Area Number</label>
              <input
                type="text"
                placeholder="e.g. 01"
                {...register("areaNo")}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
              {errors.areaNo && <p className="text-sm text-red-600 mt-1">{errors.areaNo.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Area Name</label>
              <input
                type="text"
                placeholder="e.g. Sector 4 East"
                {...register("areaName")}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
              {errors.areaName && <p className="text-sm text-red-600 mt-1">{errors.areaName.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Area Description (Optional)</label>
            <textarea
              {...register("areaDescription")}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
              rows="2"
              placeholder="e.g. Covers blocks 1-12 and main market"
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Assign to AIC</label>
            <select
              {...register("aicId")}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">-- Select an Assigned AIC --</option>
              {assignedAicsToCampaign.map((aic) => (
                <option key={aic._id} value={aic._id}>
                  {aic.aicName} (AIC No: {aic.aicNo})
                </option>
              ))}
            </select>
            {errors.aicId && <p className="text-sm text-red-600 mt-1">{errors.aicId.message}</p>}
            {assignedAicsToCampaign.length === 0 && (
              <p className="text-sm text-orange-600 mt-2">
                No AICs are assigned to this campaign yet. Please assign AICs first in the AIC Management tab.
              </p>
            )}
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={areasLoading || assignedAicsToCampaign.length === 0}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
            >
              {areasLoading ? "Saving..." : "Create & Assign"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Area Modal */}
      <Modal isOpen={!!editingArea} onClose={() => setEditingArea(null)} title={`Edit Area: ${editingArea?.areaName || ""}`}>
        <form onSubmit={handleSubmitEdit(onEditSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Area Number</label>
              <input
                type="text"
                {...registerEdit("areaNo")}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
              {editErrors.areaNo && <p className="text-sm text-red-600 mt-1">{editErrors.areaNo.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Area Name</label>
              <input
                type="text"
                {...registerEdit("areaName")}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
              {editErrors.areaName && <p className="text-sm text-red-600 mt-1">{editErrors.areaName.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Area Description (Optional)</label>
            <textarea
              {...registerEdit("areaDescription")}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
              rows="2"
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Assigned AIC</label>
            <select
              {...registerEdit("aicId")}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">-- Select an Assigned AIC --</option>
              {assignedAicsToCampaign.map((aic) => (
                <option key={aic._id} value={aic._id}>
                  {aic.aicName} (AIC No: {aic.aicNo})
                </option>
              ))}
            </select>
            {editErrors.aicId && <p className="text-sm text-red-600 mt-1">{editErrors.aicId.message}</p>}
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setEditingArea(null)}
              className="px-4 py-2 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={areasLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
            >
              {areasLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AreaManagementPage;