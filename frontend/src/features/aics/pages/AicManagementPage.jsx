import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerNewAIC, editAIC, removeAIC, assignAic, unassignAic } from "../store/aicSlice";
import { aicService } from "../services/aic.service";
import { useServerList } from "../../../components/shared/useServerList";
import ServerListControls from "../../../components/shared/ServerListControls";
import { fetchCampaigns } from "../../campaigns/store/campaignSlice";
import { registerAicSchema, updateAicSchema } from "../validations/aic.schema";
import Modal from "../../../components/shared/Modal";
import { useTranslation } from "react-i18next";
import "../../../i18n/i18n";

const AicManagementPage = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [query, setQuery] = useState({ page: 1, limit: 10, search: "", assignment: "all", employment: "all", sort: "createdAt", order: "desc" });
  const { items: aics, total, loading: aicsLoading, error, refresh } = useServerList(aicService.listAICs, query);
  const { campaigns } = useSelector((state) => state.campaigns);
  
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedAic, setSelectedAic] = useState(null);
  const [viewingAic, setViewingAic] = useState(null);
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
    dispatch(fetchCampaigns());
  }, [dispatch]);

  const planningCampaigns = campaigns.filter(c => c.status === "Planning");
  const getAssignedCampaign = (aic) => campaigns.find((campaign) =>
    aic && campaign.aics?.some((assignedAic) => String(assignedAic?._id || assignedAic) === String(aic._id))
  );

  const onRegisterSubmit = async (data) => {
    const payload = { ...data, isGovtEmployee: data.isGovtEmployee === "true" };
    const resultAction = await dispatch(registerNewAIC(payload));
    if (registerNewAIC.fulfilled.match(resultAction)) {
      setIsRegisterModalOpen(false);
      resetNew();
      setQuery(current => ({ ...current, page: 1 }));
      refresh();
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
      refresh();
    }
  };

  const handleDeleteClick = async (aic) => {
    const confirmMsg = `Are you sure you want to delete AIC "${aic.aicName}" (${aic.aicNo})?\n\nThis will remove their profile and unassign them from any planning campaigns.`;
    if (window.confirm(confirmMsg)) {
      const resultAction = await dispatch(removeAIC(aic._id));
      if (removeAIC.fulfilled.match(resultAction)) {
        refresh();
        dispatch(fetchCampaigns());
      }
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
      refresh();
    }
  };

  const handleUnassignClick = async (aic) => {
    const assignedCampaign = getAssignedCampaign(aic);
    if (!assignedCampaign) return;

    const confirmed = window.confirm(
      `${t("unassignConfirmPrefix")} ${aic.aicName} ${t("fromCampaign")} "${assignedCampaign.campaignName}"?`
    );
    if (!confirmed) return;

    const resultAction = await dispatch(unassignAic({
      campaignId: assignedCampaign._id,
      aicId: aic._id,
    }));
    if (unassignAic.fulfilled.match(resultAction)) {
      dispatch(fetchCampaigns());
      refresh();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{t("manageAicsTitle")}</h2>
          <p className="text-sm text-gray-500 mt-1">
            Register, edit, assign, or remove supervisory AIC personnel across union council campaigns.
          </p>
        </div>
        <button
          onClick={() => setIsRegisterModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2.5 rounded-md shadow hover:bg-blue-700 font-medium text-sm flex items-center gap-2 transition"
        >
          <span className="text-lg leading-none">+</span> {t("registerNewAic")}
        </button>
      </div>

      <ServerListControls query={query} setQuery={setQuery} total={total} loading={aicsLoading} label="AICs"
        filters={[
          { key: "assignment", label: "Campaign assignment", options: [{ value: "all", label: "All" }, { value: "assigned", label: "Assigned" }, { value: "unassigned", label: "Unassigned" }] },
          { key: "employment", label: "Employment", options: [{ value: "all", label: "All" }, { value: "government", label: "Government" }, { value: "other", label: "Private / volunteer" }] }
        ]}
        sorts={[{ value: "createdAt", label: "Registered" }, { value: "aicNo", label: "AIC number" },
          { value: "aicName", label: "Name" }, { value: "username", label: "CNIC" }, { value: "phoneNumber", label: "Phone" }]} />
      {error && <p role="alert" className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {aicsLoading && aics.length === 0 ? (
        <p className="text-gray-500 p-4">{t("loadingAics")}</p>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-x-auto border border-gray-200">
          <table className="min-w-[900px] w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">AIC No</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">CNIC (Username)</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="sticky right-0 z-10 min-w-64 bg-gray-50 px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider shadow-[-8px_0_12px_-10px_#64748b]">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {aics.map((aic) => (
                (() => {
                  const assignedCampaign = getAssignedCampaign(aic);
                  return <tr key={aic._id} className="hover:bg-gray-50/60 transition">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{aic.aicNo}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{aic.aicName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{aic.username}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{aic.phoneNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs">
                    <span className={`px-2 py-0.5 rounded font-medium ${aic.isGovtEmployee ? "bg-blue-50 text-blue-700 border border-blue-200" : "bg-gray-100 text-gray-700"}`}>
                      {aic.isGovtEmployee ? "Govt Employee" : "Private/Volunteer"}
                    </span>
                  </td>
                  <td className="min-w-40 whitespace-normal break-words align-top px-6 py-4 text-xs">
                    <span className={`inline-block max-w-full rounded-full px-2.5 py-1 font-semibold ${assignedCampaign ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>
                      {assignedCampaign ? t("campaignAssigned") : t("campaignUnassigned")}
                    </span>
                    {assignedCampaign && <div className="mt-1 text-[11px] text-gray-500">{assignedCampaign.campaignName}</div>}
                  </td>
                  <td className="sticky  right-0 z-10 min-w-64 bg-gray-100 text-slate-900 px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2 shadow-[-8px_0_12px_-10px_#64748b]">
                    <button
                      onClick={() => setViewingAic(aic)}
                      className="text-blue-700 hover:text-blue-900 hover:bg-blue-50 px-2.5 py-1.5 rounded-md text-xs font-medium transition"
                      title="View AIC details"
                    >
                      View
                    </button>
                    <button 
                      onClick={() => assignedCampaign ? handleUnassignClick(aic) : handleAssignClick(aic)}
                      className={assignedCampaign ? "text-orange-700 hover:text-orange-900 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-md text-xs font-semibold border border-orange-200 transition" : "text-green-700 hover:text-green-900 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-md text-xs font-semibold border border-green-200 transition"}
                      title={assignedCampaign ? t("unassignFromCampaign") : t("assignToCampaign")}
                    >
                      {assignedCampaign ? t("unassign") : t("assign")}
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
                  </tr>;
                })()
              ))}
              {aics.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-sm text-gray-500">
                    {t("noAicsRegistered")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Read-only AIC Details Modal */}
      <Modal isOpen={!!viewingAic} onClose={() => setViewingAic(null)} title={`View AIC: ${viewingAic?.aicName || ""}`}>
        {viewingAic && (
          <div className="space-y-4 text-sm">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><dt className="text-xs font-semibold uppercase text-gray-500">AIC Number</dt><dd className="mt-1 text-gray-900">{viewingAic.aicNo || "—"}</dd></div>
              <div><dt className="text-xs font-semibold uppercase text-gray-500">Name</dt><dd className="mt-1 text-gray-900">{viewingAic.aicName || "—"}</dd></div>
              <div><dt className="text-xs font-semibold uppercase text-gray-500">CNIC (Username)</dt><dd className="mt-1 font-mono text-gray-900">{viewingAic.username || "—"}</dd></div>
              <div><dt className="text-xs font-semibold uppercase text-gray-500">Phone</dt><dd className="mt-1 text-gray-900">{viewingAic.phoneNumber || "—"}</dd></div>
              <div><dt className="text-xs font-semibold uppercase text-gray-500">Gender</dt><dd className="mt-1 text-gray-900">{viewingAic.gender || "—"}</dd></div>
              <div><dt className="text-xs font-semibold uppercase text-gray-500">Type</dt><dd className="mt-1 text-gray-900">{viewingAic.isGovtEmployee ? "Govt Employee" : "Private/Volunteer"}</dd></div>
            </dl>
            <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
              <div className="text-xs font-semibold uppercase text-gray-500">Campaign Assignment</div>
              <div className="mt-1 text-gray-900">{getAssignedCampaign(viewingAic)?.campaignName || "Not assigned"}</div>
            </div>
            <div className="flex justify-end border-t pt-4">
              <button type="button" onClick={() => setViewingAic(null)} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50 text-sm">Close</button>
            </div>
          </div>
        )}
      </Modal>

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
