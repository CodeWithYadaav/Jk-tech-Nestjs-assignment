import { Exclude, Expose } from 'class-transformer';

export class UserResponseDto {
  @Expose()
  id: number;

  @Expose()
  email: string;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  isActive: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Exclude()
  password?: string;
}
