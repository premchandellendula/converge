import nodemailer, { type Transporter } from 'nodemailer'

export interface MailMessage {
    to: string;
    subject: string;
    html: string;
    text: string;
}

export interface MailSender {
    send(message: MailMessage): Promise<void>;
}

export class GmailMailSender implements MailSender {
    private readonly transport: Transporter;
    private readonly from: string;

    constructor(user: string, appPassword: string, fromName: string){
        this.transport = nodemailer.createTransport({
            service: "gmail",
            auth: { user, pass: appPassword },
            connectionTimeout: 10_000,
            greetingTimeout: 10_000,
            socketTimeout: 15_000
        });
        const safeName = fromName.replace(/["\r\n<>]/g, "");
        this.from = `"${safeName}" <${user}>`;
    }

    async send(m: MailMessage): Promise<void> {
        await this.transport.sendMail({ from: this.from, to: m.to, subject: m.subject, text: m.text, html: m.html });
    }
}

export class ConsoleMailSender implements MailSender {
    async send(message: MailMessage): Promise<void> {
        console.log(`\n--- EMAIL (not sent) ---\nTo: ${message.to}\nSubject:${message.subject}\n\n${message.text}\n------------------------\n`);
    }
}

export function createMailSender(): MailSender {
    const user = process.env.MAIL_USER;
    const pass = process.env.MAIL_APP_PASSWORD;
    if(!user || !pass){
        console.warn("MAIL_USER / MAIL_APP_PASSWORD are not set: emails will be printed to the console.");
        return new ConsoleMailSender();
    }

    return new GmailMailSender(user, pass, process.env.MAIL_FROM_NAME ?? "Converge");
}