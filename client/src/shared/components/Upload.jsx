import { Dropzone } from "./Dropzone.jsx";

export default function Upload({
  onUploadSuccess,
  uploadFn,
  acceptTypes = "application/pdf,.pdf",
  successMessage = "Uploaded and ingested successfully.",
}) {
  return (
    <Dropzone
      accept={acceptTypes}
      uploadFn={uploadFn}
      successMessage={successMessage}
      onUploadComplete={onUploadSuccess}
      className="w-full"
    />
  );
}
