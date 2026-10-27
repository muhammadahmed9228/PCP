import { useTranslation } from "react-i18next";
import { useFormContext, useWatch } from "react-hook-form";

const TransitTallyUI = ({ isFinalized }) => {
  const { setValue, control } = useFormContext();
  const { t } = useTranslation();
  const vaccinatedCount = Number(useWatch({ control, name: "vaccinatedChildrenCount" })) || 0;
  
  const maxEntries = 245;

  const handleIncrement = () => {
    if (vaccinatedCount < maxEntries) {
      setValue("vaccinatedChildrenCount", vaccinatedCount + 1, { shouldDirty: true });
    }
  };

  const handleDecrement = () => {
    if (vaccinatedCount > 0) {
      setValue("vaccinatedChildrenCount", vaccinatedCount - 1, { shouldDirty: true });
    }
  };

  // Generate an array of 245 boxes for the visual grid requirement
  const renderCheckboxes = () => {
    const boxes = [];
    for (let i = 1; i <= maxEntries; i++) {
      const isChecked = i <= vaccinatedCount;
      boxes.push(
        <div 
          key={i} 
          className={`w-6 h-6 border flex items-center justify-center text-xs rounded-sm ${
            isChecked ? 'bg-blue-600 border-blue-700 text-white font-bold' : 'bg-gray-100 border-gray-300 text-transparent'
          }`}
          title={`${t("child")} ${i}`}
        >
          {isChecked ? "✓" : ""}
        </div>
      );
    }
    return boxes;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-center bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h3 className="text-xl font-bold text-blue-900 mb-2">{t("transitPointTally")}</h3>
        <p className="text-sm text-blue-700 mb-6 text-center">
          {t("transitTallyHint")}
        </p>

        <div className="flex items-center gap-6 mb-8">
          <button 
            type="button" 
            onClick={handleDecrement}
            disabled={isFinalized || vaccinatedCount === 0}
            className="w-14 h-14 rounded-full bg-red-100 text-red-600 text-2xl font-bold hover:bg-red-200 disabled:opacity-50"
          >
            -
          </button>
          
          <div className="flex flex-col items-center">
            <span className="text-5xl font-black text-blue-800">{vaccinatedCount}</span>
            <span className="text-sm font-medium text-gray-500 mt-1">/ {maxEntries} {t("max")}</span>
          </div>
          
          <button 
            type="button" 
            onClick={handleIncrement}
            disabled={isFinalized || vaccinatedCount >= maxEntries}
            className="w-16 h-16 rounded-full bg-blue-600 text-white text-3xl font-bold shadow-lg hover:bg-blue-700 active:scale-95 transition-transform disabled:opacity-50"
          >
            +
          </button>
        </div>

        {/* Hidden input to ensure React Hook Form tracks the value for submission */}
        <input type="hidden" {...control.register("vaccinatedChildrenCount")} />
      </div>

      <div className="bg-white p-4 rounded border shadow-sm">
        <h4 className="font-semibold text-gray-700 mb-3 border-b pb-2">{t("visualRecordGrid")}</h4>
        <div className="flex flex-wrap gap-1 justify-start">
          {renderCheckboxes()}
        </div>
      </div>
    </div>
  );
};

export default TransitTallyUI;
