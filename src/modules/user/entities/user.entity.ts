import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  Unique,
  AllowNull,
  Default,
  CreatedAt,
  UpdatedAt,
  HasMany,
  DataType,
} from 'sequelize-typescript';
import { Exclude } from 'class-transformer';

interface UserAttributes {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface UserCreationAttributes {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  isActive?: boolean;
}

@Table({
  tableName: 'users',
  timestamps: true,
})
export class User extends Model<UserAttributes, UserCreationAttributes> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @Unique
  @AllowNull(false)
  @Column(DataType.STRING)
  declare email: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  declare firstName: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  declare lastName: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  declare password: string;

  @Default(true)
  @Column(DataType.BOOLEAN)
  declare isActive: boolean;

  @HasMany(() => require('../../post/entities/post.entity').Post)
  declare posts: any[];

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;
}
