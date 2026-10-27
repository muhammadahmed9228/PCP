import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const ServerListControls = ({ query, setQuery, total, loading, filters = [], sorts, label }) => {
  const { t } = useTranslation();
  const labelText = t(label, { defaultValue: label });
  const [open, setOpen] = useState(false);
  const pages = Math.max(1, Math.ceil(total / query.limit));
  useEffect(() => {
    if (!loading && query.page > pages) setQuery(current => ({ ...current, page: pages }));
  }, [loading, pages, query.page, setQuery]);
  const update = (field, value) => setQuery(current => ({ ...current, [field]: value, page: 1 }));
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 text-sm shadow-sm">
      <button type="button" aria-expanded={open} onClick={() => setOpen(value => !value)} className="rounded-md border border-gray-300 px-3 py-2 font-medium text-gray-700 hover:bg-gray-50">
        {t(open ? "listHideFilters" : "listShowFilters")}
      </button>
      {open && <div className="mt-3 grid gap-3 border-t pt-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-gray-700">{t("listSearch")}
          <input type="search" aria-label={t("listSearch")} maxLength={100} value={query.search} onChange={event => update("search", event.target.value)} className="mt-1 block w-full rounded border border-gray-300 px-3 py-2" placeholder={t("listSearchPlaceholder", { label: labelText })} />
        </label>
        {filters.map(filter => <label key={filter.key} className="text-gray-700">{filter.label}
          <select aria-label={filter.label} value={query[filter.key]} onChange={event => update(filter.key, event.target.value)} className="mt-1 block w-full rounded border border-gray-300 bg-white px-3 py-2">
            {filter.options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>)}
        <label className="text-gray-700">{t("listSort")}
          <select aria-label={t("listSort")} value={query.sort} onChange={event => update("sort", event.target.value)} className="mt-1 block w-full rounded border border-gray-300 bg-white px-3 py-2">
            {sorts.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        <label className="text-gray-700">{t("listOrder")}
          <select aria-label={t("listOrder")} value={query.order} onChange={event => update("order", event.target.value)} className="mt-1 block w-full rounded border border-gray-300 bg-white px-3 py-2">
            <option value="desc">{t("listDescending")}</option><option value="asc">{t("listAscending")}</option>
          </select>
        </label>
        <label className="text-gray-700">{t("listRows")}
          <select aria-label={t("listRows")} value={query.limit} onChange={event => update("limit", Number(event.target.value))} className="mt-1 block w-full rounded border border-gray-300 bg-white px-3 py-2">
            {[10, 20, 50, 100].map(value => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>
      </div>}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-gray-600">
        <span aria-live="polite">{loading ? t("listLoading") : t("listFound", { count: total, label: labelText })}</span>
        <div className="flex items-center gap-2">
          <button type="button" disabled={loading || query.page <= 1} onClick={() => setQuery(current => ({ ...current, page: current.page - 1 }))} className="rounded border px-3 py-1.5 disabled:opacity-40">{t("listPrevious")}</button>
          <span>{t("listPage", { page: query.page, pages })}</span>
          <button type="button" disabled={loading || query.page >= pages} onClick={() => setQuery(current => ({ ...current, page: current.page + 1 }))} className="rounded border px-3 py-1.5 disabled:opacity-40">{t("listNext")}</button>
        </div>
      </div>
    </div>
  );
};

export default ServerListControls;
