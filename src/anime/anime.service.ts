// src/anime/anime.service.ts
import { Injectable, HttpException } from '@nestjs/common';
import type { Anime } from './types/animeType';

@Injectable()
export class AnimeService {
  private readonly ANILIST_URL = 'https://graphql.anilist.co';

  private async requestAniList<T>(
    query: string,
    variables?: Record<string, any>,
  ): Promise<T> {
    const res = await fetch(this.ANILIST_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables }),
    });

    if (!res.ok) {
      throw new HttpException('Error al consultar AniList', res.status);
    }

    const json = (await res.json()) as { data: T; errors?: any[] };

    if (json.errors) {
      console.error('AniList errors:', json.errors);
      throw new HttpException('AniList devolvió un error', 500);
    }
    return json.data;
  }

  async get50PopularityDesc(): Promise<Anime[]> {
    const POPULAR_ANIME_QUERY = `
      query ($page: Int, $perPage: Int) {
        Page(page: $page, perPage: $perPage) {
          media(type: ANIME, sort: POPULARITY_DESC) {
            id
            title {
              romaji
              native
              english
            }
            genres
            startDate {
              year
            } 
            endDate {
              year
            }
            coverImage {
              medium
              large
              extraLarge
              color
            } 
            bannerImage
            status
            popularity
            averageScore
            description
            studios {
              nodes {
                name
                isAnimationStudio
              }
            }
          }
        }
      }
    `;
    const data = await this.requestAniList<{
      Page: {
        media: Array<{
          id: number;
          title: {
            romaji: string | null;
            english?: string | null;
            native?: string | null;
          };
          genres: string[] | null;
          startDate: { year: number | null } | null;
          endDate: { year: number | null } | null;
          coverImage: {
            medium: string | null;
            large: string | null;
            extraLarge: string | null;
            color: string | null;
          } | null;
          bannerImage: string | null;
          status: string | null;
          popularity: number | null;
          averageScore: number | null;
          description: string | null;
          studios: {
            nodes: Array<{
              name: string;
              isAnimationStudio: boolean;
            }>;
          } | null;
        }>;
      };
    }>(POPULAR_ANIME_QUERY, { page: 1, perPage: 50 });

    const media = data.Page.media;

    const animes: Anime[] = media.map((m) => ({
      id: m.id,
      title:
        m.title.romaji ?? m.title.english ?? m.title.native ?? 'Sin título',
      genres: m.genres ?? [],
      startYear: m.startDate?.year ?? undefined,
      endYear: m.endDate?.year ?? undefined,
      coverImage: m.coverImage
        ? {
            medium: m.coverImage.medium ?? undefined,
            large: m.coverImage.large ?? undefined,
            extraLarge: m.coverImage.extraLarge ?? undefined,
            color: m.coverImage.color ?? null,
          }
        : undefined,
      bannerImage: m.bannerImage ?? undefined,
      status: this.mapStatus(m.status),
      popularity: m.popularity ?? undefined,
      score: m.averageScore ?? undefined,
      description: m.description ?? undefined,
      studios: this.mapStudios(m.studios),
    }));
    return animes;
  }

  async get50ScoreDesc(): Promise<Anime[]> {
    const POPULAR_ANIME_QUERY = `
      query ($page: Int, $perPage: Int) {
        Page(page: $page, perPage: $perPage) {
          media(type: ANIME, sort: SCORE_DESC) {
            id
            title {
              romaji
              native
              english
            }
            genres
            startDate {
              year
            }
            endDate {
              year
            }
            coverImage {
              medium
              large
              extraLarge
              color
            }
            bannerImage
            status
            popularity
            averageScore
            description
            studios {
              nodes {
                name
                isAnimationStudio
              }
            }
          }
        }
      }
    `;

    const data = await this.requestAniList<{
      Page: {
        media: Array<{
          id: number;
          title: {
            romaji: string | null;
            english?: string | null;
            native?: string | null;
          };
          genres: string[] | null;
          startDate: { year: number | null } | null;
          endDate: { year: number | null } | null;
          coverImage: {
            medium: string | null;
            large: string | null;
            extraLarge: string | null;
            color: string | null;
          } | null;
          bannerImage: string | null;
          status: string | null;
          popularity: number | null;
          averageScore: number | null;
          description: string | null;
          studios: {
            nodes: Array<{
              name: string;
              isAnimationStudio: boolean;
            }>;
          } | null;
        }>;
      };
    }>(POPULAR_ANIME_QUERY, { page: 1, perPage: 50 });

    const media = data.Page.media;

    const animes: Anime[] = media.map((m) => ({
      id: m.id,
      title:
        m.title.romaji ?? m.title.english ?? m.title.native ?? 'Sin título',
      genres: m.genres ?? [],
      startYear: m.startDate?.year ?? undefined,
      endYear: m.endDate?.year ?? undefined,
      coverImage: m.coverImage
        ? {
            medium: m.coverImage.medium ?? undefined,
            large: m.coverImage.large ?? undefined,
            extraLarge: m.coverImage.extraLarge ?? undefined,
            color: m.coverImage.color ?? null,
          }
        : undefined,
      bannerImage: m.bannerImage ?? undefined,
      status: this.mapStatus(m.status),
      popularity: m.popularity ?? undefined,
      score: m.averageScore ?? undefined,
      description: m.description ?? undefined,
      studios: this.mapStudios(m.studios),
    }));

    return animes;
  }

  private mapStatus(status: string | null): Anime['status'] {
    switch (status) {
      case 'RELEASING':
        return 'ongoing';
      case 'FINISHED':
        return 'finished';
      case 'NOT_YET_RELEASED':
        return 'upcoming';
      default:
        return undefined;
    }
  }

  private mapStudios(
    studios: {
      nodes: Array<{ name: string; isAnimationStudio: boolean }>;
    } | null,
  ): Anime['studios'] {
    if (!studios || !studios.nodes) return [];

    return studios.nodes
      .filter((s) => s.isAnimationStudio)
      .map((s) => ({
        name: s.name,
        isAnimationStudio: s.isAnimationStudio,
      }));
  }
}
