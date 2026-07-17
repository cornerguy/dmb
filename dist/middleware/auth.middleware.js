import { verifyAccessToken } from '../utils/jwt.js';
import { ErrorResponse } from '../utils/Error-Response.js';
import { prisma } from '../lib/prisma.js';
export const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    if (!accessToken) {
        res.status(401).json(new ErrorResponse(401, 'No access token provided'));
        return;
    }
    const decoded = verifyAccessToken(accessToken);
    if (!decoded) {
        res.status(401).json(new ErrorResponse(401, 'Invalid or expired access token'));
        return;
    }
    req.admin = decoded;
    next();
};
export const verifyRestaurantOwnership = (req, res, next) => {
    if (!req.admin?.restaurantId) {
        res.status(403).json(new ErrorResponse(403, 'Admin does not own any restaurant'));
        return;
    }
    if (req.admin.restaurantId !== req.body.para?.restaurant_id) {
        res.status(403).json(new ErrorResponse(403, 'Admin does not own any restaurant'));
        return;
    }
    req.restaurantOwned = { publicId: req.admin.restaurantId };
    next();
};
export const verifyCategoryOwnership = async (req, res, next) => {
    const categoryId = req.body?.para?.category_id || req.params.categoryid;
    if (!categoryId) {
        res.status(400).json(new ErrorResponse(400, 'category_id missing'));
        return;
    }
    if (!req.admin?.restaurantId) {
        res.status(403).json(new ErrorResponse(403, 'Admin has no restaurant'));
        return;
    }
    const category = await prisma.category.findUnique({
        where: { publicId: categoryId },
        select: { restaurant_id: true }
    });
    if (!category || category.restaurant_id !== req.admin.restaurantId) {
        res.status(403).json(new ErrorResponse(403, 'Category does not belong to your restaurant'));
        return;
    }
    next();
};
export const verifyItemOwnership = async (req, res, next) => {
    const itemId = req.body?.para?.item_id || req.params.itemid;
    if (!itemId) {
        res.status(400).json(new ErrorResponse(400, 'item_id missing in request body'));
        return;
    }
    if (!req.admin?.restaurantId) {
        res.status(403).json(new ErrorResponse(403, 'Admin has no associated restaurant'));
        return;
    }
    const item = await prisma.item.findUnique({
        where: { publicId: itemId },
        include: { category: { select: { restaurant_id: true } } }
    });
    if (!item) {
        res.status(404).json(new ErrorResponse(404, 'Item not found'));
        return;
    }
    if (item.category.restaurant_id !== req.admin.restaurantId) {
        res.status(403).json(new ErrorResponse(403, 'Item does not belong to your restaurant'));
        return;
    }
    next();
};
