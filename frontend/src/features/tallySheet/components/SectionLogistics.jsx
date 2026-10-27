import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

const SectionLogistics = () => {
  const { register } = useFormContext();
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold border-b pb-2">{t("section14Logistics")}</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Vaccine Doses */}
        <div className="bg-gray-50 p-4 border rounded">
          <h4 className="font-medium text-gray-800 mb-3">{t("vaccineDoses")}</h4>
          <div className="space-y-2 text-sm">
            <p className="font-semibold text-gray-600">{t("received")}</p>
            <div className="flex gap-2">
              <input type="number" placeholder={t("sealPacked")} {...register("logistics.vaccines.received.sealPacked")} className="w-full px-2 py-1 border" />
              <input type="number" placeholder={t("partially")} {...register("logistics.vaccines.received.partiallyUsed")} className="w-full px-2 py-1 border" />
            </div>
            <p className="font-semibold text-gray-600 mt-2">{t("used")}</p>
            <div className="flex gap-2">
              <input type="number" placeholder={t("sealPacked")} {...register("logistics.vaccines.used.sealPacked")} className="w-full px-2 py-1 border" />
              <input type="number" placeholder={t("partially")} {...register("logistics.vaccines.used.partiallyUsed")} className="w-full px-2 py-1 border" />
            </div>
            <p className="font-semibold text-gray-600 mt-2">{t("returned")}</p>
            <div className="flex gap-2">
              <input type="number" placeholder={t("sealPacked")} {...register("logistics.vaccines.returned.sealPacked")} className="w-full px-2 py-1 border" />
              <input type="number" placeholder={t("partially")} {...register("logistics.vaccines.returned.partiallyUsed")} className="w-full px-2 py-1 border" />
            </div>
          </div>
        </div>

        {/* Vitamin A Capsules */}
        <div className="bg-gray-50 p-4 border rounded">
          <h4 className="font-medium text-gray-800 mb-3">{t("vitaminCapsules")}</h4>
          <div className="space-y-2 text-sm">
            <p className="font-semibold text-gray-600">{t("receivedRedBlue")}</p>
            <div className="flex gap-2">
              <input type="number" placeholder={t("red")} {...register("logistics.capsules.received.red")} className="w-full px-2 py-1 border" />
              <input type="number" placeholder={t("blue")} {...register("logistics.capsules.received.blue")} className="w-full px-2 py-1 border" />
            </div>
            <p className="font-semibold text-gray-600 mt-2">{t("usedRedBlue")}</p>
            <div className="flex gap-2">
              <input type="number" placeholder={t("red")} {...register("logistics.capsules.used.red")} className="w-full px-2 py-1 border" />
              <input type="number" placeholder={t("blue")} {...register("logistics.capsules.used.blue")} className="w-full px-2 py-1 border" />
            </div>
            <p className="font-semibold text-gray-600 mt-2">{t("returnedRedBlue")}</p>
            <div className="flex gap-2">
              <input type="number" placeholder={t("red")} {...register("logistics.capsules.returned.red")} className="w-full px-2 py-1 border" />
              <input type="number" placeholder={t("blue")} {...register("logistics.capsules.returned.blue")} className="w-full px-2 py-1 border" />
            </div>
          </div>
        </div>

        {/* Finger Markers */}
        <div className="bg-gray-50 p-4 border rounded">
          <h4 className="font-medium text-gray-800 mb-3">{t("fingerMarkers")}</h4>
          <div className="space-y-2 text-sm">
            <div><label>{t("received")}</label><input type="number" {...register("logistics.markers.received")} className="w-full px-2 py-1 border" /></div>
            <div><label>{t("used")}</label><input type="number" {...register("logistics.markers.used")} className="w-full px-2 py-1 border" /></div>
            <div><label>{t("returned")}</label><input type="number" {...register("logistics.markers.returned")} className="w-full px-2 py-1 border" /></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionLogistics;
