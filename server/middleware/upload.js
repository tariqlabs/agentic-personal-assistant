import multer from "multer";
import os from "node:os";
import path from "node:path";
import { config } from "../config/index.js";

export const createUploadMiddleware = () => {
  return multer({
    storage: multer.diskStorage({
      destination: os.tmpdir(),
      filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname || "");
        cb(null, `${Date.now()}-${Math.random().toString(16).slice(2)}${ext}`);
      },
    }),
    fileFilter: (_req, file, cb) => {
      const { allowedTypes, allowedExtensions } = config.upload;
      const isAllowedType = allowedTypes.includes(file.mimetype);
      const isAllowedExtension = allowedExtensions.some((ext) =>
        (file.originalname || "").toLowerCase().endsWith(ext)
      );

      const isValid = isAllowedType || isAllowedExtension;
      cb(
        isValid ? null : new Error(`Only ${allowedExtensions.join(", ")} files are allowed`),
        isValid
      );
    },
    limits: { fileSize: config.upload.maxFileSize },
  });
};
