import { Router } from "express";
import { addCategory, deleteCategory, getCategoriesByRestaurant, updateCategory } from "../controllers/category.controller.js";
import { authenticate, verifyCategoryOwnership } from '../middleware/auth.middleware.js';
const categoryRouter = Router();
categoryRouter.route("/add").post(authenticate, addCategory);
categoryRouter.route("/get/:rid").get(getCategoriesByRestaurant);
categoryRouter.route("/update").patch(authenticate, verifyCategoryOwnership, updateCategory);
categoryRouter.route("/delete/:categoryid").delete(authenticate, verifyCategoryOwnership, deleteCategory);
export default categoryRouter;
