import i18n from "../i18n/i18n";

export const prepareImage = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onerror = () => reject(new Error(i18n.t("imageReadFailed")));
  reader.onload = () => {
    const image = new Image();
    image.onload = () => {
      const maxSize = 1600;
      const ratio = Math.min(1, maxSize / Math.max(image.width, image.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.width * ratio));
      canvas.height = Math.max(1, Math.round(image.height * ratio));
      canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };
    image.onerror = () => reject(new Error(i18n.t("imageInvalid")));
    image.src = reader.result;
  };
  reader.readAsDataURL(file);
});
