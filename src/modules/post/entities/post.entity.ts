import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  Default,
  CreatedAt,
  UpdatedAt,
  BelongsTo,
  ForeignKey,
  DataType,
} from 'sequelize-typescript';
import { User } from '../../user/entities/user.entity';

interface PostAttributes {
  id: number;
  title: string;
  content: string;
  isPublished: boolean;
  authorId: number;
  createdAt: Date;
  updatedAt: Date;
}

interface PostCreationAttributes {
  title: string;
  content: string;
  isPublished?: boolean;
  authorId: number;
}

@Table({
  tableName: 'posts',
  timestamps: true,
})
export class Post extends Model<PostAttributes, PostCreationAttributes> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @AllowNull(false)
  @Column(DataType.STRING)
  declare title: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  declare content: string;

  @Default(true)
  @Column(DataType.BOOLEAN)
  declare isPublished: boolean;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare authorId: number;

  @BelongsTo(() => User)
  declare author: User;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;
}
