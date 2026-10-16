// not needed but put for ref in future
export class AppError extends Error {
    constructor(
        message: string,
        public readonly statusCode = 500
    ) {
        super(message);
        this.name = new.target.name;
    }
}

export class NotFoundError extends AppError {
    constructor(resource: string){
        super(`${resource} not found`, 404);
    }
}