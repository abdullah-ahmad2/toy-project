import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';

/* eslint-disable prettier/prettier */
describe('App e2e', () => {
  let app: INestApplication;
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
  })
  afterAll(async () => {
    await app.close();
  })
  it.todo('should pass');
})