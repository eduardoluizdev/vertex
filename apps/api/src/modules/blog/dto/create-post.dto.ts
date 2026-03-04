import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { PostStatus } from 'src/generated/prisma/enums';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  headline!: string;

  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  excerpt?: string;

  @IsOptional()
  @IsString()
  coverImage?: string;

  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;
}
