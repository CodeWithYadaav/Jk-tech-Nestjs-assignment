import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { faker } from '@faker-js/faker';

import { PostService } from './post.service';
import { Post } from './entities/post.entity';
import { User } from '../user/entities/user.entity';

describe('PostService', () => {
  let service: PostService;
  let postModel: any;

  const mockPostModel = {
    create: vi.fn(),
    findOne: vi.fn(),
    findByPk: vi.fn(),
    findAndCountAll: vi.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostService,
        {
          provide: getModelToken(Post),
          useValue: mockPostModel,
        },
      ],
    }).compile();

    service = module.get<PostService>(PostService);
    postModel = module.get(getModelToken(Post));
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new post successfully', async () => {
      expect.assertions(2);

      const user = {
        id: faker.number.int({ min: 1, max: 1000 }),
        email: faker.internet.email(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
      } as User;

      const createPostDto = {
        title: faker.lorem.sentence(),
        content: faker.lorem.paragraphs(3),
        published: faker.datatype.boolean(),
      };

      const createdPost = {
        id: faker.number.int({ min: 1, max: 1000 }),
        title: createPostDto.title,
        content: createPostDto.content,
        isPublished: createPostDto.published,
        authorId: user.id,
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
      } as any;

      mockPostModel.create.mockResolvedValue(createdPost);

      const result = await service.create(createPostDto, user);

      expect(mockPostModel.create).toHaveBeenCalledWith({
        ...createPostDto,
        authorId: user.id,
      });
      expect(result).toEqual(createdPost);
    });
  });

  describe('findAll', () => {
    it('should return paginated posts', async () => {
      expect.assertions(3);

      const posts = [
        {
          id: 1,
          title: faker.lorem.sentence(),
          content: faker.lorem.paragraphs(3),
          isPublished: true,
          authorId: 1,
          createdAt: faker.date.past(),
          updatedAt: faker.date.recent(),
        },
        {
          id: 2,
          title: faker.lorem.sentence(),
          content: faker.lorem.paragraphs(3),
          isPublished: true,
          authorId: 2,
          createdAt: faker.date.past(),
          updatedAt: faker.date.recent(),
        },
      ] as any[];
      const total = 2;

      mockPostModel.findAndCountAll.mockResolvedValue({
        count: total,
        rows: posts,
      });

      const result = await service.findAll();

      expect(mockPostModel.findAndCountAll).toHaveBeenCalledWith({
        where: { isPublished: true },
        include: [
          {
            model: User,
            attributes: ['id', 'email', 'firstName', 'lastName', 'isActive'],
          },
        ],
        offset: 0,
        limit: 10,
        order: [['createdAt', 'DESC']],
      });
      expect(result.posts).toEqual(posts);
      expect(result.total).toBe(total);
    });
  });

  describe('findOne', () => {
    it('should return post when found', async () => {
      expect.assertions(2);

      const postId = 1;
      const post = {
        id: postId,
        title: faker.lorem.sentence(),
        content: faker.lorem.paragraphs(3),
        isPublished: true,
        authorId: 1,
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
      } as Post;

      mockPostModel.findByPk.mockResolvedValue(post);

      const result = await service.findOne(postId);

      expect(mockPostModel.findByPk).toHaveBeenCalledWith(postId, {
        include: [
          {
            model: User,
            attributes: ['id', 'email', 'firstName', 'lastName', 'isActive'],
          },
        ],
      });
      expect(result).toEqual(post);
    });

    it('should throw NotFoundException when post not found', async () => {
      expect.assertions(2);

      const postId = 999;
      mockPostModel.findByPk.mockResolvedValue(null);

      await expect(service.findOne(postId)).rejects.toThrow(NotFoundException);
      expect(mockPostModel.findByPk).toHaveBeenCalledWith(postId, {
        include: [
          {
            model: User,
            attributes: ['id', 'email', 'firstName', 'lastName', 'isActive'],
          },
        ],
      });
    });
  });

  describe('update', () => {
    it('should update post when user is owner', async () => {
      expect.assertions(3);

      const postId = 1;
      const user = {
        id: 1,
        email: faker.internet.email(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
      } as User;

      const updatePostDto = {
        title: faker.lorem.sentence(),
        content: faker.lorem.paragraphs(2),
        published: faker.datatype.boolean(),
      };

      const existingPost = {
        id: postId,
        title: 'Old Title',
        content: 'Old Content',
        isPublished: false,
        authorId: user.id,
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
        update: vi.fn().mockResolvedValue(undefined),
      } as any;

      vi.spyOn(service, 'findOne').mockResolvedValue(existingPost);

      const result = await service.update(postId, updatePostDto, user);

      expect(service.findOne).toHaveBeenCalledWith(postId);
      expect(existingPost.update).toHaveBeenCalledWith(updatePostDto);
      expect(result).toEqual(existingPost);
    });

    it('should throw ForbiddenException when user is not owner', async () => {
      expect.assertions(2);

      const postId = 1;
      const user = {
        id: 2,
        email: faker.internet.email(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
      } as User;

      const updatePostDto = {
        title: faker.lorem.sentence(),
        content: faker.lorem.paragraphs(2),
        published: faker.datatype.boolean(),
      };

      const existingPost = {
        id: postId,
        title: 'Old Title',
        content: 'Old Content',
        isPublished: false,
        authorId: 1,
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
        update: vi.fn().mockResolvedValue(undefined),
      } as any;

      vi.spyOn(service, 'findOne').mockResolvedValue(existingPost);

      await expect(service.update(postId, updatePostDto, user)).rejects.toThrow(
        ForbiddenException,
      );
      expect(service.findOne).toHaveBeenCalledWith(postId);
    });
  });

  describe('remove', () => {
    it('should remove post when user is owner', async () => {
      expect.assertions(2);

      const postId = 1;
      const user = {
        id: 1,
        email: faker.internet.email(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
      } as User;

      const existingPost = {
        id: postId,
        title: faker.lorem.sentence(),
        content: faker.lorem.paragraphs(3),
        isPublished: true,
        authorId: user.id,
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
        destroy: vi.fn().mockResolvedValue(undefined),
      } as any;

      vi.spyOn(service, 'findOne').mockResolvedValue(existingPost);

      await service.remove(postId, user);

      expect(service.findOne).toHaveBeenCalledWith(postId);
      expect(existingPost.destroy).toHaveBeenCalled();
    });

    it('should throw ForbiddenException when user is not owner', async () => {
      expect.assertions(2);

      const postId = 1;
      const user = {
        id: 2,
        email: faker.internet.email(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
      } as User;

      const existingPost = {
        id: postId,
        title: faker.lorem.sentence(),
        content: faker.lorem.paragraphs(3),
        isPublished: true,
        authorId: 1,
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
        destroy: vi.fn().mockResolvedValue(undefined),
      } as any;

      vi.spyOn(service, 'findOne').mockResolvedValue(existingPost);

      await expect(service.remove(postId, user)).rejects.toThrow(
        ForbiddenException,
      );
      expect(service.findOne).toHaveBeenCalledWith(postId);
    });
  });
});
