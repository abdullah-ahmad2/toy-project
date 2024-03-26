/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { CreateBookmarkDto, EditBookmarkDto } from './dto/index';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BookmarkService {

    constructor(private prisma: PrismaService) { }

    async getBookmarks(userId: number) {
        return await this.prisma.bookmark.findMany({
            where: {
                userId
            }
        });
    }

    async getBookmarkById(userId: number, bookmarkId: number) {
        return await this.prisma.bookmark.findFirst({
            where: {
                id: bookmarkId,
                userId
            }
        })
    }

    async createBookmark(userId: number, dto: CreateBookmarkDto) {
        const bookmark = await this.prisma.bookmark.create({
            data: {
                userId,
                ...dto
            }
        })
        return bookmark
    }

    editBookmarkById(userId: number, dto: EditBookmarkDto, bookmarkId: number) {
        const bookmark = this.prisma.bookmark.update({
            where: {
                id: bookmarkId,
                userId
            },
            data: {
                ...dto
            }
        })
        return bookmark
    }

    deleteBookmarkById(userId: number, bookmarkId: number) {
        return this.prisma.bookmark.delete({
            where: {
                id: bookmarkId,
                userId
            }
        })
    }
}
