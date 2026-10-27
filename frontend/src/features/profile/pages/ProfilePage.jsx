import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { profileService } from "../services/profile.service";
import { setUser } from "../../auth/store/authSlice";
import { imageService } from "../../../services/image.service";
import ImageUploader from "../../../components/shared/ImageUploader";
import { useTranslation } from "react-i18next";
import "../../../i18n/i18n";

const Field = ({ label, name, value, editable, onChange, options }) => {
  const { t } = useTranslation();
  const labelKey = {
    CNIC: "cnic", Role: "role", "Team number": "teamNumberLabel", "Team type": "teamType",
    Leader: "leader", Member: "member", "Leader CNIC": "leaderCnic", "Member CNIC": "memberCnic",
    "AIC number": "aicNumber", "UCI number": "uciNumber", "Full name": "fullName", Phone: "phone",
    Gender: "gender", "Government employee": "governmentEmployee", "UC number": "ucNumber",
    "UC name": "ucName", Province: "province", District: "district", "Town / Tehsil": "townTehsil",
  }[label];
  const displayLabel = labelKey ? t(labelKey) : label;
  label = displayLabel;
  const input = options
    ? <select name={name} value={value || ""} onChange={onChange} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"><option value="">{t("select")}</option>{options.map((option) => <option key={option} value={option}>{t(option.toLowerCase())}</option>)}</select>
    : <input name={name} value={value || ""} onChange={onChange} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm" />;
  const displayValue = value === "Male" || value === "Female" || value === "Yes" || value === "No"
    ? t(value.toLowerCase())
    : value === "Mobile" || value === "Fixed" || value === "Transit" ? t(`teamType${value}`) : value;
  return <label className="block"><span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>{editable ? input : <div className="rounded-xl bg-slate-50 px-3 py-2.5 text-sm text-slate-800">{displayValue || "—"}</div>}</label>;
};

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { user } = useSelector((state) => state.auth);
  const context = useSelector((state) => state.context);
  const [form, setForm] = useState(user || {});
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [areaImage, setAreaImage] = useState(null);
  const canEdit = user?.role === "UCI";
  const isTeam = user?.role === "FieldTeam";
  const locationSource = user?.role === "AIC" ? context : form;

  useEffect(() => {
    let active = true;
    profileService.getCurrentUser().then((response) => {
      if (active && response.data) { setForm(response.data); dispatch(setUser(response.data)); }
    }).catch(() => {});
    return () => { active = false; };
  }, [dispatch]);

  const change = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const save = async (event) => {
    event.preventDefault(); setSaving(true);
    try {
      const response = await profileService.updateProfile({ ...form, isGovtEmployee: form.isGovtEmployee === true || form.isGovtEmployee === "true" });
      dispatch(setUser(response.data)); setForm(response.data); setEditing(false); toast.success(t("profileUpdated"));
    } catch (error) { toast.error(error.response?.data?.message || t("profileUpdateFailed")); }
    finally { setSaving(false); }
  };
  const edit = editing && canEdit;
  const title = user?.role === "FieldTeam" ? t("fieldTeamProfile") : `${user?.role || t("user")} ${t("profile")}`;

  return <div className="mx-auto max-w-5xl space-y-6">
    <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm font-semibold text-blue-600">{t("accountDetails")}</p><h2 className="text-3xl font-bold tracking-tight text-slate-900">{title}</h2><p className="mt-1 text-sm text-slate-500">{canEdit ? t("keepDetailsCurrent") : t("detailsManagedBySupervisor")}</p></div>{canEdit && <button type="button" onClick={() => setEditing((value) => !value)} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm">{editing ? t("cancel") : t("editDetails")}</button>}</div>
    <form onSubmit={save} className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6"><div className="mb-5 flex items-center justify-between"><div><h3 className="font-bold text-slate-900">{t("identity")}</h3><p className="text-sm text-slate-500">{t("signInRoleInfo")}</p></div><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{user?.role || "—"}</span></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><Field label="CNIC" value={user?.username} /><Field label="Role" value={user?.role} />{isTeam ? <><Field label="Team number" value={user?.teamNo} /><Field label="Team type" value={user?.teamType} /><Field label="Leader" value={user?.leader?.name} /><Field label="Member" value={user?.member?.name} /><Field label="Leader CNIC" value={user?.leader?.cnic} /><Field label="Member CNIC" value={user?.member?.cnic} /></> : <><Field label={user?.role === "AIC" ? "AIC number" : "UCI number"} value={user?.aicNo || form?.uciNo} /><Field label="Full name" name={user?.role === "AIC" ? "aicName" : "uciName"} value={form?.aicName || form?.uciName} editable={edit} onChange={change} /><Field label="Phone" name="phoneNumber" value={form?.phoneNumber} editable={edit} onChange={change} /><Field label="Gender" name="gender" value={form?.gender} editable={edit} onChange={change} options={["Male", "Female"]} /><Field label="Government employee" value={form?.isGovtEmployee ? "Yes" : "No"} /></>}</div></section>
      {user?.role === "UCI" && <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6"><ImageUploader label="UC image" currentImage={user?.ucImage} uploadImage={(image, fileName) => imageService.uploadUciImage(image, fileName)} onUploaded={(image) => dispatch(setUser({ ...user, ucImage: image }))} /></section>}
      {user?.role === "AIC" && <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6"><ImageUploader label={t("profileAreaImage")} currentImage={areaImage || context.areaImage} uploadImage={(image, fileName) => imageService.uploadAreaImage(context.areaId, image, fileName)} onUploaded={setAreaImage} /></section>}
      {!isTeam && <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6"><h3 className="font-bold text-slate-900">{t("locationAssignment")}</h3><p className="mb-5 text-sm text-slate-500">{t("administrativeDetails")}</p><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><Field label="UC number" name="ucNumber" value={locationSource?.ucNumber} editable={edit} onChange={change} /><Field label="UC name" name="ucName" value={locationSource?.ucName} editable={edit} onChange={change} /><Field label="Province" name="province" value={locationSource?.province} editable={edit} onChange={change} /><Field label="District" name="district" value={locationSource?.district} editable={edit} onChange={change} /><Field label="Town / Tehsil" name="townTehsil" value={locationSource?.townTehsil} editable={edit} onChange={change} /></div></section>}
      {edit && <div className="flex justify-end"><button disabled={saving} type="submit" className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{saving ? t("saving") : t("saveChanges")}</button></div>}
    </form>
  </div>;
};

export default ProfilePage;
