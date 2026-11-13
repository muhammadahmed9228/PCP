const initials = (name) => name?.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "?";

const ProfileAvatar = ({ image, name, className = "h-11 w-11" }) => (
  image?.url
    ? <img src={image.url} alt={`${name || "User"} profile`} className={`${className} shrink-0 rounded-full border-2 border-white/40 object-cover`} />
    : <span aria-label={`${name || "User"} profile`} className={`${className} inline-flex shrink-0 items-center justify-center rounded-full bg-white/20 text-sm font-bold text-current`}>{initials(name)}</span>
);

export default ProfileAvatar;
