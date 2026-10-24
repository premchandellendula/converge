import type { Prisma, PrismaClient, User } from "../../generated/prisma/client.js";
import { BaseDao } from "../../shared/dao/base.dao.js";

export const meSelect = {
    id: true, firstName: true, lastName: true, email: true, phone: true, role: true,
    isEmailVerified: true,
    applicant: { select: { id: true } },
    recruiter: { select: { id: true } },
} satisfies Prisma.UserSelect;

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
    readMe(id: string) {
        return this.prisma.user.findUnique({ where: { id }, select: meSelect });
    }
}
