import { useState } from "react";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerNewTeam, updateTeam, deleteTeam } from "../store/teamSlice";
import { teamService } from "../services/team.service";
import { useServerList } from "../../../components/shared/useServerList";
import ServerListControls from "../../../components/shared/ServerListControls";
import { registerTeamSchema, editTeamSchema } from "../validations/team.schema";
import Modal from "../../../components/shared/Modal";
import { useTranslation } from "react-i18next";
import "../../../i18n/i18n";

const TeamManagementPage = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [query, setQuery] = useState({ page: 1, limit: 10, search: "", teamType: "all", leaderRoleType: "all", leaderGender: "all", sort: "createdAt", order: "desc" });
  const { items: teams, total, typeCounts = { Mobile: 0, Fixed: 0, Transit: 0 }, loading, error, refresh } = useServerList(teamService.listTeams, query);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [viewTeam, setViewTeam] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(selectedTeam ? editTeamSchema : registerTeamSchema),
    defaultValues: {
      leader: { states: [] },
      member: { states: [] }
    }
  });

  const onSubmit = async (data) => {
    if (selectedTeam && !data.password) delete data.password;
    // Auto-map 'F' state if gender is Female
    if (data.leader.gender === "Female" && !data.leader.states.includes("F")) {
      data.leader.states.push("F");
    }
    if (data.member.gender === "Female" && !data.member.states.includes("F")) {
      data.member.states.push("F");
    }
    
    setSaving(true);
    try {
      const action = selectedTeam ? updateTeam({ id: selectedTeam._id, teamData: data }) : registerNewTeam(data);
      const resultAction = await dispatch(action);
      if ((selectedTeam && updateTeam.fulfilled.match(resultAction)) || (!selectedTeam && registerNewTeam.fulfilled.match(resultAction))) {
        setIsModalOpen(false);
        setSelectedTeam(null);
        reset();
        if (!selectedTeam) setQuery(current => ({ ...current, page: 1 }));
        refresh();
      }
    } finally {
      setSaving(false);
    }
  };

  const openCreate = () => { setSelectedTeam(null); reset({ leader: { states: [] }, member: { states: [] } }); setIsModalOpen(true); };
  const openEdit = (team) => {
    setSelectedTeam(team);
    reset({ ...team, password: "", leader: { ...team.leader, states: team.leader?.states || [] }, member: { ...team.member, states: team.member?.states || [] } });
    setIsModalOpen(true);
  };
  const onDelete = async (team) => {
    if (window.confirm(t("teamDeleteConfirm", { type: t(`teamType${team.teamType}`), number: team.teamNo }))) {
      const resultAction = await dispatch(deleteTeam(team._id));
      if (deleteTeam.fulfilled.match(resultAction)) refresh();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">{t("manageFieldTeams")}</h2>
        <button onClick={openCreate} className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700">
          + {t("registerNewTeam")}
        </button>
      </div>

      <ServerListControls query={query} setQuery={setQuery} total={total} loading={loading} label="teams"
        filters={[
          { key: "teamType", label: t("teamType"), options: [{ value: "all", label: t("teamAllTypes") }, ...["Mobile", "Fixed", "Transit"].map(value => ({ value, label: t(`teamType${value}`) }))] },
          { key: "leaderRoleType", label: t("teamLeaderRole"), options: [{ value: "all", label: t("teamAllRoles") }, { value: "LHW", label: "LHW" }, { value: "Volunteer", label: t("teamVolunteer") }] },
          { key: "leaderGender", label: t("teamLeaderGender"), options: [{ value: "all", label: t("teamAllGenders") }, { value: "Male", label: t("teamMale") }, { value: "Female", label: t("teamFemale") }] }
        ]}
        sorts={[{ value: "createdAt", label: t("teamRegistered") }, { value: "teamNo", label: t("teamNumber") },
          { value: "teamType", label: t("teamType") }, { value: "username", label: t("usernameCnic") },
          { value: "leader.name", label: t("teamLeaderName") }, { value: "member.name", label: t("teamMemberName") }]} />
      {error && <p role="alert" className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {loading ? (
        <p>{t("loadingTeams")}</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {["Mobile", "Fixed", "Transit"].map((type) => (
          <div key={type} className="bg-white shadow rounded-lg overflow-hidden border">
          <div className={`px-4 py-3 font-semibold ${type === "Mobile" ? "bg-blue-50 text-blue-800" : type === "Fixed" ? "bg-purple-50 text-purple-800" : "bg-pink-50 text-pink-800"}`}>{t(`teamType${type}`)} {t("teams")} <span className="text-xs font-normal">({t("teamMatching", { count: typeCounts[type] })})</span></div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t("teamNo")}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t("leader")}</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t("actions")}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {teams.filter((team) => team.teamType === type).map((team) => (
                <tr key={team._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{team.teamNo}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{team.leader?.name || "—"}</td>
                  <td className="px-3 py-4 whitespace-nowrap text-xs"><button onClick={() => setViewTeam(team)} className="text-emerald-600 mr-2">{t("view")}</button><button onClick={() => openEdit(team)} className="text-blue-600 mr-2">{t("edit")}</button><button onClick={() => onDelete(team)} className="text-red-600">{t("delete")}</button></td>
                </tr>
              ))}
              {teams.filter((team) => team.teamType === type).length === 0 && (
                <tr><td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">{t(typeCounts[type] ? "teamEmptyPage" : "teamEmptyMatching", { type: t(`teamType${type}`) })}</td></tr>
              )}
            </tbody>
          </table></div>))}
        </div>
      )}

      <Modal isOpen={Boolean(viewTeam)} onClose={() => setViewTeam(null)} title={viewTeam ? t("teamTitle", { type: t(`teamType${viewTeam.teamType}`), number: viewTeam.teamNo }) : t("teamDetails")}>
        {viewTeam && <div className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-3"><div><span className="text-gray-500">{t("teamType")}</span><p className="font-medium">{t(`teamType${viewTeam.teamType}`)}</p></div><div><span className="text-gray-500">{t("usernameCnic")}</span><p className="font-medium">{viewTeam.username}</p></div></div>
          {[[t("leader"), viewTeam.leader], [t("teamMember"), viewTeam.member]].map(([label, person]) => <div key={label} className="rounded border p-3"><h4 className="font-semibold mb-2">{label}</h4><div className="grid grid-cols-2 gap-2"><p><span className="text-gray-500">{t("teamName")}:</span> {person?.name || "—"}</p><p><span className="text-gray-500">{t("cnic")}:</span> {person?.cnic || "—"}</p><p><span className="text-gray-500">{t("gender")}:</span> {person?.gender ? t(`team${person.gender}`) : "—"}</p><p><span className="text-gray-500">{t("teamRole")}:</span> {person?.roleType === "Volunteer" ? t("teamVolunteer") : person?.roleType || "—"}</p><p className="col-span-2"><span className="text-gray-500">{t("teamStates")}:</span> {person?.states?.length ? person.states.map(state => ({ G: t("teamGovtEmployee"), L: t("teamLocalPerson"), F: t("teamFemaleState") }[state] || state)).join(", ") : t("teamNone")}</p></div></div>)}
        </div>}
      </Modal>

      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setSelectedTeam(null); }} title={selectedTeam ? t("teamEditTitle", { type: t(`teamType${selectedTeam.teamType}`) }) : t("registerFieldTeam")}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">{t("teamNumber")}</label>
              <input type="text" {...register("teamNo")} className="mt-1 block w-full px-3 py-2 border rounded-md" />
              {errors.teamNo && <p className="text-red-600 text-xs">{t(errors.teamNo.message, { defaultValue: errors.teamNo.message })}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{t("teamType")}</label>
              <select {...register("teamType")} className="mt-1 block w-full px-3 py-2 border rounded-md bg-white">
                <option value="">{t("selectType")}</option>
              <option value="Mobile">{t("teamTypeMobile")}</option>
              <option value="Fixed">{t("teamTypeFixed")}</option>
              <option value="Transit">{t("teamTypeTransit")}</option>
              </select>
              {errors.teamType && <p className="text-red-600 text-xs">{t(errors.teamType.message, { defaultValue: errors.teamType.message })}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">{t("usernameCnic")}</label>
              <input type="text" {...register("username")} className="mt-1 block w-full px-3 py-2 border rounded-md" />
              <p className="mt-1 text-xs text-gray-500">{t("teamUsernameHint")}</p>
              {errors.username && <p className="text-red-600 text-xs">{t(errors.username.message, { defaultValue: errors.username.message })}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{t("password")}</label>
              <input type="password" placeholder={selectedTeam ? t("teamPasswordHint") : ""} {...register("password")} className="mt-1 block w-full px-3 py-2 border rounded-md" />
              {errors.password && <p className="text-red-600 text-xs">{t(errors.password.message, { defaultValue: errors.password.message })}</p>}
            </div>
          </div>

          <hr className="my-4" />
          <h4 className="font-semibold text-gray-700">{t("leaderDetails")}</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <input type="text" placeholder={t("teamLeaderName")} {...register("leader.name")} className="px-3 py-2 border w-full rounded-md" />
              {errors.leader?.name && <p className="text-red-600 text-xs">{t(errors.leader.name.message, { defaultValue: errors.leader.name.message })}</p>}
            </div>
            <div>
              <input type="text" placeholder={t("leaderCnic")} {...register("leader.cnic")} className="px-3 py-2 border w-full rounded-md" />
              {errors.leader?.cnic && <p className="text-red-600 text-xs">{t(errors.leader.cnic.message, { defaultValue: errors.leader.cnic.message })}</p>}
            </div>
            <div>
              <select {...register("leader.gender")} className="px-3 py-2 border w-full rounded-md bg-white">
                <option value="">{t("gender")}</option>
                <option value="Male">{t("teamMale")}</option>
                <option value="Female">{t("teamFemale")}</option>
              </select>
              {errors.leader?.gender && <p className="text-red-600 text-xs">{t(errors.leader.gender.message, { defaultValue: errors.leader.gender.message })}</p>}
            </div>
            <div>
              <select {...register("leader.roleType")} className="px-3 py-2 border w-full rounded-md bg-white">
                <option value="">{t("teamRoleType")}</option>
                <option value="LHW">LHW</option>
                <option value="Volunteer">{t("teamVolunteer")}</option>
              </select>
              {errors.leader?.roleType && <p className="text-red-600 text-xs">{t(errors.leader.roleType.message, { defaultValue: errors.leader.roleType.message })}</p>}
            </div>
            <div className="col-span-2 flex gap-4">
              <label className="flex items-center text-sm text-gray-700">
                <input type="checkbox" value="G" {...register("leader.states")} className="mr-2" />
                {t("teamGovtEmployee")}
              </label>
              <label className="flex items-center text-sm text-gray-700">
                <input type="checkbox" value="L" {...register("leader.states")} className="mr-2" />
                {t("teamLocalPerson")}
              </label>
            </div>
          </div>

          <hr className="my-4" />
          <h4 className="font-semibold text-gray-700">{t("memberDetails")}</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <input type="text" placeholder={t("teamMemberName")} {...register("member.name")} className="px-3 py-2 border w-full rounded-md" />
              {errors.member?.name && <p className="text-red-600 text-xs">{t(errors.member.name.message, { defaultValue: errors.member.name.message })}</p>}
            </div>
            <div>
              <input type="text" placeholder={t("memberCnic")} {...register("member.cnic")} className="px-3 py-2 border w-full rounded-md" />
              {errors.member?.cnic && <p className="text-red-600 text-xs">{t(errors.member.cnic.message, { defaultValue: errors.member.cnic.message })}</p>}
            </div>
            <div>
              <select {...register("member.gender")} className="px-3 py-2 border w-full rounded-md bg-white">
                <option value="">{t("gender")}</option>
                <option value="Male">{t("teamMale")}</option>
                <option value="Female">{t("teamFemale")}</option>
              </select>
              {errors.member?.gender && <p className="text-red-600 text-xs">{t(errors.member.gender.message, { defaultValue: errors.member.gender.message })}</p>}
            </div>
            <div>
              <select {...register("member.roleType")} className="px-3 py-2 border w-full rounded-md bg-white">
                <option value="">{t("teamRoleType")}</option>
                <option value="LHW">LHW</option>
                <option value="Volunteer">{t("teamVolunteer")}</option>
              </select>
              {errors.member?.roleType && <p className="text-red-600 text-xs">{t(errors.member.roleType.message, { defaultValue: errors.member.roleType.message })}</p>}
            </div>
            <div className="col-span-2 flex gap-4">
              <label className="flex items-center text-sm text-gray-700">
                <input type="checkbox" value="G" {...register("member.states")} className="mr-2" />
                {t("teamGovtEmployee")}
              </label>
              <label className="flex items-center text-sm text-gray-700">
                <input type="checkbox" value="L" {...register("member.states")} className="mr-2" />
                {t("teamLocalPerson")}
              </label>
            </div>
          </div>

          <div className="pt-4">
            <button type="submit" disabled={saving} className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50">
              {saving ? t("saving") : selectedTeam ? t("teamUpdate") : t("registerTeam")}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TeamManagementPage;
