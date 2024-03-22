/* eslint-disable prettier/prettier */
import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService) { }
    login() {
        return {
            msg: 'Hello, i have signed in',
        };
    }
    async signup({ email, password }: AuthDto) {

        try {
            const hash = await argon.hash(password);

            const user = await this.prisma.user.create({
                data: {
                    email,
                    hash,
                },
            });

            delete user.hash;

            return user;
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError){
                if (error.code === 'P2002'){
                    throw new ForbiddenException("Email already exists");
                }        
            }
            throw error;
        }
    }
}