import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import * as pactum from 'pactum';
import { AuthDto } from '../src/auth/dto/index';
import { EditUserDto } from '../src/user/dto/index';
import { CreateBookmarkDto, EditBookmarkDto } from '../src/bookmark/dto/index';

/* eslint-disable prettier/prettier */
describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe(
        {
          whitelist: true
        }));
    await app.init();
    await app.listen(3333);

    prisma = app.get(PrismaService)
    await prisma.cleanDb()
    pactum.request.setBaseUrl('http://localhost:3333');
  })

  afterAll(async () => {
    await app.close();
  })

  describe('auth', () => {

    const dto: AuthDto = {
      email: 'qfB0F@example.com',
      password: '123',
    }

    describe('Sign up', () => {

      it('should throw if email empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            password: dto.password
          })
          .expectStatus(400)
      })

      it('should throw if password empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            email: dto.email
          })
          .expectStatus(400)
      })

      it('should throw if no body provided', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .expectStatus(400)
      })

      it('should sign up', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(201)
      })
    })

    describe('Login', () => {

      it('should throw if email empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            password: dto.password
          })
          .expectStatus(400)
      })

      it('should throw if password empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            email: dto.email
          })
          .expectStatus(400)
      })

      it('should throw if no body provided', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .expectStatus(400)
      })

      it('should sign in', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(201)
          .stores('userAt', 'access_token')
      })
    })
  })

  describe('users', () => {

    describe('Get me', () => {
      it('should get current user', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}'
          })
          .expectStatus(200)
      })
    })

    describe('Edit user', () => { 
      it('should edit user', () => {
        const dto: EditUserDto = {
          firstName: 'Jango',
        }
        return pactum
          .spec()
          .patch('/users')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}'
          })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.firstName)
      })
    })
  })

  describe('bookmarks', () => {

    describe('Get empty bookmarks', () => { 

      it('should get bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}'
          })
          .expectStatus(200)
      })
    })

    describe('Create bookmark', () => {
      const dto: CreateBookmarkDto = {
        title: 'First Bookmark',
        link: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      } 
      it('should create a bookmark', () => {
        return pactum
          .spec()
          .post('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}'
          })
          .withBody(dto)
          .expectStatus(201)
          .expectBodyContains(dto.title)
          .stores('bookmarkId', 'id')
      })
    })

    describe('Get bookmarks', () => { 
      it('should get bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}'
          })
          .expectStatus(200)
          .expectJsonLength(1)
      })
    })

    describe('Get bookmark by id', () => { 
      it('should get bookmark by id', () => {
        return pactum
          .spec()
          .get('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}'
          })
          .expectStatus(200)
      })
    })

    describe('Edit bookmark by id', () => { 
      const dto: EditBookmarkDto = {
        title: 'edited Bookmark',
        description: 'Description is now available',
      } 
      it('should edit bookmark by id', () => {
        return pactum
          .spec()
          .patch('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}'
          })
          .withBody(dto)
          .expectStatus(200)
      })
    })

    describe('Delete bookmark by id', () => { 
      it('should delete bookmark by id', () => {
        return pactum
          .spec()
          .delete('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}'
          })
          .expectStatus(200)
      })
    })

    describe('Get empty bookmarks', () => { 

      it('should get bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}'
          })
          .expectStatus(200)
          .expectJsonLength(0)
      })
    })
  })
})