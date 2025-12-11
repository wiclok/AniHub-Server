import { Controller, Get } from '@nestjs/common';
import { AnimeService } from './anime.service';

@Controller('anime')
export class AnimeController {
  constructor(private readonly animeService: AnimeService) {}

  @Get('/top50-score')
  getTopScore() {
    return this.animeService.get50ScoreDesc();
  }

  @Get('/top50-popularity')
  getTopPopularity() {
    return this.animeService.get50PopularityDesc();
  }
}
