import type { Prisma, PrismaClient, User } from "../../generated/prisma/client.js";
import { BaseDao } from "../../shared/dao/base.dao.js";

export class UserDao extends BaseDao<
    User, 
    string,
    Prisma.UserCreateInput,
    Prisma.UserUpdateInput,
    Prisma.UserWhereInput
>{
    constructor(private readonly prisma: PrismaClient){
        super(prisma.user, "User")
    }

    readByEmail(email: string) {
        return this.prisma.user.findUnique({ where: { email } });
    }
}
