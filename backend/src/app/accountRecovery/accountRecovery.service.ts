import bcrypt from "bcryptjs";
import type { MailService } from "../../shared/mail/mail.service.js";
import { Result, ResultCode } from "../../shared/result/result.js";
import type { AccountRecoveryDao } from "./accountRecovery.dao.js";

const VERIFY_TTL_MS = 24 * 60 * 60 * 1000;
const RESET_TTL_MS = 60 * 60 * 1000;

export class AccountRecoveryService {
    constructor(
        private readonly dao: AccountRecoveryDao,
        private readonly mail: MailService,
    ) {}

    async sendVerificationEmail(userId: string): Promise<Result<null>> {
        console.log(userId, "resendddd 00")
        const user = await this.dao.findByUserId(userId);
        console.log(user, "resendddd 0")
        if (!user) return new Result(true, ResultCode.NotFound, "User not found");
        if (user.isEmailVerified) return new Result(false, ResultCode.Success, "Your email is already verified");
        console.log(user, "resendddd 1")

        const token = await this.dao.issueToken(user.id, "VERIFY_EMAIL", VERIFY_TTL_MS);
        console.log(token, "resendddd 2")
        if(!token) return new Result(false, ResultCode.Success, "We just sent an email. Please wait a minute before asking again.")

        const sent = await this.mail.sendVerfiyEmail(user.email, user.firstName, token);
        if (!sent) return new Result(true, ResultCode.InternalServerError, "We couldn't send the email. Please try again later.");
        return new Result(false, ResultCode.Success, "Verification email sent");
    }

    async verifyEmail(token: string): Promise<Result<null>> {
        const found = await this.dao.findUsableToken(token, "VERIFY_EMAIL");
        if (!found) return new Result(true, ResultCode.BadRequest, "This link is invalid or has expired");

        await this.dao.completeVerification(found.id, found.userId);
        return new Result(false, ResultCode.Success, "Email verified");
    }

    /** Always answers the same, so nobody can use it to find out which emails have accounts. */
    async forgotPassword(email: string): Promise<Result<null>> {
        const user = await this.dao.findUserByEmail(email);
        if (user) {
            const token = await this.dao.issueToken(user.id, "RESET_PASSWORD", RESET_TTL_MS);
            if (token) await this.mail.sendPasswordReset(user.email, user.firstName, token);
        }
        return new Result(false, ResultCode.Success, "If an account exists for that email, we've sent a reset link");
    }

    async resetPassword(token: string, password: string): Promise<Result<null>> {
        const found = await this.dao.findUsableToken(token, "RESET_PASSWORD");
        if (!found) return new Result(true, ResultCode.BadRequest, "This link is invalid or has expired");

        const passwordHash = await bcrypt.hash(password, 12);
        await this.dao.completeReset(found.id, found.userId, passwordHash);
        return new Result(false, ResultCode.Success, "Password updated. You can log in now");
    }
}