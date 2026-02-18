/**
 * @bref Service Video — upload YouTube (unlisted) + vérification copyright + Scaleway S3
 */

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { google } from "googleapis";
import { Readable } from "stream";
import crypto from "crypto";
import path from "path";
import { AppError } from "../middlewares/errorHandler.js";
import logger from "../utils/logger.js";

const BUCKET_NAME = process.env.SCW_BUCKET_NAME;
const FOLDER = process.env.SCW_FOLDER || "grp1";

const s3Client = new S3Client({
  region: process.env.SCW_REGION || "fr-par",
  endpoint: process.env.SCW_ENDPOINT || "https://s3.fr-par.scw.cloud",
  credentials: {
    accessKeyId: process.env.SCW_ACCESS_KEY_ID,
    secretAccessKey: process.env.SCW_SECRET_ACCESS_KEY,
  },
});

// ─── YouTube ─────────────────────────────────────────────────────────────────

/**
 * @bref Crée un client OAuth2 YouTube authentifié via refresh token
 */
function createYoutubeClient() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
  return google.youtube({ version: "v3", auth: oauth2Client });
}

/**
 * @bref Upload une vidéo sur YouTube en mode unlisted
 * YouTube scanne automatiquement le contenu avec Content ID
 * @param {Express.Multer.File} file
 * @param {string} title
 * @returns {Promise<{youtubeVideoId: string}>}
 */
async function uploadToYoutube(file, title) {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REFRESH_TOKEN) {
    throw new AppError("Credentials Google OAuth2 manquants dans la configuration", 500);
  }

  const youtube = createYoutubeClient();

  let response;
  try {
    response = await youtube.videos.insert({
      part: ["snippet", "status"],
      requestBody: {
        snippet: {
          title: title || file.originalname,
          description: "Vidéo uploadée pour vérification copyright",
        },
        status: { privacyStatus: "unlisted" },
      },
      media: {
        mimeType: file.mimetype,
        body: Readable.from(file.buffer),
      },
    });
  } catch (err) {
    logger.error("YouTube upload failed", { 
      error: err.message,
      status: err.status,
      code: err.code,
      details: err.errors ? JSON.stringify(err.errors) : null
    });
    throw new AppError(`Échec de l'upload YouTube : ${err.message}`, 502);
  }

  const youtubeVideoId = response.data.id;
  if (!youtubeVideoId) throw new AppError("YouTube n'a pas retourné d'ID vidéo", 502);

  logger.info("YouTube upload success", { youtubeVideoId });
  return { youtubeVideoId };
}

/**
 * @bref Vérifie les droits d'auteur via YouTube Data API v3 (Content ID claims)
 * @param {string} youtubeVideoId
 * @returns {Promise<{safe: boolean, videoId: string}>}
 */
async function checkYoutubeCopyright(youtubeVideoId) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) throw new AppError("Clé YouTube API manquante dans la configuration", 500);

  const url = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,status&id=${encodeURIComponent(youtubeVideoId)}&key=${apiKey}`;

  let response;
  try {
    response = await fetch(url);
  } catch (err) {
    logger.error("YouTube API unreachable", { error: err.message });
    throw new AppError("Impossible de joindre l'API YouTube", 503);
  }

  if (!response.ok) {
    logger.error("YouTube API error", { status: response.status });
    throw new AppError(`Erreur YouTube API: ${response.status}`, 502);
  }

  const data = await response.json();

  if (!data.items || data.items.length === 0) {
    throw new AppError("Vidéo YouTube introuvable, privée ou supprimée", 422);
  }

  const { contentDetails } = data.items[0];

  if (contentDetails?.licensedContent === true) {
    logger.warn("Copyright claim detected", { youtubeVideoId });
    throw new AppError("Cette vidéo fait l'objet d'une revendication de droits d'auteur (Content ID claim)", 422);
  }

  logger.info("YouTube copyright check passed", { youtubeVideoId });
  return { safe: true, videoId: youtubeVideoId };
}

// ─── Scaleway S3 ─────────────────────────────────────────────────────────────

/**
 * @bref Liste toutes les vidéos dans le dossier du bucket Scaleway
 * @returns {Promise<Array>}
 */
async function listVideos() {
  const command = new ListObjectsCommand({
    Bucket: BUCKET_NAME,
    Prefix: `${FOLDER}/`,
  });

  try {
    const response = await s3Client.send(command);
    const files = (response.Contents || []).map((item) => ({
      key: item.Key,
      size: item.Size,
      lastModified: item.LastModified,
      url: `${process.env.SCW_ENDPOINT}/${BUCKET_NAME}/${item.Key}`,
    }));
    logger.info("S3 list success", { count: files.length });
    return files;
  } catch (err) {
    logger.error("S3 list failed", { error: err.message });
    throw new AppError("Impossible de lister les vidéos S3", 500);
  }
}

/**
 * @bref Upload un fichier vidéo vers Scaleway S3
 * @param {Express.Multer.File} file
 * @returns {Promise<{s3Url: string, key: string}>}
 */
async function uploadToS3(file) {
  const ext = path.extname(file.originalname).toLowerCase();
  const uniqueKey = `${FOLDER}/${crypto.randomUUID()}${ext}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: uniqueKey,
    Body: file.buffer,
    ContentType: file.mimetype,
  });

  try {
    await s3Client.send(command);
  } catch (err) {
    logger.error("S3 upload failed", { error: err.message, key: uniqueKey });
    throw new AppError("Échec de l'upload vers S3", 500);
  }

  const s3Url = `${process.env.SCW_ENDPOINT}/${BUCKET_NAME}/${uniqueKey}`;
  logger.info("S3 upload success", { key: uniqueKey });
  return { s3Url, key: uniqueKey };
}

/**
 * @bref Télécharge une vidéo depuis Scaleway S3
 * @param {string} key - Clé du fichier dans S3 (ex: grp1/uuid.mp4)
 * @returns {Promise<{stream: Readable, contentType: string}>}
 */
async function downloadFromS3(key) {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  try {
    const response = await s3Client.send(command);
    logger.info("S3 download success", { key });
    return {
      stream: response.Body,
      contentType: response.ContentType,
      contentLength: response.ContentLength,
    };
  } catch (err) {
    logger.error("S3 download failed", { error: err.message, key });
    throw new AppError("Vidéo introuvable dans S3", 404);
  }
}

/**
 * @bref Supprime une vidéo depuis Scaleway S3
 * @param {string} key - Clé du fichier dans S3 (ex: grp1/uuid.mp4)
 * @returns {Promise<void>}
 */
async function deleteFromS3(key) {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  try {
    await s3Client.send(command);
    logger.info("S3 delete success", { key });
  } catch (err) {
    logger.error("S3 delete failed", { error: err.message, key });
    throw new AppError("Échec de la suppression dans S3", 500);
  }
}

export default {
  uploadToYoutube,
  checkYoutubeCopyright,
  listVideos,
  uploadToS3,
  downloadFromS3,
  deleteFromS3,
};
