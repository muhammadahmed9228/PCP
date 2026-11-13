import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import api from "../../services/api";
import FieldDayConfirmation from "./FieldDayConfirmation";

const button = "rounded border px-3 py-2 text-sm font-medium disabled:opacity-40";
const primary = button + " bg-blue-600 text-white";
const control = "mt-1 block w-full rounded border bg-white px-3 py-2";

export default function ManageFieldDayPage() {
  const { t } = useTranslation();
  const { areaId, error } = useSelector(state => state.context);
  return areaId ? <FieldDayManager key={areaId} areaId={areaId} /> : <p role="status">{error || t("fieldDayLoading")}</p>;
}

function FieldDayManager({ areaId }) {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [day, setDay] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [confirmation, setConfirmation] = useState(null);
  const [filters, setFilters] = useState({ search: "", type: "", status: "", access: "", sort: "teamNo", order: "asc", limit: 10, page: 1 });
  useEffect(() => {
    const controller = new AbortController();
    api.get("/field-days/" + areaId, { signal: controller.signal }).then(response => {
      setData(response.data.data); setError("");
    }).catch(e => { if (e.code !== "ERR_CANCELED") setError(e.response?.data?.message || t("fieldDayLoadFailed")); });
    return () => controller.abort();
  }, [areaId, t]);
  const refresh = async () => {
    setBusy(true);
    try { setData((await api.get("/field-days/" + areaId)).data.data); setSelectedIds([]); setError(""); }
    catch (e) { setError(e.response?.data?.message || t("fieldDayLoadFailed")); }
    finally { setBusy(false); }
  };
  const change = async () => {
    if (busy || !confirmation) return;
    setBusy(true);
    const { action, day: targetDay, revision, rows } = confirmation;
    try {
      const next = (await api.patch("/field-days/" + areaId, { action, day: targetDay, revision, teamIds: rows.map(row => row.teamId) })).data.data;
      setData(next); setSelectedIds([]); setError("");
    } catch (e) { setError(e.response?.data?.message || t("fieldDayLoadFailed")); }
    finally { setBusy(false); setConfirmation(null); }
  };
  const update = (key, value) => {
    setFilters(current => ({ ...current, [key]: value, page: key === "page" ? value : 1 }));
    setSelectedIds([]);
  };
  const rows = data?.days.find(item => item.day === day)?.rows || [];
  const filtered = rows.filter(row =>
    (!filters.type || row.teamType === filters.type) && (!filters.status || row.status === filters.status) &&
    (!filters.access || row.dayStatus === filters.access) &&
    (row.teamNo + " " + (row.assignment || "")).toLocaleLowerCase().includes(filters.search.trim().toLocaleLowerCase())
  ).sort((a, b) => {
    const cmp = String(a[filters.sort] ?? "").localeCompare(String(b[filters.sort] ?? ""), undefined, { numeric: true });
    return (cmp || String(a.teamId).localeCompare(String(b.teamId))) * (filters.order === "asc" ? 1 : -1);
  });
  const pages = Math.max(1, Math.ceil(filtered.length / filters.limit));
  const page = Math.min(filters.page, pages);
  const visible = filtered.slice((page - 1) * filters.limit, page * filters.limit);
  const selected = visible.filter(row => selectedIds.includes(row.teamId));
  const selectable = visible.filter(row => row.canEnable || row.canClose);
  const active = data?.campaignStatus === "Active";
  const locked = busy || !!confirmation;
  const canAct = (action, items) => active && items.length > 0 && items.every(row => action === "enable" ? row.canEnable : row.canClose);
  const confirm = (action, items) => {
    if (!locked && canAct(action, items)) setConfirmation({ action, day, revision: data.revision, rows: items });
  };
  const toggle = id => setSelectedIds(ids => ids.includes(id) ? ids.filter(value => value !== id) : [...ids, id]);
  const statusLabel = value => t("fieldDayStatus" + value.replaceAll(" ", ""));
  const accessLabel = value => t("fieldDayAccess" + value.replaceAll(" ", ""));
  const filterOptions = [
    ["type", "teamType", ["Mobile", "Fixed", "Transit"].map(type => [type, t("teamType" + type)])],
    ["status", "status", ["Not started", "Draft", "Finalized"].map(status => [status, statusLabel(status)])],
    ["access", "fieldDayAccess", ["Enabled", "Closed", "Not enabled"].map(status => [status, accessLabel(status)])],
    ["sort", "fieldDaySort", [["teamNo", t("team")], ["teamType", t("teamType")], ["status", t("status")], ["dayStatus", t("fieldDayAccess")]]],
    ["order", "fieldDayOrder", [["asc", t("fieldDayAscending")], ["desc", t("fieldDayDescending")]]]
  ];
  return <div className="space-y-6">
    <div><h2 className="text-2xl font-bold text-gray-800">{t("manageFieldDay")}</h2><p className="mt-2 text-sm text-gray-600">{t("fieldDayDescription")}</p></div>
    {error && <p role="alert" className="rounded border border-red-200 bg-red-50 p-3 text-red-800">{error}</p>}
    {!data ? <div><p>{t("fieldDayLoading")}</p>{error && <button type="button" onClick={refresh} disabled={busy} className={button}>{t("fieldDayRefresh")}</button>}</div> : <>
      <section className="space-y-4 rounded-lg border bg-white p-4">
        {!active && <p className="text-sm text-amber-800">{t("fieldDayActiveOnly")}</p>}
        <div className="flex flex-wrap items-end gap-3">
          <label className="text-sm font-medium">{t("campaignDay")}<select value={day} disabled={locked} onChange={e => { setDay(Number(e.target.value)); setSelectedIds([]); setFilters(f => ({ ...f, page: 1 })); }} className={control}>{[1,2,3,4,5,6,7].map(d => <option key={d} value={d}>{t("fieldDayOpened", { day: d })}</option>)}</select></label>
          <button type="button" onClick={refresh} disabled={locked} className={button}>{t("fieldDayRefresh")}</button>
        </div>
        <p className="text-sm text-gray-600">{t("fieldDayRequirements")}</p>
        <details><summary className="cursor-pointer text-sm font-semibold text-blue-700">{t("fieldDayFilters")}</summary>
          <fieldset disabled={locked} className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <label className="text-sm">{t("fieldDaySearch")}<input type="search" value={filters.search} maxLength={100} onChange={e => update("search", e.target.value)} className={control} /></label>
            {filterOptions.map(([key, label, options]) => <label key={key} className="text-sm">{t(label)}<select value={filters[key]} onChange={e => update(key, e.target.value)} className={control}>{["type", "status", "access"].includes(key) && <option value="">{t("fieldDayAll")}</option>}{options.map(([value, name]) => <option key={value} value={value}>{name}</option>)}</select></label>)}
          </fieldset>
        </details>
      </section>
      <section className="overflow-hidden rounded-lg border bg-white">
        <div className="flex flex-wrap items-center gap-3 border-b p-4">
          <span className="text-sm" aria-live="polite">{t("fieldDaySelected", { count: selected.length })}</span>
          <button type="button" onClick={() => confirm("enable", selected)} disabled={locked || !canAct("enable", selected)} className={primary}>{t("fieldDayBulkEnable")}</button>
          <button type="button" onClick={() => confirm("close", selected)} disabled={locked || !canAct("close", selected)} className={button}>{t("fieldDayBulkClose")}</button>
          <p className="w-full text-xs text-gray-600">{t("fieldDaySelectionHint")}</p>
        </div>
        <div className="overflow-x-auto"><table className="w-full text-start text-sm"><thead className="border-b bg-gray-50"><tr>
          <th className="p-3"><input type="checkbox" aria-label={t("fieldDaySelectPage")} disabled={locked || !active || !selectable.length} checked={selectable.length > 0 && selectable.every(row => selectedIds.includes(row.teamId))} onChange={e => setSelectedIds(e.target.checked ? selectable.map(row => row.teamId) : [])} /></th>
          {["team", "teamType", "assignment", "fieldDayPlanning", "status", "fieldDayAccess", "fieldDayActions"].map(key => <th key={key} className="p-3">{t(key)}</th>)}</tr></thead><tbody>
          {visible.map(row => <tr key={row.teamId} className="border-b" data-team-id={row.teamId}>
            <td className="p-3"><input type="checkbox" aria-label={t("fieldDaySelectTeam", { type: t("teamType" + row.teamType), team: row.teamNo })} disabled={locked || !active || (!row.canEnable && !row.canClose)} checked={selectedIds.includes(row.teamId)} onChange={() => toggle(row.teamId)} /></td>
            <td className="p-3 font-medium">{row.teamNo}</td><td className="p-3">{t("teamType" + row.teamType)}</td>
            <td className="p-3">{row.assignmentCount === 1 ? row.assignment : t(row.assignmentCount ? "fieldDayMultiple" : "fieldDayMissing")}</td>
            <td className="p-3">{t(row.planningReady ? "fieldDayReady" : "fieldDayPending")}</td><td className="p-3">{statusLabel(row.status)}</td>
            <td className="p-3"><span className={row.dayStatus === "Enabled" ? "font-semibold text-blue-700" : "text-gray-600"}>{accessLabel(row.dayStatus)}</span>{row.enabledDay != null && row.enabledDay !== day && <p className="mt-1 text-xs text-gray-500">{t("fieldDayEnabled", { day: row.enabledDay })}</p>}{row.enabledDay == null && row.lastDay != null && row.dayStatus === "Not enabled" && <p className="mt-1 text-xs text-gray-500">{t("fieldDayNext", { day: row.lastDay + 1 })}</p>}</td>
            <td className="p-3"><div className="flex gap-2 whitespace-nowrap"><button type="button" onClick={() => confirm("enable", [row])} disabled={locked || !canAct("enable", [row])} className={primary}>{t("fieldDayEnable")}</button><button type="button" onClick={() => confirm("close", [row])} disabled={locked || !canAct("close", [row])} className={button}>{t("fieldDayClose")}</button></div></td>
          </tr>)}
          {!visible.length && <tr><td colSpan={8} className="p-4 text-gray-500">{t("fieldDayNoMatches")}</td></tr>}
        </tbody></table></div>
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
          <span>{t("fieldDayTotal", { count: filtered.length })}</span>
          <label>{t("fieldDayPageSize")} <select disabled={locked} value={filters.limit} onChange={e => update("limit", Number(e.target.value))} className="rounded border p-2">{[10,20,50,100].map(limit => <option key={limit} value={limit}>{limit}</option>)}</select></label>
          <div className="flex items-center gap-3"><button type="button" disabled={locked || page === 1} onClick={() => update("page", page - 1)} className={button}>{t("fieldDayPrevious")}</button><span>{t("fieldDayPage", { page, pages })}</span><button type="button" disabled={locked || page === pages} onClick={() => update("page", page + 1)} className={button}>{t("fieldDayNextPage")}</button></div>
        </div>
      </section>
      <details className="rounded-lg border bg-white p-4"><summary className="cursor-pointer font-semibold">{t("fieldDayAudit")}</summary><ul className="mt-3 space-y-2 text-sm">{data.history.map((event, index) => <li key={index}>{t(event.action === "enable" ? "fieldDayEnabled" : "fieldDayClosed", { day: event.day })} · {event.teams?.length ? t("fieldDaySelected", { count: event.teams.length }) : t("fieldDayLegacyHistory")} · {new Date(event.at).toLocaleString()}</li>)}</ul></details>
    </>}
    <FieldDayConfirmation request={confirmation} busy={busy} onCancel={() => setConfirmation(null)} onConfirm={change} />
  </div>;
}
