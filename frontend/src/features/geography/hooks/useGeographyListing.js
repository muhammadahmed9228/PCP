import { useCallback, useEffect, useState } from "react";
import { geographyService } from "../services/geography.service";
import i18n from "../../../i18n/i18n";

const empty = { items: [], total: 0, page: 1, limit: 10 };

export const useGeographyListing = (areaId, kind, query) => {
  const [result, setResult] = useState({ ...empty, key: null, error: null });
  const [refreshKey, setRefreshKey] = useState(0);
  const requestKey = JSON.stringify([areaId, kind, query, refreshKey]);
  const refresh = useCallback(() => setRefreshKey(key => key + 1), []);

  useEffect(() => {
    if (!areaId) return undefined;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const response = await (kind === "routes"
          ? geographyService.listRoutes(areaId, query, controller.signal)
          : geographyService.listPoints(areaId, query, controller.signal));
        if (!controller.signal.aborted) setResult({ ...response.data, key: requestKey, error: null });
      } catch (error) {
        if (!controller.signal.aborted) setResult({ ...empty, key: requestKey, error: error.response?.data?.message || i18n.t("geoFetchFailed") });
      }
    }, query.search ? 300 : 0);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [areaId, kind, query, requestKey]);

  return {
    ...(result.key === requestKey ? result : { ...empty, error: null }),
    loading: Boolean(areaId && result.key !== requestKey),
    refresh
  };
};
