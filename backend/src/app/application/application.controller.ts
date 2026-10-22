import type { ApplicationService } from "./application.service.js";

export class ApplicationController {
    constructor(private readonly service: ApplicationService) {}
}