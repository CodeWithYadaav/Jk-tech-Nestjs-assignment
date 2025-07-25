import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { Post } from './entities/post.entity';

@Module({
  imports: [SequelizeModule.forFeature([Post])],
  controllers: [PostController],
  providers: [PostService],
  exports: [PostService],
})
export class PostModule {}
