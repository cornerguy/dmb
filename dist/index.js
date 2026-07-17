import app, { refreshOrigins } from "./app.js";
import { connectdb } from "./db/db.js";
import { PORT } from "./env.js";
app.listen(PORT, async () => {
    await refreshOrigins();
    await connectdb();
    console.log(`DIGITAL MENU BACKEND RUNNING ${PORT}`);
});
