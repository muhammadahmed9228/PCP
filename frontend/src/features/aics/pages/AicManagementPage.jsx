import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { fetchAICs, registerNewAIC, editAIC, removeAIC, assignAic } from "../store/aicSlice";
import { fetchCampaigns } from "../../campaigns/store/campaignSlice";
import { registerAicSchema, updateAicSchema } from "../validations/aic.schema";
import Modal from "../../../components/shared/Modal";

const AicManagementPage = () => {
  const dispatch = useDispatch();
  const { aics, loading: aicsLoading } = useSelector((state) => state.aics);
  const { campaigns } = useSelector((state) => state.campaigns);
  
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedAic, setSelectedAic] = useState(null);
  const [selectedCampaignId, setSelectedCampaignId] = useState("");

  // Register Form
  const {
    register: registerNew,
    handleSubmit: handleSubmitNew,
    reset: resetNew,
    formState: { errors: errorsNew },
  } = useForm({
    resolver: zodResolver(registerAicSchema),
  });

  // Edit Form
  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    setValue: setEditValue,
    formState: { errors: errorsEdit },
  } = useForm({
    resolver: zodResolver(updateAicSchema),
  });

  useEffect(() => {
    dispatch(fetchAICs());
    dispatch(fetchCampaigns());
  }, [dispatch]);

  const planningCampaigns = campaigns.filter(c => c.status === "Planning");

  const onRegisterSubmit = async (data) => {
    const payload = { ...data, isGovtEmployee: data.isGovtEmployee === "true" };
    const resultAction = await dispatch(registerNewAIC(payload));
    if (registerNewAIC.fulfilled.match(resultAction)) {
      setIsRegisterModalOpen(false);
      resetNew();
    }
  };

  const handleEditClick = (aic) => {
    setSelectedAic(aic);
    setEditValue("aicNo", aic.aicNo);
    setEditValue("aicName", aic.aicName);
    setEditValue("phoneNumber", aic.phoneNumber);
    setEditValue("gender", aic.gender);
    setEditValue("isGovtEmployee", aic.isGovtEmployee ? "true" : "false");
    setEditValue("password", "");
    setIsEditModalOpen(true);
  };

  const onEditSubmit = async (data) => {
    if (!selectedAic) return;
    const payload = {
      aicNo: data.aicNo,
      aicName: data.aicName,
      phoneNumber: data.phoneNumber,
      gender: data.gender,
      isGovtEmployee: data.isGovtEmployee === "true",
    };
    if (data.password && data.password.trim() !== "") {
      payload.password = data.password;
    }

    const resultAction = await dispatch(editAIC({ id: selectedAic._id, aicData: payload }));
    if (editAIC.fulfilled.match(resultAction)) {
      setIsEditModalOpen(false);
      resetEdit();
      setSelectedAic(null);
    }
  };

  const handleDeleteClick = async (aic) => {
    const confirmMsg = `Are you sure you want to delete AIC "${aic.aicName}" (${aic.aicNo})?\n\nThis will remove their profile and unassign them from any planning campaigns.`;
    if (window.confirm(confirmMsg)) {
      await dispatch(removeAIC(aic._id));
    }
  };

  const handleAssignClick = (aic) => {
    setSelectedAic(aic);
    setIsAssignModalOpen(true);
    setSelectedCampaignId("");
  };

  const onAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCampaignId || !selectedAic) return;
    
    const resultAction = await dispatch(assignAic({ 
      campaignId: selectedCampaignId, 
      aicId: selectedAic._id 
    }));

    if (assignAic.fulfilled.match(resultAction)) {
      setIsAssignModalOpen(false);
      dispatch(fetchCampaigns());
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Manage Area In-Charges (AICs)</h2>
          <p className="text-sm text-gray-500 mt-1">
            Register, edit, assign, or remove supervisory AIC personnel across union council campaigns.
          </p>
        </div>
        <button
          onClick={() => setIsRegisterModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2.5 rounded-md shadow hover:bg-blue-700 font-medium text-sm flex items-center gap-2 transition"
        >
          <span className="text-lg leading-none">+</span> Register New AIC
        </button>
      </div>

      {aicsLoading && aics.length === 0 ? (
        <p className="text-gray-500 p-4">Loading AICs...</p>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">AIC No</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">CNIC (Username)</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {aics.map((aic) => (
                <tr key={aic._id} className="hover:bg-gray-50/60 transition">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{aic.aicNo}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{aic.aicName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{aic.username}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{aic.phoneNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs">
                    <span className={`px-2 py-0.5 rounded font-medium ${aic.isGovtEmployee ? "bg-blue-50 text-blue-700 border border-blue-200" : "bg-gray-100 text-gray-700"}`}>
                      {aic.isGovtEmployee ? "Govt Employee" : "Private/Volunteer"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button 
                      onClick={() => handleAssignClick(aic)}
                      className="text-green-700 hover:text-green-900 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-md text-xs font-semibold border border-green-200 transition"
                      title="Assign to a Campaign"
                    >
                      Assign
                    </button>
                    <button 
                      onClick={() => handleEditClick(aic)}
                      className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 px-2.5 py-1.5 rounded-md text-xs font-medium transition"
                      title="Edit AIC details"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(aic)}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50 px-2.5 py-1.5 rounded-md text-xs font-medium transition"
                      title="Delete AIC"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {aics.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-sm text-gray-500">
                    No AICs registered yet. Click <strong>+ Register New AIC</strong> to add personnel.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Register AIC Modal */}
      <Modal isOpen={isRegisterModalOpen} onClose={() => setIsRegisterModalOpen(false)} title="Register New AIC">
        <form onSubmit={handleSubmitNew(onRegisterSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">AIC Number</label>
              <input type="text" {...registerNew("aicNo")} placeholder="e.g. AIC-01" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
              {errorsNew.aicNo && <p className="text-sm text-red-600 mt-1">{errorsNew.aicNo.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">AIC Name</label>
              <input type="text" {...registerNew("aicName")} placeholder="Full Name" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
              {errorsNew.aicName && <p className="text-sm text-red-600 mt-1">{errorsNew.aicName.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">CNIC (Username)</label>
              <input type="text" {...registerNew("username")} placeholder="13 digits without dashes" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
              {errorsNew.username && <p className="text-sm text-red-600 mt-1">{errorsNew.username.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input type="password" {...registerNew("password")} placeholder="At least 6 characters" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
              {errorsNew.password && <p className="text-sm text-red-600 mt-1">{errorsNew.password.message}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
            <input type="text" {...registerNew("phoneNumber")} placeholder="03001234567" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
            {errorsNew.phoneNumber && <p className="text-sm text-red-600 mt-1">{errorsNew.phoneNumber.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Gender</label>
              <select {...registerNew("gender")} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-white">
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              {errorsNew.gender && <p className="text-sm text-red-600 mt-1">{errorsNew.gender.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Govt Employee?</label>
              <select {...registerNew("isGovtEmployee")} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-white">
                <option value="">Select</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
              {errorsNew.isGovtEmployee && <p className="text-sm text-red-600 mt-1">{errorsNew.isGovtEmployee.message}</p>}
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setIsRegisterModalOpen(false)} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50 text-sm">
              Cancel
            </button>
            <button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 font-medium text-sm">
              Register AIC
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit AIC Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={`Edit AIC: ${selectedAic?.aicName || ""}`}>
        <form onSubmit={handleSubmitEdit(onEditSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">AIC Number</label>
              <input type="text" {...registerEdit("aicNo")} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
              {errorsEdit.aicNo && <p className="text-sm text-red-600 mt-1">{errorsEdit.aicNo.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">AIC Name</label>
              <input type="text" {...registerEdit("aicName")} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
              {errorsEdit.aicName && <p className="text-sm text-red-600 mt-1">{errorsEdit.aicName.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">CNIC (Read-only)</label>
              <input type="text" value={selectedAic?.username || ""} disabled className="mt-1 block w-full px-3 py-2 border border-gray-200 bg-gray-100 text-gray-500 rounded-md font-mono" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">New Password (Optional)</label>
              <input type="password" {...registerEdit("password")} placeholder="Leave blank to keep current" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
              {errorsEdit.password && <p className="text-sm text-red-600 mt-1">{errorsEdit.password.message}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
            <input type="text" {...registerEdit("phoneNumber")} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
            {errorsEdit.phoneNumber && <p className="text-sm text-red-600 mt-1">{errorsEdit.phoneNumber.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Gender</label>
              <select {...registerEdit("gender")} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-white">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              {errorsEdit.gender && <p className="text-sm text-red-600 mt-1">{errorsEdit.gender.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Govt Employee?</label>
              <select {...registerEdit("isGovtEmployee")} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-white">
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
              {errorsEdit.isGovtEmployee && <p className="text-sm text-red-600 mt-1">{errorsEdit.isGovtEmployee.message}</p>}
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50 text-sm">
              Cancel
            </button>
            <button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 font-medium text-sm">
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* Assign AIC Modal */}
      <Modal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} title="Assign AIC to Campaign">
        <form onSubmit={onAssignSubmit} className="space-y-4">
          <p className="text-sm text-gray-600">
            Assigning <strong>{selectedAic?.aicName}</strong> ({selectedAic?.aicNo}) to an active planning campaign.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700">Select Planning Campaign</label>
            <select 
              value={selectedCampaignId}
              onChange={(e) => setSelectedCampaignId(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
              required
            >
              <option value="">-- Choose a Campaign --</option>
              {planningCampaigns.map(camp => (
                <option key={camp._id} value={camp._id}>
                  {camp.campaignName} ({camp.nameOfSIA})
                </option>
              ))}
            </select>
            {planningCampaigns.length === 0 && (
              <p className="text-sm text-red-600 mt-2">No campaigns currently in Planning phase.</p>
            )}
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setIsAssignModalOpen(false)} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50 text-sm">
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={!selectedCampaignId}
              className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700 disabled:opacity-50 text-sm font-medium"
            >
              Confirm Assignment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AicManagementPage;