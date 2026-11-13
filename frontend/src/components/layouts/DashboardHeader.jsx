import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import LangToggle from "../../i18n/LangToggle";
import { useTranslation } from "react-i18next";
import ProfileAvatar from "../shared/ProfileAvatar";

const DashboardHeader = ({ accent = "teal", onLogout, showLanguageToggle = true }) => {
  const { user } = useSelector((state) => state.auth);
  const context = useSelector((state) => state.context);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const accentStyles = {
    teal: {
      header: "bg-[#008C95] text-white",
      detail: "bg-black/15",
      logout: "bg-black/15 hover:bg-black/25",
      muted: "text-white/80",
      border: "border-white/20",
    },
    navy: {
      header: "bg-[#173F70] text-white",
      detail: "bg-black/20",
      logout: "bg-black/20 hover:bg-black/30",
      muted: "text-white/75",
      border: "border-white/20",
    },
    orange: {
      header: "bg-[#E88724] text-slate-950",
      detail: "bg-white/35",
      logout: "bg-white/35 hover:bg-white/50",
      muted: "text-slate-800",
      border: "border-black/15",
    },
  }[accent] || {
    header: "bg-[#008C95] text-white",
    detail: "bg-black/15",
    logout: "bg-black/15 hover:bg-black/25",
    muted: "text-white/80",
    border: "border-white/20",
  };
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
    <header className={`${accentStyles.header} sticky top-0 z-50 shadow-md`}>
      <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-4 md:px-6">
        <div className="min-w-0 space-y-2">
          <div className="flex items-center gap-3">
            {user?.role !== "FieldTeam" && <ProfileAvatar image={user?.profileImage} name={roleName} className="h-11 w-11" />}
            <p className="text-xl font-bold leading-tight">{roleName}</p>
          </div>
          <dl className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
            {headerFields.map(([label, value]) => (
              <div key={label} className={`flex flex-wrap gap-1 rounded-md px-2 py-1 ${accentStyles.detail}`}>
                <dt className="font-semibold">{label}:</dt>
                <dd className="break-all">{display(value)}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => navigate(profilePath)} className={`rounded-lg border ${accentStyles.border} px-3 py-1.5 text-xs font-semibold hover:bg-white/15`}>{t("profile")}</button>
          <button type="button" onClick={() => setExpanded((value) => !value)} aria-expanded={expanded} aria-controls="dashboard-snapshot" className={`rounded-lg border ${accentStyles.border} px-3 py-1.5 text-xs font-semibold hover:bg-white/15`}>{expanded ? t("hideSnapshot") : t("viewSnapshot")}</button>
          {showLanguageToggle && <LangToggle />}
          <button type="button" onClick={onLogout} className={`${accentStyles.logout} rounded-lg border ${accentStyles.border} px-3 py-1.5 text-sm font-semibold`}>{t("logout")}</button>
        </div>
      </div>
      {expanded && <div id="dashboard-snapshot" className={`border-t ${accentStyles.border} bg-black/10 px-4 py-4 md:px-6`}>
        <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
          {snapshot.map(([label, value]) => <div key={label} className={`rounded-lg border ${accentStyles.border} bg-white/15 p-3`}><p className={`text-xs ${accentStyles.muted}`}>{label}</p><p className="mt-1 break-words font-semibold">{display(value)}</p></div>)}
        </div>
      </div>}
    </header>
  );
};

export default DashboardHeader;
