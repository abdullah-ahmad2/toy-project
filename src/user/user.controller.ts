/* eslint-disable prettier/prettier */
import { Controller, Get, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from '../auth/decorators/index';
import { JwtGuard } from '../auth/guard/index';

@UseGuards(JwtGuard)

@Controller('users')

export class UserController {

    @Get('me')
    getMe(@GetUser('') user: User) {
        return user
    }
}
