import {
  IsEmail,
  IsString,
  IsBoolean,
  IsOptional,
  MinLength,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
