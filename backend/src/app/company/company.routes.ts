import { Router } from "express";
import type { CompanyController } from "./company.controller.js";

export function createCompanyRouter(controller: CompanyController): Router {
    const router = Router();
    
    router.get("/:id", controller.getCompany);
    router.get("/:id/jobs", controller.getJobsByCompany);
    router.patch("/:id", controller.updateCompany); // admin
    return router;
}

/*
JOBS
GET    /jobs                                 public (list, filters, sort)
GET    /jobs/facets                          public
GET    /jobs/:id                             public
POST   /jobs                                 Recruiter
PATCH  /jobs/:id                             Recruiter (edit, close, reopen)
DELETE /jobs/:id                             Recruiter (only when it has no applications)

APPLICATIONS                                 Candidate
POST   /jobs/:id/applications                (apply)
GET    /applications/me                      (my applications)
PATCH  /applications/:id/withdraw            (withdraw)

SKILLS
GET    /skills?q=node                        public (autocomplete for skill inputs)
*/