import { toast } from "sonner";
import { ApiError } from "./request";

export function friendlyMessage(error: unknown): string {
    if (!(error instanceof ApiError)) return "Something went wrong. Try again.";

    if (error.status >= 500) return "Something went wrong on our side. Try again in a moment.";
    if (error.status === 403 && error.message === "Forbidden") return "You do not have permission to do that.";
    return error.message;
}

export function notifyError(error: unknown) {
    toast.error(friendlyMessage(error));
}

export function notifySuccess(message: string) {
    toast.success(message);
}