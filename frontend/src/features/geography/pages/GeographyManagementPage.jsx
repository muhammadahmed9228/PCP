import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { fetchGeography, addRoute, addPoint, clearGeography } from "../store/geographySlice";
import { fetchTeams } from "../../teams/store/teamSlice";
import { routeSchema, pointSchema } from "../validations/geography.schema";
import Modal from "../../../components/shared/Modal";

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
const TeamHeading = ({ team }) => (
  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
    <span className="text-xs font-semibold text-gray-700">
      {team?.teamType} — Team {team?.teamNo}
    </span>
    {team?.leader?.name && (
      <span className="text-xs text-gray-500">Leader: {team.leader.name}</span>
    )}
  </div>
);

const FormError = ({ errors, field }) =>
  errors[field] ? (
    <p className="text-red-500 text-xs mt-1">{errors[field].message}</p>
  ) : null;

// ---------- component ----------
const GeographyManagementPage = () => {
  const dispatch = useDispatch();
  const { routes, points, loading } = useSelector((state) => state.geography);
  const { areaId } = useSelector((state) => state.context);
  const { teams } = useSelector((state) => state.teams);

  const [activeTab, setActiveTab] = useState("routes");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const routeForm = useForm({ resolver: zodResolver(routeSchema) });
  const pointForm = useForm({ resolver: zodResolver(pointSchema) });

  useEffect(() => {
    dispatch(fetchTeams());
  }, [dispatch]);

  useEffect(() => {
    if (areaId) {
      dispatch(fetchGeography(areaId));
    } else {
      dispatch(clearGeography());
    }
  }, [areaId, dispatch]);

  const mobileTeams = teams.filter((t) => t.teamType === "Mobile");
  const fpTeams     = teams.filter((t) => t.teamType === "Fixed" || t.teamType === "Transit");

  const openModalFor = (type) => {
    setActiveTab(type);
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
    const result = await dispatch(addRoute(data));
    if (addRoute.fulfilled.match(result)) {
      setIsModalOpen(false);
      routeForm.reset();
    }
  };

  const onPointSubmit = async (data) => {
    const result = await dispatch(addPoint(data));
    if (addPoint.fulfilled.match(result)) {
      setIsModalOpen(false);
      pointForm.reset();
    }
  };

  const routeGroups = groupByTeam(routes);
  const pointGroups = groupByTeam(points);

  if (!areaId) {
    return (
      <div className="bg-white p-8 text-center rounded-lg shadow border">
        <p className="text-gray-500">Area context not available. Please ensure you are logged in correctly.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Geography Divisions</h2>
        <div className="flex gap-3">
          <button
            onClick={() => openModalFor("routes")}
            disabled={mobileTeams.length === 0}
            title={mobileTeams.length === 0 ? "Register a Mobile team first" : ""}
            className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            + Add Route
          </button>
          <button
            onClick={() => openModalFor("points")}
            disabled={fpTeams.length === 0}
            title={fpTeams.length === 0 ? "Register a Fixed/Transit team first" : ""}
            className="bg-purple-600 text-white px-4 py-2 rounded shadow hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            + Add Point
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading geography…</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ── Mobile Team Routes ── */}
          <div className="bg-white shadow rounded-lg overflow-hidden border">
            <div className="bg-blue-50 px-4 py-3 border-b border-blue-100 font-semibold text-blue-800">
              Mobile Team Routes
            </div>

            {routeGroups.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-gray-400">No routes added yet.</p>
            ) : (
              routeGroups.map(({ team, items }) => (
                <div key={team?._id || "unknown"} className="border-b last:border-0">
                  <div className="bg-blue-50/60 px-4 py-2">
                    <TeamHeading team={team} />
                  </div>
                  <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Day</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Seq</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">No</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Name</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {items.map((r) => (
                        <tr key={r._id}>
                          <td className="px-3 py-2 text-sm font-medium text-blue-700">Day {r.campaignDay}</td>
                          <td className="px-3 py-2 text-sm text-gray-500">{r.routeSequence}</td>
                          <td className="px-3 py-2 text-sm font-medium">{r.routeNo}</td>
                          <td className="px-3 py-2 text-sm">{r.routeName}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))
            )}
          </div>

          {/* ── Fixed & Transit Points ── */}
          <div className="bg-white shadow rounded-lg overflow-hidden border">
            <div className="bg-purple-50 px-4 py-3 border-b border-purple-100 font-semibold text-purple-800">
              Fixed &amp; Transit Points
            </div>

            {pointGroups.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-gray-400">No points added yet.</p>
            ) : (
              pointGroups.map(({ team, items }) => (
                <div key={team?._id || "unknown"} className="border-b last:border-0">
                  <div className="bg-purple-50/60 px-4 py-2">
                    <TeamHeading team={team} />
                  </div>
                  <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Day</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">No</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Name</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Type</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {items.map((p) => (
                        <tr key={p._id}>
                          <td className="px-3 py-2 text-sm font-medium text-purple-700">Day {p.campaignDay}</td>
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
                              {p.pointType}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── Shared Modal ── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Add ${activeTab === "routes" ? "Route" : "Point"}`}
      >
        {activeTab === "routes" ? (
          /* ── Add Route Form ── */
          <form onSubmit={routeForm.handleSubmit(onRouteSubmit)} className="space-y-4">
            <input type="hidden" {...routeForm.register("areaId")} />

            {/* Mobile Team selector */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Mobile Team <span className="text-red-500">*</span>
              </label>
              <select
                {...routeForm.register("team")}
                className="w-full px-3 py-2 border rounded-md bg-white text-sm"
              >
                <option value="">— Select Mobile Team —</option>
                {mobileTeams.map((t) => (
                  <option key={t._id} value={t._id}>
                    Team {t.teamNo}{t.leader?.name ? ` — ${t.leader.name}` : ""}
                  </option>
                ))}
              </select>
              <FormError errors={routeForm.formState.errors} field="team" />
            </div>

            {/* Campaign Day */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Campaign Day <span className="text-red-500">*</span>
              </label>
              <select
                {...routeForm.register("campaignDay")}
                className="w-full px-3 py-2 border rounded-md bg-white text-sm"
              >
                <option value="">— Select Day —</option>
                <option value="1">Day 1</option>
                <option value="2">Day 2</option>
                <option value="3">Day 3</option>
              </select>
              <FormError errors={routeForm.formState.errors} field="campaignDay" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Sequence <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1, 1A"
                  {...routeForm.register("routeSequence")}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                />
                <FormError errors={routeForm.formState.errors} field="routeSequence" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Route Number <span className="text-red-500">*</span>
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
                Route Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...routeForm.register("routeName")}
                className="w-full px-3 py-2 border rounded-md text-sm"
              />
              <FormError errors={routeForm.formState.errors} field="routeName" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
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
              Save Route
            </button>
          </form>
        ) : (
          /* ── Add Point Form ── */
          <form onSubmit={pointForm.handleSubmit(onPointSubmit)} className="space-y-4">
            <input type="hidden" {...pointForm.register("areaId")} />

            {/* Fixed / Transit Team selector */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Fixed / Transit Team <span className="text-red-500">*</span>
              </label>
              <select
                {...pointForm.register("team")}
                className="w-full px-3 py-2 border rounded-md bg-white text-sm"
              >
                <option value="">— Select Team —</option>
                {fpTeams.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.teamType} — Team {t.teamNo}{t.leader?.name ? ` | ${t.leader.name}` : ""}
                  </option>
                ))}
              </select>
              <FormError errors={pointForm.formState.errors} field="team" />
            </div>

            {/* Campaign Day */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Campaign Day <span className="text-red-500">*</span>
              </label>
              <select
                {...pointForm.register("campaignDay")}
                className="w-full px-3 py-2 border rounded-md bg-white text-sm"
              >
                <option value="">— Select Day —</option>
                {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                  <option key={d} value={d}>Day {d}</option>
                ))}
              </select>
              <FormError errors={pointForm.formState.errors} field="campaignDay" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Point Number <span className="text-red-500">*</span>
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
                  Type <span className="text-red-500">*</span>
                </label>
                <select
                  {...pointForm.register("pointType")}
                  className="w-full px-3 py-2 border rounded-md bg-white text-sm"
                >
                  <option value="Fixed">Fixed</option>
                  <option value="Transit">Transit</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Point Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...pointForm.register("pointName")}
                className="w-full px-3 py-2 border rounded-md text-sm"
              />
              <FormError errors={pointForm.formState.errors} field="pointName" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
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
              Save Point
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default GeographyManagementPage;