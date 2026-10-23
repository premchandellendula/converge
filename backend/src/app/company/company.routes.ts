import { Router } from "express";

export function createCompanyRouter(): Router {
    const router = Router();
    
    router.post("/:id");
    router.get("/:id/jobs");
    router.patch("/:id"); // admin
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