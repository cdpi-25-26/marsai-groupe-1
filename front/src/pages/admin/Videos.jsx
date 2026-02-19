import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getVideos, uploadThumbnail } from "../../api/videos.js";
import { useRef } from "react";
import { ImagePlus } from "lucide-react";

function VideoCard({ video }) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  const uploadMutation = useMutation({
    mutationFn: (file) => uploadThumbnail(video.id, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listVideos"] });
    },
  });

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (file) {
      uploadMutation.mutate(file);
    }
  }

  const thumbnailUrl = video.thumbnail || null;

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
      <div className="flex gap-4 items-start">
        <div className="w-44 h-28 rounded-xl bg-black/50 border border-white/[0.08] overflow-hidden shrink-0 flex items-center justify-center">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={`Thumbnail de ${video.title}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <ImagePlus size={24} className="text-white/20" />
          )}
        </div>

        <div className="flex-1">
          <h3 className="text-base font-semibold mb-1">{video.title}</h3>
          <p className="text-sm text-white/40 mb-3">{video.description}</p>

          <input
            type="file"
            ref={fileInputRef}
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadMutation.isPending}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#51A2FF] to-[#9810FA] text-xs font-semibold text-white hover:opacity-90 transition disabled:opacity-50"
          >
            {uploadMutation.isPending
              ? "Envoi en cours..."
              : video.thumbnail
                ? "Changer le thumbnail"
                : "Ajouter un thumbnail"}
          </button>
          {uploadMutation.isError && (
            <p className="text-red-400 text-xs mt-2">
              {uploadMutation.error?.response?.data?.error || uploadMutation.error?.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function Videos() {
  const { isPending, isError, data, error } = useQuery({
    queryKey: ["listVideos"],
    queryFn: getVideos,
  });

  if (isPending) {
    return <div className="text-white/40">Chargement en cours...</div>;
  }

  if (isError) {
    return <div className="text-red-400">Une erreur est survenue : {error.message}</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Vidéos</h1>
      {data.data.length > 0 ? (
        <div className="space-y-4">
          {data.data.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8 text-center text-white/40">
          Aucune vidéo trouvée.
        </div>
      )}
    </div>
  );
}

export default Videos;
