import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export const useFieldDayAssignment = (teamType) => {
  const context = useSelector(state => state.context);
  const isFieldTeam = useSelector(state => state.auth.user?.role === "FieldTeam");
  const assignments = (context.assignments || []).filter(a => a.teamType === teamType);
  const candidates = assignments.filter(a => a.campaignDay === context.enabledDay);
  const current = candidates.length === 1 && (teamType !== "Mobile" || candidates[0].planningStatus === "Finalized") ? candidates[0] : null;
  const [opened, setOpened] = useState(null);
  // Capture the opened assignment. A day change must never move unsaved fields to another day.
  useEffect(() => {
    if (isFieldTeam && !opened && current) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOpened(current);
    }
  }, [isFieldTeam, opened, current]);
  const selectedAssignment = opened && (assignments.find(a => String(a.assignmentId) === String(opened.assignmentId)) || opened);
  const readOnly = isFieldTeam && (!selectedAssignment || !!context.error || !current || String(selectedAssignment.assignmentId) !== String(current.assignmentId));
  return { isFieldTeam, current, selectedAssignment, readOnly, enabledDay: context.enabledDay,
    loading: context.loading, error: context.error, select: setOpened,
    history: assignments.filter(a => a.sheetStatus === "Finalized" && a.campaignDay !== context.enabledDay) };
};
