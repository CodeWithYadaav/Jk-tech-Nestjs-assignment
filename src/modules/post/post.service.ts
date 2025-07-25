import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Post } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { User } from '../user/entities/user.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post)
    private readonly postModel: typeof Post,
  ) {}

  async create(createPostDto: CreatePostDto, author: User): Promise<Post> {
    const post = await this.postModel.create({
      ...createPostDto,
      authorId: author.id,
    });

    return post;
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ posts: Post[]; total: number }> {
    const offset = (page - 1) * limit;

    const { count, rows } = await this.postModel.findAndCountAll({
      offset,
      limit,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          attributes: ['id', 'email', 'firstName', 'lastName', 'isActive'],
        },
      ],
      where: { isPublished: true },
    });

    return { posts: rows, total: count };
  }

  async findOne(id: number): Promise<Post> {
    const post = await this.postModel.findByPk(id, {
      include: [
        {
          model: User,
          attributes: ['id', 'email', 'firstName', 'lastName', 'isActive'],
        },
      ],
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    return post;
  }

  async findByAuthor(
    authorId: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ posts: Post[]; total: number }> {
    const offset = (page - 1) * limit;

    const { count, rows } = await this.postModel.findAndCountAll({
      where: { authorId },
      offset,
      limit,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          attributes: ['id', 'email', 'firstName', 'lastName', 'isActive'],
        },
      ],
    });

    return { posts: rows, total: count };
  }

  async update(
    id: number,
    updatePostDto: UpdatePostDto,
    user: User,
  ): Promise<Post> {
    const post = await this.findOne(id);

    if (post.authorId !== user.id) {
      throw new ForbiddenException('You can only update your own posts');
    }

    await post.update(updatePostDto);
    return post;
  }

  async remove(id: number, user: User): Promise<void> {
    const post = await this.findOne(id);

    if (post.authorId !== user.id) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    await post.destroy();
  }
}
