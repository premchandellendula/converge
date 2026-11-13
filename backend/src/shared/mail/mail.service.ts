import type { MailSender } from "./mail.js";
import { resetPasswordMessage, verifyEmailMessage } from "./templates.js";

export class MailService {
    constructor(
        private readonly sender: MailSender,
        private readonly appUrl: string
    ) {}

    private link(path: string, token: string){
        return `${this.appUrl.replace(/\/$/, "")}${path}?token=${encodeURIComponent(token)}`;
    }

    // On Vercel a function can be frozen as soon as the response is sent, so callers should `await` this.
    private async safeSend(message: Parameters<MailSender["send"]>[0]): Promise<boolean> {
        try {
            await this.sender.send(message);
            return true;
        } catch (error) {
            console.error("Could not send email", error);
            return false;
        }
    }

    sendVerfiyEmail(to: string, firstName: string, token: string){
        return this.safeSend(verifyEmailMessage(to, firstName, this.link("/verify-email", token)));
    }

    sendPasswordReset(to: string, firstName: string, token: string) {
        return this.safeSend(resetPasswordMessage(to, firstName, this.link("/reset-password", token)));
    }
}