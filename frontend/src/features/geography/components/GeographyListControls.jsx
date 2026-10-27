import { useTranslation } from "react-i18next";

const GeographyListControls = ({ kind, query, setQuery, teams, total, loading }) => {
  const { t } = useTranslation();
  const isRoute = kind === "routes";
  const maxDay = isRoute ? 3 : 7;
  const pages = Math.max(1, Math.ceil(total / query.limit));
  const update = (field, value) => setQuery(current => ({
    ...current,
    [field]: value,
    page: 1,
    ...(field === "filter" && value === "available" ? { teamId: "" } : {})
  }));

  return (
    <div className="space-y-3 border-b bg-gray-50/70 p-3 text-xs">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
        <label className="col-span-2 sm:col-span-1">
          <span className="mb-1 block text-gray-600">{t("geoSearch")}</span>
          <input type="search" maxLength={100} value={query.search} onChange={event => update("search", event.target.value)} placeholder={t("geoSearchHint")} className="w-full rounded border bg-white px-2 py-1.5" />
        </label>
        <label>
          <span className="mb-1 block text-gray-600">{t("geoAssignmentFilter")}</span>
          <select value={query.filter} onChange={event => update("filter", event.target.value)} className="w-full rounded border bg-white px-2 py-1.5">
            <option value="all">{t("geoAll")}</option><option value="assigned">{t("geoAssigned")}</option><option value="available">{t("geoAvailable")}</option>
          </select>
        </label>
        <label>
          <span className="mb-1 block text-gray-600">{t("geoTeamFilter")}</span>
          <select value={query.teamId} disabled={query.filter === "available"} onChange={event => update("teamId", event.target.value)} className="w-full rounded border bg-white px-2 py-1.5 disabled:opacity-50">
            <option value="">{t("geoAllTeams")}</option>
            {teams.map(team => <option key={team._id} value={team._id}>{t(`teamType${team.teamType}`)} {team.teamNo}</option>)}
          </select>
        </label>
        <label>
          <span className="mb-1 block text-gray-600">{t("campaignDay")}</span>
          <select value={query.day} onChange={event => update("day", event.target.value)} className="w-full rounded border bg-white px-2 py-1.5">
            <option value="">{t("geoAllDays")}</option>
            {Array.from({ length: maxDay }, (_, index) => <option key={index + 1} value={index + 1}>{t("geoDay", { day: index + 1 })}</option>)}
          </select>
        </label>
        {!isRoute && <label>
          <span className="mb-1 block text-gray-600">{t("type")}</span>
          <select value={query.pointType} onChange={event => update("pointType", event.target.value)} className="w-full rounded border bg-white px-2 py-1.5">
            <option value="">{t("geoAllTypes")}</option><option value="Fixed">{t("teamTypeFixed")}</option><option value="Transit">{t("teamTypeTransit")}</option>
          </select>
        </label>}
        <label>
          <span className="mb-1 block text-gray-600">{t("geoSort")}</span>
          <select value={query.sort} onChange={event => update("sort", event.target.value)} className="w-full rounded border bg-white px-2 py-1.5">
            <option value="campaignDay">{t("campaignDay")}</option>
            <option value={isRoute ? "routeNo" : "pointNo"}>{t("geoNumber")}</option>
            <option value={isRoute ? "routeName" : "pointName"}>{t("geoName")}</option>
            {isRoute && <option value="routeSequence">{t("geoSequence")}</option>}
            {!isRoute && <option value="pointType">{t("type")}</option>}
            <option value="createdAt">{t("geoCreated")}</option>
          </select>
        </label>
        <label>
          <span className="mb-1 block text-gray-600">{t("geoOrder")}</span>
          <select value={query.order} onChange={event => update("order", event.target.value)} className="w-full rounded border bg-white px-2 py-1.5">
            <option value="asc">{t("geoAscending")}</option><option value="desc">{t("geoDescending")}</option>
          </select>
        </label>
        <label>
          <span className="mb-1 block text-gray-600">{t("geoPerPage")}</span>
          <select value={query.limit} onChange={event => update("limit", Number(event.target.value))} className="w-full rounded border bg-white px-2 py-1.5">
            {[10, 20, 50, 100].map(value => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-2 text-gray-600">
        <span>{t("geoTotal")}: {total}</span>
        <div className="flex items-center gap-2">
          <button type="button" disabled={loading || query.page <= 1} onClick={() => setQuery(current => ({ ...current, page: current.page - 1 }))} className="rounded border bg-white px-2 py-1 disabled:opacity-40">{t("geoPrevious")}</button>
          <span>{t("geoPage")} {query.page} / {pages}</span>
          <button type="button" disabled={loading || query.page >= pages} onClick={() => setQuery(current => ({ ...current, page: current.page + 1 }))} className="rounded border bg-white px-2 py-1 disabled:opacity-40">{t("geoNext")}</button>
        </div>
      </div>
    </div>
  );
};

export default GeographyListControls;
