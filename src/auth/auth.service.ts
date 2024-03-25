/* eslint-disable prettier/prettier */
import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwt: JwtService,
        private config: ConfigService
    ) { }
    async login({ email, password }: AuthDto) {

        const user = await this.prisma.user.findUnique({
            where: {
                email,
            },
        });

        if (!user) throw new ForbiddenException('Credentials incorrect');

        const pwMatches = await argon.verify(user.hash, password);

        if (!pwMatches) throw new ForbiddenException('Credentials incorrect');

        return this.signToken(user.id, user.email);
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

            return this.signToken(user.id, user.email);

        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {
                    throw new ForbiddenException("Email already exists");
                }
            }
            throw error;
        }
    }

    async signToken(userId: number, email: string): Promise<{ access_token: string }> {

        const payload = {
            sub: userId,
            email,
        };

        const secret = this.config.get('JWT_SECRET');

        const token = await this.jwt.signAsync(payload, {
            expiresIn: '15m',
            secret: secret
        });

        return {
            access_token: token
        };

    }
}
