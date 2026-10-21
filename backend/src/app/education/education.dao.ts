import type { Education, Prisma, PrismaClient } from "../../generated/prisma/client.js";
import { BaseDao } from "../../shared/dao/base.dao.js";
import type { EducationInput } from "../applicant/applicant.schema.js";

export class EducationDao extends BaseDao<
    Education,
    number,
    Prisma.EducationUncheckedCreateInput,
    Prisma.EducationUpdateInput,
    Prisma.EducationWhereInput
> {
    constructor(private readonly prisma: PrismaClient) {
        super(prisma.education, "education");
    }

    replaceForApplicant(applicantId: number, items: EducationInput[]) {
        return this.prisma.$transaction([
            this.prisma.education.deleteMany({ where: { applicantId } }),
            this.prisma.education.createMany({
                data: items.map((e) => ({ ...e, applicantId })),
            }),
        ]);
    }
}