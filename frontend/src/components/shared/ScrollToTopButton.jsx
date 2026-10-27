import { useCallback, useEffect, useState } from "react";

const ScrollToTopButton = ({ targetId }) => {
  const [visible, setVisible] = useState(false);
  const getScrollTarget = useCallback(() => {
    const container = targetId ? document.getElementById(targetId) : null;
    return container && container.scrollHeight > container.clientHeight ? container : window;
  }, [targetId]);

  useEffect(() => {
    const container = targetId ? document.getElementById(targetId) : null;
    const handleScroll = () => {
      const target = getScrollTarget();
      setVisible((target === window ? window.scrollY : target.scrollTop) > 240);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    container?.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => { window.removeEventListener("scroll", handleScroll); container?.removeEventListener("scroll", handleScroll); };
  }, [getScrollTarget, targetId]);

  const scrollToTop = () => getScrollTarget()?.scrollTo({ top: 0, behavior: "smooth" });
  return <button type="button" onClick={scrollToTop} aria-label="Scroll to top" title="Scroll to top" className={`fixed bottom-5 right-5 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white shadow-lg ring-4 ring-white/70 transition hover:-translate-y-0.5 hover:bg-blue-700 ${visible ? "opacity-100" : "opacity-60"}`}>Top</button>;
};

export default ScrollToTopButton;
