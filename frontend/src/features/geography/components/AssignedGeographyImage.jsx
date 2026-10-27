import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchGeography } from "../store/geographySlice";
import { ImageViewer } from "../../../components/shared/ImageUploader";

const AssignedGeographyImage = ({ kind, day, assignmentId, assignmentImage }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { areaId } = useSelector((state) => state.context);
  const { routes, points } = useSelector((state) => state.geography);

  useEffect(() => {
    if (areaId && user?.role === "FieldTeam") dispatch(fetchGeography(areaId));
  }, [areaId, dispatch, user?.role]);

  if (user?.role !== "FieldTeam" || !day) return null;
  const items = kind === "route" ? routes : points;
  const assigned = assignmentId
    ? items.find((item) => String(item._id) === String(assignmentId))
    : items.find((item) => String(item.team?._id || item.team) === String(user._id) && Number(item.campaignDay) === Number(day));
  if (!assigned) return null;
  const image = (kind === "route" ? assigned.routeImage : assigned.pointImage) || assignmentImage;
  return <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4"><div className="mb-3 flex items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wide text-blue-600">Assigned {kind}</p><h3 className="font-bold text-slate-900">{kind === "route" ? `${assigned.routeNo} · ${assigned.routeName}` : `${assigned.pointNo} · ${assigned.pointName}`}</h3></div><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">Day {day}</span></div><ImageViewer image={image} label={`Assigned ${kind}`} /></section>;
};

export default AssignedGeographyImage;
