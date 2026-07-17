import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "../utils/asyncHandeler.js";
import { ErrorResponse } from "../utils/Error-Response.js";
import ApiResponse from "../utils/API-Response.js";
export const addCategory = asyncHandler(async (req, res) => {
    const { name, icon } = req.body?.para || {};
    const restaurant_id = req.admin?.restaurantId;
    if (!name || !restaurant_id) {
        res.status(400).json(new ErrorResponse(400, "Missing required parameter(s): name, restaurant_id"));
        return;
    }
    const restaurantExists = await prisma.restaurant.findUnique({
        where: { publicId: restaurant_id },
    });
    if (!restaurantExists) {
        res.status(404).json(new ErrorResponse(404, `Restaurant with id ${restaurant_id} not found`));
        return;
    }
    const category = await prisma.category.create({
        data: { name, restaurant_id, icon },
    });
    res.status(201).json(new ApiResponse(201, category, true, "Category created successfully"));
});
export const getCategoriesByRestaurant = asyncHandler(async (req, res) => {
    const restaurant_id = String(req.params.rid);
    const includeItems = req.query.incItem === "true";
    if (!restaurant_id) {
        res.status(400).json(new ErrorResponse(400, "Valid restaurant_id is required in URL param :r_id"));
        return;
    }
    const restaurantExists = await prisma.restaurant.findUnique({
        where: { publicId: restaurant_id },
    });
    if (!restaurantExists) {
        res.status(404).json(new ErrorResponse(404, `Restaurant ${restaurant_id} not found`));
        return;
    }
    const include = includeItems ? { items: { include: { variants: true } } } : {};
    const categories = await prisma.category.findMany({
        where: { restaurant_id },
        orderBy: { id: "asc" },
        include,
    });
    res.status(200).json(new ApiResponse(200, categories, true, "Categories fetched successfully"));
});
export const updateCategory = asyncHandler(async (req, res) => {
    const { category_id, name, icon } = req.body?.para || {};
    if (!category_id) {
        res.status(400).json(new ErrorResponse(400, "Missing 'category_id' in request body.para"));
        return;
    }
    const existingCategory = await prisma.category.findUnique({
        where: { publicId: category_id },
    });
    if (!existingCategory) {
        res.status(404).json(new ErrorResponse(404, `Category with id ${category_id} not found`));
        return;
    }
    const updateData = {};
    if (name !== undefined)
        updateData.name = name;
    if (icon !== undefined)
        updateData.icon = icon;
    if (Object.keys(updateData).length === 0) {
        res.status(400).json(new ErrorResponse(400, "No update fields provided (name or restaurant_id)"));
        return;
    }
    const updatedCategory = await prisma.category.update({
        where: { publicId: category_id },
        data: updateData,
    });
    res.status(200).json(new ApiResponse(200, updatedCategory, true, "Category updated successfully"));
});
export const deleteCategory = asyncHandler(async (req, res) => {
    let { categoryid } = req.params || {};
    categoryid = String(categoryid);
    if (!categoryid) {
        res.status(400).json(new ErrorResponse(400, "Missing 'categoryid' in request body.para"));
        return;
    }
    const existingCategory = await prisma.category.findUnique({
        where: { publicId: categoryid },
    });
    if (!existingCategory) {
        res.status(404).json(new ErrorResponse(404, `Category with id ${categoryid} not found`));
        return;
    }
    await prisma.category.delete({
        where: { publicId: categoryid },
    });
    res.status(200).json(new ApiResponse(200, null, true, "Category deleted successfully"));
});
