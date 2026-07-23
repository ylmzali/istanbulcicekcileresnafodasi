import { getMessages } from "@/lib/i18n";

export function getAdminUploadLabels() {
  const a = getMessages().admin;
  return {
    uploadChoose: a.uploadChoose,
    uploadChange: a.uploadChange,
    uploadRemove: a.uploadRemove,
    uploadCropTitle: a.uploadCropTitle,
    uploadCropConfirm: a.uploadCropConfirm,
    uploadCropCancel: a.uploadCropCancel,
    uploadUploading: a.uploadUploading,
    uploadError: a.uploadError,
    uploadZoom: a.uploadZoom,
  };
}
