import { createApp } from "./app.js";
import { buildContainer } from "./container.js";
import { prisma } from "./lib/prisma.js";

const PORT = Number(process.env.PORT) | 8080;

createApp(buildContainer(prisma)).listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})