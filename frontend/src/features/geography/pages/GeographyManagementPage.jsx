import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addRoute, addPoint, updateRoute, updatePoint, deleteRoute, deletePoint, unassignRoute, unassignPoint, assignRoute, assignPoint, clearGeography, setRouteImage, setPointImage } from "../store/geographySlice";
import { fetchTeams } from "../../teams/store/teamSlice";
import { routeSchema, pointSchema } from "../validations/geography.schema";
import Modal from "../../../components/shared/Modal";
import { useTranslation } from "react-i18next";
import "../../../i18n/i18n";
import ImageUploader from "../../../components/shared/ImageUploader";
import { imageService } from "../../../services/image.service";
import { useGeographyListing } from "../hooks/useGeographyListing";
import GeographyListControls from "../components/GeographyListControls";

const initialQuery = () => ({ search: "", filter: "all", teamId: "", day: "", pointType: "", sort: "campaignDay", order: "asc", page: 1, limit: 10 });

// ---------- helpers ----------
const groupByTeam = (items) => {
  const map = {};
  items.forEach((item) => {
    const teamId = item.team?._id || String(item.team);
    if (!map[teamId]) map[teamId] = { team: item.team, items: [] };
    map[teamId].items.push(item);
  });
  return Object.values(map);
};

/** Shows "Mobile — Team 01 | Leader: Ali Khan" */
const TeamHeading = ({ team }) => {
  const { t } = useTranslation();
  return (
  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
    <span className="text-xs font-semibold text-gray-700">
      {team ? t("geoTeamTitle", { type: t(`teamType${team.teamType}`), number: team.teamNo }) : t("geoAvailablePool")}
    </span>
    {team?.leader?.name && (
      <span className="text-xs text-gray-500">{t("geoLeaderLine", { name: team.leader.name })}</span>
    )}
  </div>
  );
};

const FormError = ({ errors, field }) => {
  const { t } = useTranslation();
  return errors[field] ? <p className="text-red-500 text-xs mt-1">{t(errors[field].message, { defaultValue: errors[field].message })}</p> : null;
};

// ---------- component ----------
const GeographyManagementPage = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { areaId } = useSelector((state) => state.context);
  const { teams } = useSelector((state) => state.teams);

  const [activeTab, setActiveTab] = useState("routes");
  const [filterTab, setFilterTab] = useState("routes");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState(() => new Set());
  const [routeQuery, setRouteQuery] = useState(initialQuery);
  const [pointQuery, setPointQuery] = useState(initialQuery);
  const routeList = useGeographyListing(areaId, "routes", routeQuery);
  const pointList = useGeographyListing(areaId, "points", pointQuery);
  const [assigningItem, setAssigningItem] = useState(null);
  const [assignTeamId, setAssignTeamId] = useState("");
  const [assignBusy, setAssignBusy] = useState(false);

  const routeForm = useForm({ resolver: zodResolver(routeSchema) });
  const pointForm = useForm({ resolver: zodResolver(pointSchema) });

  useEffect(() => {
    dispatch(fetchTeams());
  }, [dispatch]);

  useEffect(() => {
    if (!areaId) dispatch(clearGeography());
  }, [areaId, dispatch]);

  const mobileTeams = teams.filter((t) => t.teamType === "Mobile");
  const fpTeams     = teams.filter((t) => t.teamType === "Fixed" || t.teamType === "Transit");

  const openModalFor = (type) => {
    setActiveTab(type);
    setEditingItem(null);
    if (type === "routes") {
      routeForm.reset();
      routeForm.setValue("areaId", areaId);
    } else {
      pointForm.reset();
      pointForm.setValue("areaId", areaId);
    }
    setIsModalOpen(true);
  };

  const onRouteSubmit = async (data) => {
    const result = await dispatch(editingItem ? updateRoute({ id: editingItem._id, data }) : addRoute(data));
    if ((editingItem && updateRoute.fulfilled.match(result)) || (!editingItem && addRoute.fulfilled.match(result))) {
      setIsModalOpen(false);
      setEditingItem(null);
      routeForm.reset();
      setRouteQuery(current => ({ ...current, page: 1 }));
      routeList.refresh();
    }
  };

  const onPointSubmit = async (data) => {
    const result = await dispatch(editingItem ? updatePoint({ id: editingItem._id, data }) : addPoint(data));
    if ((editingItem && updatePoint.fulfilled.match(result)) || (!editingItem && addPoint.fulfilled.match(result))) {
      setIsModalOpen(false);
      setEditingItem(null);
      pointForm.reset();
      setPointQuery(current => ({ ...current, page: 1 }));
      pointList.refresh();
    }
  };

  const editRouteItem = async (route) => {
    setActiveTab("routes");
    setEditingItem(route);
    routeForm.reset({ ...route, areaId, team: route.team?._id || route.team });
    setIsModalOpen(true);
  };
  const editPointItem = async (point) => {
    setActiveTab("points");
    setEditingItem(point);
    pointForm.reset({ ...point, areaId, team: point.team?._id || point.team });
    setIsModalOpen(true);
  };
  const removeRoute = async (route) => {
    if (window.confirm(t("geoDeletePermanent", { type: t("route"), number: route.routeNo }))) {
      const result = await dispatch(deleteRoute(route._id));
      if (deleteRoute.fulfilled.match(result)) { setRouteQuery(current => ({ ...current, page: 1 })); routeList.refresh(); }
    }
  };
  const removePoint = async (point) => {
    if (window.confirm(t("geoDeletePermanent", { type: t("point"), number: point.pointNo }))) {
      const result = await dispatch(deletePoint(point._id));
      if (deletePoint.fulfilled.match(result)) { setPointQuery(current => ({ ...current, page: 1 })); pointList.refresh(); }
    }
  };
  const unassignRouteItem = async (route) => {
    if (window.confirm(t("geoUnassignKeep", { type: t("route"), number: route.routeNo }))) {
      const result = await dispatch(unassignRoute(route._id));
      if (unassignRoute.fulfilled.match(result)) { setRouteQuery(current => ({ ...current, page: 1 })); routeList.refresh(); }
    }
  };
  const unassignPointItem = async (point) => {
    if (window.confirm(t("geoUnassignKeep", { type: t("point"), number: point.pointNo }))) {
      const result = await dispatch(unassignPoint(point._id));
      if (unassignPoint.fulfilled.match(result)) { setPointQuery(current => ({ ...current, page: 1 })); pointList.refresh(); }
    }
  };
  const openAssign = (type, item) => { setAssigningItem({ type, item }); setAssignTeamId(""); };
  const submitAssign = async (event) => {
    event.preventDefault();
    if (!assigningItem || !assignTeamId || assignBusy) return;
    setAssignBusy(true);
    try {
      const action = assigningItem.type === "route" ? assignRoute : assignPoint;
      const result = await dispatch(action({ id: assigningItem.item._id, data: assignTeamId }));
      if (action.fulfilled.match(result)) {
        if (assigningItem.type === "route") { setRouteQuery(current => ({ ...current, page: 1 })); routeList.refresh(); }
        else { setPointQuery(current => ({ ...current, page: 1 })); pointList.refresh(); }
        setAssigningItem(null);
        setAssignTeamId("");
      }
    } finally { setAssignBusy(false); }
  };
  const toggleGroup = (groupId) => setExpandedGroups((current) => {
    const next = new Set(current);
    if (next.has(groupId)) next.delete(groupId); else next.add(groupId);
    return next;
  });

  const routeGroups = groupByTeam(routeList.items);
  const pointGroups = groupByTeam(pointList.items);

  if (!areaId) {
    return (
      <div className="bg-white p-8 text-center rounded-lg shadow border">
        <p className="text-gray-500">{t("geoAreaContextMissing")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">{t("geographyDivisions")}</h2>
        <div className="flex gap-3">
          <button
            onClick={() => openModalFor("routes")}
            disabled={mobileTeams.length === 0}
            title={mobileTeams.length === 0 ? t("geoRegisterMobile") : ""}
            className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            + {t("addRoute")}
          </button>
          <button
            onClick={() => openModalFor("points")}
            disabled={fpTeams.length === 0}
            title={fpTeams.length === 0 ? t("geoRegisterFixedTransit") : ""}
            className="bg-purple-600 text-white px-4 py-2 rounded shadow hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            + {t("addPoint")}
          </button>
        </div>
      </div>

      <section aria-label={t("geoFilters")} className="sticky top-0 z-20 min-w-0 rounded-lg border border-gray-200 bg-white shadow-md">
        <button type="button" aria-expanded={filtersOpen} onClick={() => setFiltersOpen(open => !open)} className="flex w-full items-center justify-between px-3 py-2 text-left text-sm font-semibold text-gray-700 hover:bg-gray-50">
          <span>{t("geoFilters")}</span>
          <span className="text-xs text-blue-700">{filtersOpen ? t("geoHide") : t("geoShow")}</span>
        </button>
        {filtersOpen && <div className="border-t">
          <div className="flex flex-wrap items-center gap-2 px-3 py-2">
            <button type="button" aria-pressed={filterTab === "routes"} onClick={() => setFilterTab("routes")} className={`rounded-md px-3 py-1.5 text-xs font-semibold ${filterTab === "routes" ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-700 hover:bg-blue-100"}`}>
              {t("mobileTeamRoutes")}
            </button>
            <button type="button" aria-pressed={filterTab === "points"} onClick={() => setFilterTab("points")} className={`rounded-md px-3 py-1.5 text-xs font-semibold ${filterTab === "points" ? "bg-purple-600 text-white" : "bg-purple-50 text-purple-700 hover:bg-purple-100"}`}>
              {t("fixedTransitPoints")}
            </button>
          </div>
          {filterTab === "routes" ? (
            <GeographyListControls kind="routes" query={routeQuery} setQuery={setRouteQuery} teams={mobileTeams} total={routeList.total} loading={routeList.loading} />
          ) : (
            <GeographyListControls kind="points" query={pointQuery} setQuery={setPointQuery} teams={fpTeams} total={pointList.total} loading={pointList.loading} />
          )}
        </div>}
      </section>

        <div className="grid min-w-0 grid-cols-1 items-start gap-6 lg:grid-cols-2">

          {/* ── Mobile Team Routes ── */}
          <div className="min-w-0 overflow-hidden rounded-lg border bg-white shadow">
            <div className="bg-blue-50 px-4 py-3 border-b border-blue-100 font-semibold text-blue-800">
              {t("mobileTeamRoutes")}
            </div>
            <div className="max-h-[480px] overflow-y-auto">
            {routeList.loading ? <p className="px-4 py-6 text-center text-sm text-gray-500">{t("loadingGeography")}</p> : routeList.error ? (
              <p className="px-4 py-6 text-center text-sm text-red-600" role="alert">{routeList.error}</p>
            ) : routeGroups.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-gray-400">{t("noRoutes")}</p>
            ) : (
              routeGroups.map(({ team, items }) => (
                <div key={team?._id || "available"} className="border-b last:border-0">
                  <button type="button" aria-expanded={expandedGroups.has(`route-${team?._id || "available"}`)} onClick={() => toggleGroup(`route-${team?._id || "available"}`)} className="flex w-full items-center justify-between gap-2 bg-blue-50/60 px-4 py-2 text-left hover:bg-blue-100/70">
                    <TeamHeading team={team} />
                    <span className="flex shrink-0 items-center gap-2 text-xs font-bold text-blue-700"><span className="rounded-full bg-blue-100 px-2 py-0.5" aria-label={`${items.length} ${t("geoItems")}`}>{items.length}</span>{expandedGroups.has(`route-${team?._id || "available"}`) ? t("geoHide") : t("geoShow")}</span>
                  </button>
                  {expandedGroups.has(`route-${team?._id || "available"}`) && <div className="max-h-[400px] overflow-y-auto"><div className="overflow-x-auto">
                  <table className="min-w-[760px] divide-y divide-gray-100">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">{t("day")}</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">{t("geoSequence")}</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">{t("geoNumber")}</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">{t("geoName")}</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">{t("geoImage")}</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">{t("actions")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {items.map((r) => (
                        <tr key={r._id}>
                          <td className="px-3 py-2 text-sm font-medium text-blue-700">{t("geoDay", { day: r.campaignDay })}</td>
                          <td className="px-3 py-2 text-sm text-gray-500">{r.routeSequence}</td>
                          <td className="px-3 py-2 text-sm font-medium">{r.routeNo}</td>
                          <td className="px-3 py-2 text-sm">{r.routeName}</td>
                          <td className="min-w-36 px-3 py-2"><ImageUploader compact label={`${t("route")} ${r.routeNo}`} currentImage={r.routeImage} uploadImage={(image, fileName) => imageService.uploadGeographyImage("route", r._id, image, fileName)} onUploaded={(image) => { dispatch(setRouteImage({ id: r._id, image })); routeList.refresh(); }} /></td>
                          <td className="px-3 py-2 text-xs whitespace-nowrap"><button onClick={() => setViewingItem({ type: "route", item: r, team })} className="mr-2 text-blue-700">{t("view")}</button><button onClick={() => editRouteItem(r)} className="mr-2 text-blue-600">{t("edit")}</button>{r.team ? <button onClick={() => unassignRouteItem(r)} className="mr-2 text-amber-600">{t("geoUnassign")}</button> : <button onClick={() => openAssign("route", r)} className="mr-2 text-emerald-700">{t("geoAssign")}</button>}<button onClick={() => removeRoute(r)} className="text-red-600">{t("delete")}</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div></div>
                  }
                </div>
              ))
            )}
            </div>
          </div>

          {/* ── Fixed & Transit Points ── */}
          <div className="min-w-0 overflow-hidden rounded-lg border bg-white shadow">
            <div className="bg-purple-50 px-4 py-3 border-b border-purple-100 font-semibold text-purple-800">
              {t("fixedTransitPoints")}
            </div>
            <div className="max-h-[480px] overflow-y-auto">
            {pointList.loading ? <p className="px-4 py-6 text-center text-sm text-gray-500">{t("loadingGeography")}</p> : pointList.error ? (
              <p className="px-4 py-6 text-center text-sm text-red-600" role="alert">{pointList.error}</p>
            ) : pointGroups.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-gray-400">{t("noPoints")}</p>
            ) : (
              pointGroups.map(({ team, items }) => (
                <div key={team?._id || "available"} className="border-b last:border-0">
                  <button type="button" aria-expanded={expandedGroups.has(`point-${team?._id || "available"}`)} onClick={() => toggleGroup(`point-${team?._id || "available"}`)} className="flex w-full items-center justify-between gap-2 bg-purple-50/60 px-4 py-2 text-left hover:bg-purple-100/70">
                    <TeamHeading team={team} />
                    <span className="flex shrink-0 items-center gap-2 text-xs font-bold text-purple-700"><span className="rounded-full bg-purple-100 px-2 py-0.5" aria-label={`${items.length} ${t("geoItems")}`}>{items.length}</span>{expandedGroups.has(`point-${team?._id || "available"}`) ? t("geoHide") : t("geoShow")}</span>
                  </button>
                  {expandedGroups.has(`point-${team?._id || "available"}`) && <div className="max-h-[400px] overflow-y-auto"><div className="overflow-x-auto">
                  <table className="min-w-[760px] divide-y divide-gray-100">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">{t("day")}</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">{t("geoNumber")}</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">{t("geoName")}</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">{t("geoType")}</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">{t("geoImage")}</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">{t("actions")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {items.map((p) => (
                        <tr key={p._id}>
                          <td className="px-3 py-2 text-sm font-medium text-purple-700">{t("geoDay", { day: p.campaignDay })}</td>
                          <td className="px-3 py-2 text-sm font-medium">{p.pointNo}</td>
                          <td className="px-3 py-2 text-sm">{p.pointName}</td>
                          <td className="px-3 py-2 text-sm">
                            <span
                              className={`px-2 py-1 text-xs rounded ${
                                p.pointType === "Fixed"
                                  ? "bg-indigo-100 text-indigo-800"
                                  : "bg-pink-100 text-pink-800"
                              }`}
                            >
                              {t(`teamType${p.pointType}`)}
                            </span>
                          </td>
                          <td className="min-w-36 px-3 py-2"><ImageUploader compact label={`${t("point")} ${p.pointNo}`} currentImage={p.pointImage} uploadImage={(image, fileName) => imageService.uploadGeographyImage("point", p._id, image, fileName)} onUploaded={(image) => { dispatch(setPointImage({ id: p._id, image })); pointList.refresh(); }} /></td>
                          <td className="px-3 py-2 text-xs whitespace-nowrap"><button onClick={() => setViewingItem({ type: "point", item: p, team })} className="mr-2 text-blue-700">{t("view")}</button><button onClick={() => editPointItem(p)} className="mr-2 text-blue-600">{t("edit")}</button>{p.team ? <button onClick={() => unassignPointItem(p)} className="mr-2 text-amber-600">{t("geoUnassign")}</button> : <button onClick={() => openAssign("point", p)} className="mr-2 text-emerald-700">{t("geoAssign")}</button>}<button onClick={() => removePoint(p)} className="text-red-600">{t("delete")}</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div></div>
                  }
                </div>
              ))
            )}
            </div>
          </div>
        </div>

      {/* ── Shared Modal ── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingItem(null); }}
        title={`${editingItem ? t("edit") : t("add")} ${activeTab === "routes" ? t("route") : t("point")}`}
      >
        {activeTab === "routes" ? (
          /* ── Add Route Form ── */
          <form onSubmit={routeForm.handleSubmit(onRouteSubmit)} className="space-y-4">
            <input type="hidden" {...routeForm.register("areaId")} />

            {/* Mobile Team selector */}
            <div>
              <label className="block text-sm font-medium mb-1">
                {t("teamTypeMobile")} <span className="text-red-500">*</span>
              </label>
              <select
                {...routeForm.register("team")}
                className="w-full px-3 py-2 border rounded-md bg-white text-sm"
              >
                <option value="">{t("geoSelectMobile")}</option>
                {mobileTeams.map((team) => (
                  <option key={team._id} value={team._id}>
                    {t("team")} {team.teamNo}{team.leader?.name ? ` — ${team.leader.name}` : ""}
                  </option>
                ))}
              </select>
              <FormError errors={routeForm.formState.errors} field="team" />
            </div>

            {/* Campaign Day */}
            <div>
              <label className="block text-sm font-medium mb-1">
                {t("campaignDay")} <span className="text-red-500">*</span>
              </label>
              <select
                {...routeForm.register("campaignDay")}
                className="w-full px-3 py-2 border rounded-md bg-white text-sm"
              >
                <option value="">{t("geoSelectDay")}</option>
                <option value="1">{t("geoDay", { day: 1 })}</option>
                <option value="2">{t("geoDay", { day: 2 })}</option>
                <option value="3">{t("geoDay", { day: 3 })}</option>
              </select>
              <FormError errors={routeForm.formState.errors} field="campaignDay" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t("geoSequence")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder={t("geoExampleSequence")}
                  {...routeForm.register("routeSequence")}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                />
                <FormError errors={routeForm.formState.errors} field="routeSequence" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t("geoRouteNumber")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...routeForm.register("routeNo")}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                />
                <FormError errors={routeForm.formState.errors} field="routeNo" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {t("geoRouteName")} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...routeForm.register("routeName")}
                className="w-full px-3 py-2 border rounded-md text-sm"
              />
              <FormError errors={routeForm.formState.errors} field="routeName" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">{t("geoDescription")}</label>
              <textarea
                {...routeForm.register("routeDescription")}
                className="w-full px-3 py-2 border rounded-md text-sm"
                rows="2"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm font-medium"
            >
              {editingItem ? t("geoUpdateRoute") : t("geoSaveRoute")}
            </button>
          </form>
        ) : (
          /* ── Add Point Form ── */
          <form onSubmit={pointForm.handleSubmit(onPointSubmit)} className="space-y-4">
            <input type="hidden" {...pointForm.register("areaId")} />

            {/* Fixed / Transit Team selector */}
            <div>
              <label className="block text-sm font-medium mb-1">
                {t("geoFixedTransitTeam")} <span className="text-red-500">*</span>
              </label>
              <select
                {...pointForm.register("team")}
                className="w-full px-3 py-2 border rounded-md bg-white text-sm"
              >
                <option value="">{t("geoSelectTeam")}</option>
                {fpTeams.map((team) => (
                  <option key={team._id} value={team._id}>
                    {t(`teamType${team.teamType}`)} — {t("team")} {team.teamNo}{team.leader?.name ? ` | ${team.leader.name}` : ""}
                  </option>
                ))}
              </select>
              <FormError errors={pointForm.formState.errors} field="team" />
            </div>

            {/* Campaign Day */}
            <div>
              <label className="block text-sm font-medium mb-1">
                {t("campaignDay")} <span className="text-red-500">*</span>
              </label>
              <select
                {...pointForm.register("campaignDay")}
                className="w-full px-3 py-2 border rounded-md bg-white text-sm"
              >
                <option value="">{t("geoSelectDay")}</option>
                {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                  <option key={d} value={d}>{t("geoDay", { day: d })}</option>
                ))}
              </select>
              <FormError errors={pointForm.formState.errors} field="campaignDay" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t("geoPointNumber")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...pointForm.register("pointNo")}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                />
                <FormError errors={pointForm.formState.errors} field="pointNo" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t("geoType")} <span className="text-red-500">*</span>
                </label>
                <select
                  {...pointForm.register("pointType")}
                  className="w-full px-3 py-2 border rounded-md bg-white text-sm"
                >
                  <option value="Fixed">{t("teamTypeFixed")}</option>
                  <option value="Transit">{t("teamTypeTransit")}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {t("geoPointName")} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...pointForm.register("pointName")}
                className="w-full px-3 py-2 border rounded-md text-sm"
              />
              <FormError errors={pointForm.formState.errors} field="pointName" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">{t("geoDescription")}</label>
              <textarea
                {...pointForm.register("pointDescription")}
                className="w-full px-3 py-2 border rounded-md text-sm"
                rows="2"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 text-sm font-medium"
            >
              {editingItem ? t("geoUpdatePoint") : t("geoSavePoint")}
            </button>
          </form>
        )}
      </Modal>

      <Modal
        isOpen={!!assigningItem}
        onClose={() => { if (!assignBusy) setAssigningItem(null); }}
        title={t("geoAssignTitle")}
      >
        {assigningItem && (
          <form onSubmit={submitAssign} className="space-y-4 text-sm">
            <p className="text-gray-700">{assigningItem.type === "route" ? assigningItem.item.routeName : assigningItem.item.pointName}</p>
            <label className="block font-medium text-gray-700" htmlFor="geography-assign-team">{t("geoChooseTeam")}</label>
            <select id="geography-assign-team" value={assignTeamId} onChange={event => setAssignTeamId(event.target.value)} required className="w-full rounded-md border border-gray-300 bg-white px-3 py-2">
              <option value="">{t("geoChooseTeam")}</option>
              {(assigningItem.type === "route" ? mobileTeams : fpTeams.filter(team => team.teamType === assigningItem.item.pointType))
                .map(team => <option key={team._id} value={team._id}>{t(`teamType${team.teamType}`)} {team.teamNo}{team.leader?.name ? ` — ${team.leader.name}` : ""}</option>)}
            </select>
            <div className="flex justify-end gap-2 border-t pt-4">
              <button type="button" onClick={() => setAssigningItem(null)} disabled={assignBusy} className="rounded border px-4 py-2 disabled:opacity-50">{t("cancel")}</button>
              <button type="submit" disabled={!assignTeamId || assignBusy} className="rounded bg-emerald-700 px-4 py-2 font-medium text-white disabled:opacity-50">{t("geoAssign")}</button>
            </div>
          </form>
        )}
      </Modal>

      {/* Read-only Geography Details Modal */}
      <Modal
        isOpen={!!viewingItem}
        onClose={() => setViewingItem(null)}
        title={t("geoViewTitle", { type: viewingItem?.type === "route" ? t("route") : t("point") })}
      >
        {viewingItem && (
          <div className="space-y-4 text-sm">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><dt className="text-xs font-semibold uppercase text-gray-500">{t("team")}</dt><dd className="mt-1 text-gray-900">{viewingItem.team ? t("geoTeamTitle", { type: t(`teamType${viewingItem.team.teamType}`), number: viewingItem.team.teamNo }) : t("geoUnassigned")}</dd></div>
              <div><dt className="text-xs font-semibold uppercase text-gray-500">{t("leader")}</dt><dd className="mt-1 text-gray-900">{viewingItem.team?.leader?.name || "—"}</dd></div>
              <div><dt className="text-xs font-semibold uppercase text-gray-500">{t("campaignDay")}</dt><dd className="mt-1 text-gray-900">{viewingItem.item.campaignDay ? t("geoDay", { day: viewingItem.item.campaignDay }) : "—"}</dd></div>
              <div><dt className="text-xs font-semibold uppercase text-gray-500">{t("geoNumber")}</dt><dd className="mt-1 text-gray-900">{viewingItem.item.routeNo || viewingItem.item.pointNo || "—"}</dd></div>
              <div><dt className="text-xs font-semibold uppercase text-gray-500">{t("geoName")}</dt><dd className="mt-1 text-gray-900">{viewingItem.item.routeName || viewingItem.item.pointName || "—"}</dd></div>
              {viewingItem.type === "route" ? (
                <div><dt className="text-xs font-semibold uppercase text-gray-500">{t("geoRouteSequence")}</dt><dd className="mt-1 text-gray-900">{viewingItem.item.routeSequence || "—"}</dd></div>
              ) : (
              <div><dt className="text-xs font-semibold uppercase text-gray-500">{t("geoPointType")}</dt><dd className="mt-1 text-gray-900">{viewingItem.item.pointType ? t(`teamType${viewingItem.item.pointType}`) : "—"}</dd></div>
              )}
            </dl>
            <div>
              <div className="text-xs font-semibold uppercase text-gray-500">{t("geoDescription")}</div>
              <div className="mt-1 rounded-md border border-gray-200 bg-white p-3 text-gray-700 whitespace-pre-wrap">{viewingItem.item.routeDescription || viewingItem.item.pointDescription || t("geoNoDescription")}</div>
            </div>
            <div className="flex justify-end border-t pt-4">
              <button type="button" onClick={() => setViewingItem(null)} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50 text-sm">{t("geoClose")}</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default GeographyManagementPage;
