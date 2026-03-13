export interface Film {
  id: number;
  title: string;
  director: string;
  directorUsername: string;
  description: string;
  thumbnail: string;
  videoUrl: string;
  category: string;
  country: string;
  duration: string;
  likes: number;
  views: number;
  comments: number;
  shares: number;
  aiTools: string[];
  submittedDate: string;
  rank?: number;
}
