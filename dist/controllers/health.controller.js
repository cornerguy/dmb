import ApiResponse from "../utils/API-Response.js";
export const healthcheck = (req, res) => {
    res.json(new ApiResponse(200, null, true, "Health is OK!"));
};
