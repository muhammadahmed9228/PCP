import { useCallback, useEffect, useState } from "react";
import i18n from "../../i18n/i18n";

export const useServerList = (load, query, enabled = true, scope = "") => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [state, setState] = useState({ key: null, items: [], total: 0, error: null });
  const requestKey = JSON.stringify([scope, query, enabled, refreshKey]);
  const refresh = useCallback(() => setRefreshKey(value => value + 1), []);

  useEffect(() => {
    if (!enabled) return undefined;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const response = await load(query, controller.signal);
        if (!controller.signal.aborted) setState({ ...response.data, key: requestKey, error: null });
      } catch (error) {
        if (!controller.signal.aborted) setState({ key: requestKey, items: [], total: 0, error: error.response?.data?.message || i18n.t("listLoadFailed") });
      }
    }, query.search ? 300 : 0);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [load, query, enabled, requestKey]);

  return {
    ...(state.key === requestKey ? state : { items: [], total: 0, error: null }),
    loading: enabled && state.key !== requestKey,
    refresh
  };
};
