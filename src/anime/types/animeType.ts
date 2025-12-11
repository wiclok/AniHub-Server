export type AnimeStatus = 'ongoing' | 'finished' | 'upcoming';

export type AnimeStudio = {
  name: string;
  isAnimationStudio: boolean;
};

export type AnimeCoverImage = {
  medium?: string;
  large?: string;
  extraLarge?: string;
  color?: string | null;
};

export type Anime = {
  id: number;
  title: string;
  genres: string[];
  startYear?: number;
  endYear?: number;
  coverImage?: AnimeCoverImage;
  bannerImage?: string;
  status?: AnimeStatus;
  popularity?: number;
  score?: number;
  description?: string;
  studios: AnimeStudio[];
};
