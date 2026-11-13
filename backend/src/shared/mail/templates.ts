import type { MailMessage } from "./mail.js";


const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

function layout(heading: string, intro: string, buttonLabel: string, url: string, footer: string): string {
    return `<!doctype html>
    <html>
        <body style="margin:0;padding:24px;background:#f5f5f4;font-family:Arial,Helvetica,sans-serif;color:#1c1917;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
        <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:12px;padding:32px;">
        <tr><td>
        <p style="margin:0 0 4px;font-size:20px;font-weight:700;">Converge</p>
        <h1 style="margin:16px 0 8px;font-size:20px;">${escapeHtml(heading)}</h1>
        <p style="margin:0 0 24px;font-size:15px;line-height:1.5;color:#44403c;">${escapeHtml(intro)}</p>
        <a href="${escapeHtml(url)}" style="display:inline-block;background:#6d28d9;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:12px 24px;border-radius:8px;">${escapeHtml(buttonLabel)}</a>
        <p style="margin:24px 0 0;font-size:13px;line-height:1.5;color:#78716c;">If the button doesn't work, copy this link into your browser:<br><span style="word-break:break-all;">${escapeHtml(url)}</span></p>
        <p style="margin:16px 0 0;font-size:13px;color:#78716c;">${escapeHtml(footer)}</p>
        </td></tr>
        </table>
    </td></tr></table>
    </html>    
    `
}

export function verifyEmailMessage(to: string, firstName: string, url: string): MailMessage {
    const intro = `Hi ${firstName}, confirm your email address to finish setting up your Converge account. This link works for 24 hours.`;
    const footer = "If you didn't create an account, you can ignore this email.";

    return {
        to,
        subject: "Confirm your email for Converge",
        html: layout("Confirm your email", intro, "Confirm email", url, footer),
        text: `${intro}\n\n${url}\n\n${footer}`
    }
}

export function resetPasswordMessage(to: string, firstName: string, url: string): MailMessage {
    const intro = `Hi ${firstName}, we received a request to reset your Converge password. This link works for 1 hour and can be used once.`;
    const footer = "If you didn't ask for this, you can ignore this email. Your password won't change.";

    return {
        to,
        subject: "Reset your Converge password",
        html: layout("Reset your password", intro, "Choose a new password", url, footer),
        text: `${intro}\n\n${url}\n\n${footer}`
    }
}