import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createNewCampaign, editCampaign, removeCampaign, completeCampaign } from "../store/campaignSlice";
import { campaignService } from "../services/campaign.service";
import { useServerList } from "../../../components/shared/useServerList";
import ServerListControls from "../../../components/shared/ServerListControls";
import { bootstrapContext } from "../../context/store/contextSlice";
import { createCampaignSchema } from "../validations/campaign.schema";
import Modal from "../../../components/shared/Modal";
import { useTranslation } from "react-i18next";
import "../../../i18n/i18n";

const CampaignListPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [query, setQuery] = useState({ page: 1, limit: 10, search: "", status: "current", sort: "createdAt", order: "desc" });
  const { items: currentCampaigns, total, loading, error, refresh } = useServerList(campaignService.listCampaigns, query);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  // Form for creating campaign
  const {
    register: registerCreate,
    handleSubmit: handleSubmitCreate,
    reset: resetCreate,
    formState: { errors: errorsCreate },
  } = useForm({
    resolver: zodResolver(createCampaignSchema),
  });

  // Form for editing campaign
  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    setValue: setEditValue,
    formState: { errors: errorsEdit },
  } = useForm({
    resolver: zodResolver(createCampaignSchema),
  });

  const onCreateSubmit = async (data) => {
    const resultAction = await dispatch(createNewCampaign(data));
    if (createNewCampaign.fulfilled.match(resultAction)) {
      setIsCreateModalOpen(false);
      resetCreate();
      setQuery(current => ({ ...current, page: 1 }));
      refresh();
      dispatch(bootstrapContext());
    }
  };

  const handleEditClick = (campaign) => {
    setSelectedCampaign(campaign);
    setEditValue("campaignName", campaign.campaignName);
    setEditValue("nameOfSIA", campaign.nameOfSIA);
    setEditValue("campaignDescription", campaign.campaignDescription || "");
    setEditValue("startDate", campaign.startDate ? campaign.startDate.split("T")[0] : "");
    setEditValue("endDate", campaign.endDate ? campaign.endDate.split("T")[0] : "");
    setIsEditModalOpen(true);
  };

  const handleViewClick = (campaign) => {
    setSelectedCampaign(campaign);
    setIsViewModalOpen(true);
  };

  const onEditSubmit = async (data) => {
    if (!selectedCampaign) return;
    const resultAction = await dispatch(editCampaign({ id: selectedCampaign._id, campaignData: data }));
    if (editCampaign.fulfilled.match(resultAction)) {
      setIsEditModalOpen(false);
      resetEdit();
      if (selectedCampaign._id === selectedCampaign?._id) {
        setSelectedCampaign(resultAction.payload);
      }
      refresh();
      dispatch(bootstrapContext());
    }
  };

  const handleDeleteClick = async (campaign) => {
    if (campaign.status === "Active" || campaign.status === "Completed") {
      alert(`Cannot delete a campaign in '${campaign.status}' status. Only Planning or Cancelled campaigns can be deleted.`);
      return;
    }

    const confirmMsg = `Are you sure you want to delete "${campaign.campaignName}"?\n\nThis will permanently remove the campaign and all of its assigned areas.`;
    if (window.confirm(confirmMsg)) {
      const resultAction = await dispatch(removeCampaign(campaign._id));
      if (removeCampaign.fulfilled.match(resultAction)) { refresh(); dispatch(bootstrapContext()); }
      if (removeCampaign.fulfilled.match(resultAction) && selectedCampaign?._id === campaign._id) {
        setIsManageModalOpen(false);
        setSelectedCampaign(null);
      }
    }
  };

  const handleCompleteClick = async (campaign) => {
    if (!window.confirm(`Complete and archive "${campaign.campaignName}"? It will become read-only and move to Campaign History.`)) return;
    const resultAction = await dispatch(completeCampaign(campaign._id));
    if (completeCampaign.fulfilled.match(resultAction)) { refresh(); dispatch(bootstrapContext()); }
  };

  const getStatusBadge = (status) => {
    const colors = {
      Planning: "bg-yellow-100 text-yellow-800 border-yellow-200",
      Active: "bg-green-100 text-green-800 border-green-200",
      Completed: "bg-gray-100 text-gray-800 border-gray-200",
      Paused: "bg-orange-100 text-orange-800 border-orange-200",
      Cancelled: "bg-red-100 text-red-800 border-red-200",
    };
    return `px-2.5 py-1 rounded-full text-xs font-semibold border ${colors[status] || colors.Planning}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{t("campaigns")}</h2>
          <p className="text-sm text-gray-500 mt-1">
            {t("campaignsDescription")}
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2.5 rounded-md shadow hover:bg-blue-700 font-medium text-sm flex items-center gap-2 transition"
        >
          <span className="text-lg leading-none">+</span> New Campaign
          </button>
      </div>

      <ServerListControls query={query} setQuery={setQuery} total={total} loading={loading} label="campaigns"
        filters={[{ key: "status", label: "Status", options: [
          { value: "current", label: "Current (exclude completed)" }, { value: "all", label: "All statuses" },
          ...["Planning", "Active", "Paused", "Cancelled", "Completed"].map(value => ({ value, label: value }))
        ] }]}
        sorts={[{ value: "createdAt", label: "Created" }, { value: "campaignName", label: "Campaign name" },
          { value: "nameOfSIA", label: "SIA" }, { value: "startDate", label: "Start date" },
          { value: "endDate", label: "End date" }, { value: "status", label: "Status" }]} />
      {error && <p role="alert" className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {loading && currentCampaigns.length === 0 ? (
        <p className="text-gray-500 p-4">{t("loadingCampaigns")}</p>
      ) : (
        <div className="max-w-full overflow-x-auto rounded-lg border border-gray-200 bg-white shadow" role="region" aria-label="Campaigns table" tabIndex={0}>
          <table className="min-w-[1100px] w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("campaignName")}</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("sia")}</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("dates")}</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("status")}</th>
                <th className="min-w-52 bg-gray-50 px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider lg:sticky lg:right-0 lg:shadow-[-8px_0_12px_-10px_#64748b]">{t("actions")}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentCampaigns.map((campaign) => (
                <tr key={campaign._id} className="hover:bg-gray-50/60 transition">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-semibold text-gray-900">{campaign.campaignName}</div>
                    {campaign.campaignDescription && (
                      <div className="text-xs text-gray-500 truncate max-w-xs">{campaign.campaignDescription}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{campaign.nameOfSIA}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(campaign.startDate).toLocaleDateString()} – {new Date(campaign.endDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getStatusBadge(campaign.status)}>{campaign.status}</span>
                  </td>
                  <td className="min-w-52 bg-gray-100 px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2 lg:sticky lg:right-0 lg:shadow-[-8px_0_12px_-10px_#64748b]">
                    <button
                      onClick={() => handleViewClick(campaign)}
                      className="px-2.5 py-1.5 text-blue-700 hover:text-blue-900 hover:bg-blue-50 rounded-md text-xs font-medium transition"
                      title="View Campaign details"
                    >
                      View
                    </button>
                    {/* Quick Edit */}
                    <button
                      onClick={() => handleEditClick(campaign)}
                      disabled={campaign.status === "Completed"}
                      className="px-2.5 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md text-xs font-medium transition disabled:opacity-40"
                      title="Edit Campaign"
                    >
                      {t("edit")}
                    </button>
                    {/* Quick Delete */}
                    <button
                      onClick={() => handleDeleteClick(campaign)}
                      disabled={campaign.status === "Active" || campaign.status === "Completed"}
                      className="px-2.5 py-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md text-xs font-medium transition disabled:opacity-40"
                      title="Delete Campaign"
                    >
                      {t("delete")}
                    </button>
                    {campaign.status === "Active" && (
                      <button
                        onClick={() => handleCompleteClick(campaign)}
                        className="px-2.5 py-1.5 text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 rounded-md text-xs font-medium transition"
                        title="Complete and archive campaign"
                      >
                        {t("complete")}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {currentCampaigns.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-sm text-gray-500">
                    {t("noCampaignsFound")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Campaign Management Hub Modal */}
      {selectedCampaign && (
        <Modal isOpen={isManageModalOpen} onClose={() => setIsManageModalOpen(false)} title={`Manage: ${selectedCampaign.campaignName}`}>
          <div className="space-y-6">
            {/* Overview Card */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs uppercase font-bold text-gray-500">Campaign Details</span>
                <span className={getStatusBadge(selectedCampaign.status)}>{selectedCampaign.status}</span>
              </div>
              <p className="text-sm text-gray-700"><strong>Name of SIA:</strong> {selectedCampaign.nameOfSIA}</p>
              <p className="text-sm text-gray-700">
                <strong>Duration:</strong> {new Date(selectedCampaign.startDate).toLocaleDateString()} to {new Date(selectedCampaign.endDate).toLocaleDateString()}
              </p>
              {selectedCampaign.campaignDescription && (
                <p className="text-xs text-gray-600 pt-1 border-t">{selectedCampaign.campaignDescription}</p>
              )}
              <div className="pt-2 flex items-center gap-3 text-xs text-gray-600">
                <span>Assigned AICs: <strong className="text-gray-800">{selectedCampaign.aics?.length || 0}</strong></span>
              </div>
            </div>

            {/* Hub Quick Action Links */}
            <div>
              <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                Campaign Operations & Planning Workflows
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsManageModalOpen(false);
                    navigate("/dashboard/uci/aics");
                  }}
                  className="p-3 text-left bg-white border border-gray-200 hover:border-blue-500 hover:bg-blue-50/50 rounded-lg shadow-sm transition group"
                >
                  <div className="font-semibold text-sm text-gray-900 group-hover:text-blue-700">👥 Assign & Manage AICs</div>
                  <div className="text-xs text-gray-500 mt-1">Register AICs and associate them with this campaign</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsManageModalOpen(false);
                    navigate("/dashboard/uci/areas");
                  }}
                  className="p-3 text-left bg-white border border-gray-200 hover:border-blue-500 hover:bg-blue-50/50 rounded-lg shadow-sm transition group"
                >
                  <div className="font-semibold text-sm text-gray-900 group-hover:text-blue-700">🗺️ Divide UC into Areas</div>
                  <div className="text-xs text-gray-500 mt-1">Assign partitioned UC areas to designated AICs</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsManageModalOpen(false);
                    navigate("/dashboard/uci/ucmp");
                  }}
                  className="p-3 text-left bg-white border border-gray-200 hover:border-blue-500 hover:bg-blue-50/50 rounded-lg shadow-sm transition group"
                >
                  <div className="font-semibold text-sm text-gray-900 group-hover:text-blue-700">📋 UC Micro Plan (UCMP)</div>
                  <div className="text-xs text-gray-500 mt-1">Create, edit draft, and finalize the UC micro plan</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsManageModalOpen(false);
                    navigate("/dashboard/uci/activation");
                  }}
                  className="p-3 text-left bg-white border border-gray-200 hover:border-blue-500 hover:bg-blue-50/50 rounded-lg shadow-sm transition group"
                >
                  <div className="font-semibold text-sm text-gray-900 group-hover:text-blue-700">🚀 Campaign Activation</div>
                  <div className="text-xs text-gray-500 mt-1">Verify checklist & transition campaign from Planning to Active</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsManageModalOpen(false);
                    navigate("/dashboard/uci/form2b");
                  }}
                  className="p-3 text-left bg-white border border-gray-200 hover:border-blue-500 hover:bg-blue-50/50 rounded-lg shadow-sm transition group sm:col-span-2"
                >
                  <div className="font-semibold text-sm text-gray-900 group-hover:text-blue-700">📊 Form 2B Aggregation & Review</div>
                  <div className="text-xs text-gray-500 mt-1">Auto-populated day-wise summary across all AICs in this campaign</div>
                </button>
              </div>
            </div>

            {/* Danger / Edit actions */}
            <div className="pt-4 border-t flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setIsManageModalOpen(false);
                  handleEditClick(selectedCampaign);
                }}
                disabled={selectedCampaign.status === "Completed"}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md text-sm font-medium transition disabled:opacity-50"
              >
                ✏️ Edit Campaign Details
              </button>

              <button
                type="button"
                onClick={() => handleDeleteClick(selectedCampaign)}
                disabled={selectedCampaign.status === "Active" || selectedCampaign.status === "Completed"}
                className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-md text-sm font-semibold transition disabled:opacity-50"
              >
                🗑️ Delete Campaign
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Read-only Campaign Details Modal */}
      {selectedCampaign && (
        <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title={`View Campaign: ${selectedCampaign.campaignName}`}>
          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4 border border-gray-200">
              <span className="font-semibold text-gray-700">Status</span>
              <span className={getStatusBadge(selectedCampaign.status)}>{selectedCampaign.status}</span>
            </div>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><dt className="text-xs font-semibold uppercase text-gray-500">Campaign Name</dt><dd className="mt-1 text-gray-900">{selectedCampaign.campaignName || "—"}</dd></div>
              <div><dt className="text-xs font-semibold uppercase text-gray-500">Name of SIA</dt><dd className="mt-1 text-gray-900">{selectedCampaign.nameOfSIA || "—"}</dd></div>
              <div><dt className="text-xs font-semibold uppercase text-gray-500">Start Date</dt><dd className="mt-1 text-gray-900">{selectedCampaign.startDate ? new Date(selectedCampaign.startDate).toLocaleDateString() : "—"}</dd></div>
              <div><dt className="text-xs font-semibold uppercase text-gray-500">End Date</dt><dd className="mt-1 text-gray-900">{selectedCampaign.endDate ? new Date(selectedCampaign.endDate).toLocaleDateString() : "—"}</dd></div>
              <div><dt className="text-xs font-semibold uppercase text-gray-500">Assigned AICs</dt><dd className="mt-1 text-gray-900">{selectedCampaign.aics?.length || 0}</dd></div>
            </dl>
            <div>
              <dt className="text-xs font-semibold uppercase text-gray-500">Description</dt>
              <dd className="mt-1 rounded-md border border-gray-200 bg-white p-3 text-gray-700 whitespace-pre-wrap">{selectedCampaign.campaignDescription || "No description provided."}</dd>
            </div>
            <div className="flex justify-end border-t pt-4">
              <button type="button" onClick={() => setIsViewModalOpen(false)} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50 text-sm">Close</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Create New Campaign Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create New Campaign">
        <form onSubmit={handleSubmitCreate(onCreateSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Campaign Name</label>
            <input type="text" {...registerCreate("campaignName")} placeholder="e.g. November Campaign 2026" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
            {errorsCreate.campaignName && <p className="text-sm text-red-600 mt-1">{errorsCreate.campaignName.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Name of SIA</label>
            <input type="text" {...registerCreate("nameOfSIA")} placeholder="e.g. NID NOV 2026" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
            {errorsCreate.nameOfSIA && <p className="text-sm text-red-600 mt-1">{errorsCreate.nameOfSIA.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description (Optional)</label>
            <textarea {...registerCreate("campaignDescription")} placeholder="Additional notes or objective..." className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" rows="2"></textarea>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <input type="date" {...registerCreate("startDate")} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
              {errorsCreate.startDate && <p className="text-sm text-red-600 mt-1">{errorsCreate.startDate.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Date</label>
              <input type="date" {...registerCreate("endDate")} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
              {errorsCreate.endDate && <p className="text-sm text-red-600 mt-1">{errorsCreate.endDate.message}</p>}
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50 text-sm">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 disabled:opacity-50 text-sm font-medium">
              {loading ? "Creating..." : "Create Campaign"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Campaign Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={`Edit Campaign: ${selectedCampaign?.campaignName || ""}`}>
        <form onSubmit={handleSubmitEdit(onEditSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Campaign Name</label>
            <input type="text" {...registerEdit("campaignName")} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
            {errorsEdit.campaignName && <p className="text-sm text-red-600 mt-1">{errorsEdit.campaignName.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Name of SIA</label>
            <input type="text" {...registerEdit("nameOfSIA")} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
            {errorsEdit.nameOfSIA && <p className="text-sm text-red-600 mt-1">{errorsEdit.nameOfSIA.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea {...registerEdit("campaignDescription")} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" rows="2"></textarea>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <input type="date" {...registerEdit("startDate")} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
              {errorsEdit.startDate && <p className="text-sm text-red-600 mt-1">{errorsEdit.startDate.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Date</label>
              <input type="date" {...registerEdit("endDate")} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
              {errorsEdit.endDate && <p className="text-sm text-red-600 mt-1">{errorsEdit.endDate.message}</p>}
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50 text-sm">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 disabled:opacity-50 text-sm font-medium">
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CampaignListPage;
