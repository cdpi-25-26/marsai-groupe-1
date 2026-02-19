import instance from "./config.js";

async function getVideos() {
  return await instance.get("videos");
}

async function uploadThumbnail(videoId, file) {
  const formData = new FormData();
  formData.append("thumbnail", file);

  return await instance.patch(`videos/${videoId}/thumbnail`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 10000,
  });
}

export { getVideos, uploadThumbnail };
