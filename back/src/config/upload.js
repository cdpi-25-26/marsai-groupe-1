import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import multer from "multer";
import path from "path";
import { configDotenv } from "dotenv";

configDotenv();

console.log("[S3] Config:", {
  region: process.env.S3_REGION,
  endpoint: process.env.S3_ENDPOINT,
  accessKeyId: process.env.S3_ACCESS_KEY ? "***" + process.env.S3_ACCESS_KEY.slice(-4) : "MISSING",
  secretKey: process.env.S3_SECRET_KEY ? "***" + process.env.S3_SECRET_KEY.slice(-4) : "MISSING",
  bucket: process.env.S3_BUCKET,
  folder: process.env.S3_FOLDER,
});

const s3Client = new S3Client({
  region: process.env.S3_REGION,
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
  },
  forcePathStyle: true,
});

const BUCKET = process.env.S3_BUCKET;
const FOLDER = process.env.S3_FOLDER;

function fileFilter(req, file, cb) {
  const allowedMimes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Seuls les fichiers images (JPEG, PNG, GIF, WEBP) sont autorisés"), false);
  }
}

// Multer en mémoire (buffer) pour envoyer directement à S3
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Upload un fichier vers S3
async function uploadToS3(file) {
  const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
  const ext = path.extname(file.originalname);
  const key = `${FOLDER}/thumbnail/${uniqueSuffix}${ext}`;

  console.log("[S3] Uploading:", {
    bucket: BUCKET,
    key,
    size: file.buffer.length,
    mimetype: file.mimetype,
  });

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: "public-read",
  });

  const result = await s3Client.send(command);
  console.log("[S3] Upload OK:", result.$metadata.httpStatusCode);

  // URL publique du fichier
  const url = `${process.env.S3_ENDPOINT}/${BUCKET}/${key}`;
  console.log("[S3] URL:", url);
  return url;
}

// Supprimer un fichier du S3
async function deleteFromS3(fileUrl) {
  // Extraire la clé depuis l'URL
  const prefix = `${process.env.S3_ENDPOINT}/${BUCKET}/`;
  if (!fileUrl.startsWith(prefix)) return;
  const key = fileUrl.replace(prefix, "");

  const command = new DeleteObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });

  await s3Client.send(command);
}

export default upload;
export { uploadToS3, deleteFromS3 };
