import React from "react";
import { useFormContext } from "react-hook-form";

const SectionLogistics = () => {
  const { register } = useFormContext();

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold border-b pb-2">Section 14: Logistics Record</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Vaccine Doses */}
        <div className="bg-gray-50 p-4 border rounded">
          <h4 className="font-medium text-gray-800 mb-3">1. Vaccine Doses</h4>
          <div className="space-y-2 text-sm">
            <p className="font-semibold text-gray-600">Received</p>
            <div className="flex gap-2">
              <input type="number" placeholder="Seal-packed" {...register("logistics.vaccines.received.sealPacked")} className="w-full px-2 py-1 border" />
              <input type="number" placeholder="Partially" {...register("logistics.vaccines.received.partiallyUsed")} className="w-full px-2 py-1 border" />
            </div>
            <p className="font-semibold text-gray-600 mt-2">Used</p>
            <div className="flex gap-2">
              <input type="number" placeholder="Seal-packed" {...register("logistics.vaccines.used.sealPacked")} className="w-full px-2 py-1 border" />
              <input type="number" placeholder="Partially" {...register("logistics.vaccines.used.partiallyUsed")} className="w-full px-2 py-1 border" />
            </div>
            <p className="font-semibold text-gray-600 mt-2">Returned</p>
            <div className="flex gap-2">
              <input type="number" placeholder="Seal-packed" {...register("logistics.vaccines.returned.sealPacked")} className="w-full px-2 py-1 border" />
              <input type="number" placeholder="Partially" {...register("logistics.vaccines.returned.partiallyUsed")} className="w-full px-2 py-1 border" />
            </div>
          </div>
        </div>

        {/* Vitamin A Capsules */}
        <div className="bg-gray-50 p-4 border rounded">
          <h4 className="font-medium text-gray-800 mb-3">2. Vitamin A Capsules</h4>
          <div className="space-y-2 text-sm">
            <p className="font-semibold text-gray-600">Received (Red / Blue)</p>
            <div className="flex gap-2">
              <input type="number" placeholder="Red" {...register("logistics.capsules.received.red")} className="w-full px-2 py-1 border" />
              <input type="number" placeholder="Blue" {...register("logistics.capsules.received.blue")} className="w-full px-2 py-1 border" />
            </div>
            <p className="font-semibold text-gray-600 mt-2">Used (Red / Blue)</p>
            <div className="flex gap-2">
              <input type="number" placeholder="Red" {...register("logistics.capsules.used.red")} className="w-full px-2 py-1 border" />
              <input type="number" placeholder="Blue" {...register("logistics.capsules.used.blue")} className="w-full px-2 py-1 border" />
            </div>
            <p className="font-semibold text-gray-600 mt-2">Returned (Red / Blue)</p>
            <div className="flex gap-2">
              <input type="number" placeholder="Red" {...register("logistics.capsules.returned.red")} className="w-full px-2 py-1 border" />
              <input type="number" placeholder="Blue" {...register("logistics.capsules.returned.blue")} className="w-full px-2 py-1 border" />
            </div>
          </div>
        </div>

        {/* Finger Markers */}
        <div className="bg-gray-50 p-4 border rounded">
          <h4 className="font-medium text-gray-800 mb-3">3. Finger Markers</h4>
          <div className="space-y-2 text-sm">
            <div><label>Received</label><input type="number" {...register("logistics.markers.received")} className="w-full px-2 py-1 border" /></div>
            <div><label>Used</label><input type="number" {...register("logistics.markers.used")} className="w-full px-2 py-1 border" /></div>
            <div><label>Returned</label><input type="number" {...register("logistics.markers.returned")} className="w-full px-2 py-1 border" /></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionLogistics;