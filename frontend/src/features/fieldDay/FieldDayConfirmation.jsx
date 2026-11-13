import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

export default function FieldDayConfirmation({ request, busy, onCancel, onConfirm }) {
  const { t } = useTranslation();
  const dialog = useRef(null);
  useEffect(() => {
    if (request && !dialog.current.open) dialog.current.showModal();
    if (!request && dialog.current.open) dialog.current.close();
  }, [request]);
  return <dialog ref={dialog} aria-labelledby="field-day-confirm-title" onCancel={event => { event.preventDefault(); if (!busy) onCancel(); }}
    className="fixed inset-0 m-auto max-h-[85dvh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-lg border border-gray-200 bg-white p-6 text-gray-900 shadow-xl backdrop:bg-black/40">
    {request && <>
      <h3 id="field-day-confirm-title" className="text-lg font-semibold">{t(request.action === "enable" ? "fieldDayEnable" : "fieldDayClose")} · {t("fieldDayOpened", { day: request.day })}</h3>
      <p className="mt-3 text-sm text-gray-600">{t(request.action === "enable" ? "fieldDayEnableConfirm" : "fieldDayCloseConfirm", { day: request.day, count: request.rows.length })}</p>
      <ul className="my-4 max-h-52 space-y-2 overflow-y-auto rounded border p-3 text-sm">{request.rows.map(row => <li key={row.teamId}>{t(`teamType${row.teamType}`)} · {t("team")} {row.teamNo}</li>)}</ul>
      <p className="text-xs text-gray-600">{t("fieldDayAtomic")}</p>
      <div className="mt-5 flex justify-end gap-3">
        <button type="button" autoFocus disabled={busy} onClick={onCancel} className="rounded border px-4 py-2 text-sm disabled:opacity-50">{t("cancel")}</button>
        <button type="button" disabled={busy} onClick={onConfirm} className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{t(busy ? "saving" : "fieldDayConfirm")}</button>
      </div>
    </>}
  </dialog>;
}
