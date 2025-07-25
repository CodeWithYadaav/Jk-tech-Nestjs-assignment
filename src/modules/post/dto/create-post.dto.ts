import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(200)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  content: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean = true;
}
