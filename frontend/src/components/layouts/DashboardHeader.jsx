import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import LangToggle from "../../i18n/LangToggle";
import { useTranslation } from "react-i18next";

const DashboardHeader = ({ accent = "blue", onLogout, showLanguageToggle = true }) => {
  const { user } = useSelector((state) => state.auth);
  const context = useSelector((state) => state.context);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const green = accent === "green";
  const profilePath = user?.role === "UCI" ? "/dashboard/uci/profile" : user?.role === "AIC" ? "/dashboard/aic/profile" : "/dashboard/team/profile";
  const campaign = context.campaign;
  const campaignName = campaign?.campaignName || t("noCurrentCampaign");
  const campaignStatus = campaign?.status ? t(`campaignState${campaign.status}`, { defaultValue: campaign.status }) : t("noCurrentCampaign");
  const display = (value) => value || "—";
  const roleName = user?.role === "FieldTeam" ? `${t("team")} ${display(user.teamNo)}` : display(user?.uciName || user?.aicName);

  const headerFields = user?.role === "UCI"
    ? [[t("uciName"), user.uciName], [t("uciNo"), user.uciNo], [t("cnic"), user.username], [t("campaignStatus"), campaignStatus]]
    : user?.role === "AIC"
      ? [[t("aicName"), user.aicName], [t("aicNo"), user.aicNo], [t("uciName"), context.uciName], [t("uciNo"), context.uciNo], [t("campaignStatus"), campaignStatus]]
      : [[t("team"), roleName], [t("cnic"), user?.username], [t("campaignStatus"), campaignStatus]];
  const snapshot = user?.role === "UCI"
    ? [[t("campaignName"), campaignName], [t("ucName"), user.ucName], [t("ucNumber"), user.ucNumber], [t("phoneNumber"), user.phoneNumber], [t("cnic"), user.username], [t("campaignStatus"), campaignStatus]]
    : user?.role === "AIC"
      ? [[t("campaignName"), campaignName], [t("aicPhoneNumber"), user.phoneNumber], [t("cnic"), user.username], [t("area"), `${context.areaName || t("notAssigned")}${context.areaNo ? ` / ${context.areaNo}` : ""}`], [t("assignment"), user.aicNo]]
      : [[t("cnic"), user?.username], [t("campaign"), campaignName], [t("area"), `${context.areaName || t("notAssigned")}${context.areaNo ? ` / ${context.areaNo}` : ""}`], [t("teamType"), user?.teamType ? t(`teamType${user.teamType}`) : null]];

  return (
    <header className={`${green ? "bg-emerald-700" : "bg-blue-700"} sticky top-0 z-50 text-white shadow-md`}>
      <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-4 md:px-6">
        <div className="min-w-0 space-y-2">
          <p className="text-xl font-bold leading-tight">{roleName}</p>
          <dl className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
            {headerFields.map(([label, value]) => (
              <div key={label} className={`flex flex-wrap gap-1 rounded-md px-2 py-1 ${green ? "bg-emerald-800/70" : "bg-blue-800/70"}`}>
                <dt className="font-semibold">{label}:</dt>
                <dd className="break-all">{display(value)}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => navigate(profilePath)} className="rounded-lg border border-white/20 px-3 py-1.5 text-xs font-semibold hover:bg-white/10">{t("profile")}</button>
          <button type="button" onClick={() => setExpanded((value) => !value)} aria-expanded={expanded} aria-controls="dashboard-snapshot" className="rounded-lg border border-white/20 px-3 py-1.5 text-xs font-semibold hover:bg-white/10">{expanded ? t("hideSnapshot") : t("viewSnapshot")}</button>
          {showLanguageToggle && <LangToggle />}
          <button type="button" onClick={onLogout} className={`${green ? "bg-emerald-800 hover:bg-emerald-900" : "bg-blue-800 hover:bg-blue-900"} rounded-lg border border-white/20 px-3 py-1.5 text-sm font-semibold`}>{t("logout")}</button>
        </div>
      </div>
      {expanded && <div id="dashboard-snapshot" className="border-t border-white/15 bg-black/10 px-4 py-4 md:px-6">
        <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
          {snapshot.map(([label, value]) => <div key={label} className="rounded-lg border border-white/20 bg-white/10 p-3"><p className={`text-xs ${green ? "text-emerald-100" : "text-blue-100"}`}>{label}</p><p className="mt-1 break-words font-semibold">{display(value)}</p></div>)}
        </div>
      </div>}
    </header>
  );
};

export default DashboardHeader;
