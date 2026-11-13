const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/15 p-3 sm:p-6 backdrop-blur-md">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="mx-auto flex max-h-[calc(100dvh-1.5rem)] w-full max-w-lg flex-col overflow-hidden rounded-lg bg-white shadow-xl sm:my-6 sm:max-h-[calc(100dvh-3rem)]"
      >
        <div className="shrink-0 px-4 py-3 border-b flex justify-between items-center sm:px-6 sm:py-4">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <button type="button" onClick={onClose} aria-label="Close dialog" className="text-gray-500 hover:text-gray-700">
            &times;
          </button>
        </div>
        <div className="min-h-0 overflow-y-auto p-4 sm:p-6">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
