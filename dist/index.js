import app from "./app.js";
import { connectdb } from "./db/db.js";
import { PORT } from "./env.js";
const startServer = async () => {
    try {
        await connectdb();
        app.listen(PORT, () => {
            console.log(`DIGITAL MENU BACKEND RUNNING ${PORT}`);
        });
    }
    catch (error) {
        console.error("Failed to connect to database:", error);
        process.exit(1);
    }
};
startServer();
