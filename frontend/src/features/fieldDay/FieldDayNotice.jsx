import { useTranslation } from "react-i18next";

export default function FieldDayNotice({ control, dirty }) {
  const { t } = useTranslation();
  const { current, selectedAssignment, readOnly, enabledDay, history, select, error } = control;
  const open = assignment => {
    if (!dirty || window.confirm(t("fieldDayDiscard"))) select(assignment);
  };
  return <div className="space-y-3 rounded-lg border border-blue-200 bg-white p-4" role="status">
    <p className="font-semibold text-blue-800">{enabledDay ? t("fieldDayEnabled", { day: enabledDay }) : t("fieldDayWaiting")}</p>
    {error && <p className="text-sm text-red-700">{error}</p>}
    {enabledDay && !current && <p className="text-sm text-gray-600">{t("fieldDayNotReady")}</p>}
    {selectedAssignment && <p className="text-sm">{t("fieldDayOpened", { day: selectedAssignment.campaignDay })}: {selectedAssignment.label}</p>}
    {selectedAssignment && readOnly && <p className="text-sm text-amber-800">{t("fieldDayReadOnly")}</p>}
    {current && String(current.assignmentId) !== String(selectedAssignment?.assignmentId) && <button type="button" onClick={() => open(current)} className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white">{t("fieldDayOpenCurrent")}</button>}
    {history.length > 0 && <details><summary className="cursor-pointer text-sm font-medium text-blue-700">{t("fieldDayHistory")}</summary><div className="mt-2 flex flex-wrap gap-2">{history.map(a => <button type="button" key={a.assignmentId} onClick={() => open(a)} className="rounded border px-3 py-2 text-sm">{t("fieldDayOpened", { day: a.campaignDay })} · {a.label}</button>)}</div></details>}
  </div>;
}
