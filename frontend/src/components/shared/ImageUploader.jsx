import { useRef, useState } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n/i18n";

const prepareImage = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onerror = () => reject(new Error(i18n.t("imageReadFailed")));
  reader.onload = () => {
    const image = new Image();
    image.onload = () => {
      const maxSize = 1600;
      const ratio = Math.min(1, maxSize / Math.max(image.width, image.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.width * ratio));
      canvas.height = Math.max(1, Math.round(image.height * ratio));
      canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };
    image.onerror = () => reject(new Error(i18n.t("imageInvalid")));
    image.src = reader.result;
  };
  reader.readAsDataURL(file);
});

const ImageModal = ({ image, label, onClose }) => <div role="dialog" aria-modal="true" className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/20 p-4 backdrop-blur-md" onClick={onClose}><div className="relative max-h-full max-w-5xl" onClick={(event) => event.stopPropagation()}><img src={image.url} alt={label} className="max-h-[88vh] max-w-full rounded-2xl object-contain shadow-2xl" /><button type="button" onClick={onClose} className="absolute right-2 top-2 rounded-full bg-white px-3 py-1 text-lg font-bold text-slate-900 shadow">×</button></div></div>;

export const ImageViewer = ({ image, label, compact = false }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  if (!image?.url) return compact ? null : <div className="flex h-28 w-full items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-center text-[11px] text-slate-500">{t("imageNoUploaded")}</div>;
  return <><button type="button" onClick={() => setOpen(true)} className={compact ? "min-h-9 rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-[11px] font-semibold text-slate-700 hover:bg-slate-50" : "group relative block h-28 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 text-left"}>{compact ? t("imageView") : <><img src={image.url} alt={label} className="h-full w-full object-cover transition group-hover:scale-[1.02]" /><span className="absolute bottom-2 right-2 rounded-full bg-slate-950/75 px-2.5 py-1 text-[11px] font-semibold text-white">{t("imageViewFull")}</span></>}</button>{open && <ImageModal image={image} label={label} onClose={() => setOpen(false)} />}</>;
};

const ImageUploader = ({ label, currentImage, uploadImage, onUploaded, compact = false }) => {
  const { t } = useTranslation();
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const handleChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error(t("imageChoose")); return; }
    setBusy(true);
    try {
      const image = await prepareImage(file);
      const response = await uploadImage(image, file.name);
      onUploaded(response.data || response);
      toast.success(t("imageUploaded", { label }));
    } catch (error) { toast.error(error.response?.data?.message || error.message || t("imageUploadFailed")); }
    finally { setBusy(false); }
  };
  const buttonText = busy ? t("imageUploading") : currentImage?.url ? (compact ? t("imageReplace") : t("imageReplaceFull")) : (compact ? t("imageUpload") : t("imageUploadFull"));
  return <div className={compact ? "flex items-center gap-1.5" : "space-y-3"}>
    {!compact && <div><p className="text-sm font-bold text-slate-900">{label}</p><p className="text-xs text-slate-500">{t("imageHelp")}</p></div>}
    <ImageViewer image={currentImage} label={label} compact={compact} />
    <input ref={inputRef} type="file" accept="image/*" onChange={handleChange} className="hidden" />
    <button type="button" onClick={() => inputRef.current?.click()} disabled={busy} className={`${compact ? "min-h-9 px-2.5 text-[11px]" : "min-h-10 w-full px-3 text-sm"} rounded-xl border border-blue-200 bg-blue-50 py-2 font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-60`}>{buttonText}</button>
  </div>;
};

export default ImageUploader;
