import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "../utils/asyncHandeler.js";
import { ErrorResponse } from "../utils/Error-Response.js";
import ApiResponse from "../utils/API-Response.js";
const toString = (val) => {
    if (typeof val === "string")
        return val;
    if (typeof val === "number")
        return String(val);
    return null;
};
const toNumber = (val) => {
    if (val === undefined || val === null || val === "")
        return null;
    const num = Number(val);
    return isNaN(num) ? null : num;
};
export const addItem = asyncHandler(async (req, res) => {
    const { name, description, price, category_id, variants, badges } = (req.body?.para || {});
    if (!name || !category_id) {
        res.status(400).json(new ErrorResponse(400, "Missing required fields: name, category_id"));
        return;
    }
    const categoryIdStr = toString(category_id);
    if (!categoryIdStr) {
        res.status(400).json(new ErrorResponse(400, "category_id must be a valid string"));
        return;
    }
    const category = await prisma.category.findUnique({ where: { publicId: categoryIdStr } });
    if (!category) {
        res.status(404).json(new ErrorResponse(404, `Category with id ${categoryIdStr} not found`));
        return;
    }
    const priceNum = toNumber(price);
    const hasPrice = priceNum !== null;
    const badgesToAdd = Array.isArray(badges) && badges.length > 0 && badges;
    const hasVariants = Array.isArray(variants) && variants.length > 0;
    if (hasPrice && hasVariants) {
        res.status(400).json(new ErrorResponse(400, "Cannot have both price and variants"));
        return;
    }
    if (!hasPrice && !hasVariants) {
        res.status(400).json(new ErrorResponse(400, "Must have either price or variants"));
        return;
    }
    let validatedVariants = [];
    if (hasVariants) {
        for (const v of variants) {
            const variant = v;
            const variantName = variant?.name;
            const variantPrice = toNumber(variant?.price);
            if (typeof variantName !== "string" || variantPrice === null) {
                res.status(400).json(new ErrorResponse(400, "Each variant must have a name string and numeric price"));
                return;
            }
            validatedVariants.push({ name: variantName, price: variantPrice });
        }
    }
    const data = { name, description: description || null, category_id: categoryIdStr, badges: badgesToAdd || [] };
    if (hasPrice)
        data.price = priceNum;
    if (hasVariants)
        data.variants = { create: validatedVariants };
    const item = await prisma.item.create({ data, include: { variants: true } });
    res.status(201).json(new ApiResponse(201, item, true, "Item created successfully"));
});
export const updateItem = asyncHandler(async (req, res) => {
    const { item_id, name, description, price, category_id, variants, badges } = req.body?.para || {};
    if (!item_id) {
        res.status(400).json(new ErrorResponse(400, "Missing 'item_id' in request body.para"));
        return;
    }
    const itemIdStr = toString(item_id);
    if (!itemIdStr) {
        res.status(400).json(new ErrorResponse(400, "item_id must be a valid string"));
        return;
    }
    const existingItem = await prisma.item.findUnique({
        where: { publicId: itemIdStr },
        include: { variants: true },
    });
    if (!existingItem) {
        res.status(404).json(new ErrorResponse(404, `Item with id ${itemIdStr} not found`));
        return;
    }
    const priceNum = toNumber(price);
    const hasPrice = priceNum !== null;
    const hasVariants = variants !== undefined;
    const badgesToadd = Array.isArray(badges) && badges.length > 0 && badges;
    const willHaveVariants = hasVariants && Array.isArray(variants) && variants.length > 0;
    if (hasPrice && hasVariants) {
        res.status(400).json(new ErrorResponse(400, "Cannot update both price and variants at the same time"));
        return;
    }
    if (hasVariants && !willHaveVariants) {
        res.status(400).json(new ErrorResponse(400, "If providing variants, at least one variant is required. To remove variants, switch to price mode."));
        return;
    }
    const updateData = {};
    if (name !== undefined)
        updateData.name = name;
    if (description !== undefined)
        updateData.description = description;
    if (badgesToadd !== false)
        updateData.badges = badgesToadd;
    if (category_id !== undefined) {
        const categoryIdStr = toString(category_id);
        if (!categoryIdStr) {
            res.status(400).json(new ErrorResponse(400, "category_id must be a valid string"));
            return;
        }
        const newCategory = await prisma.category.findUnique({ where: { publicId: categoryIdStr } });
        if (!newCategory) {
            res.status(404).json(new ErrorResponse(404, `Category with id ${categoryIdStr} not found`));
            return;
        }
        updateData.category_id = categoryIdStr;
    }
    if (hasPrice) {
        updateData.price = priceNum;
    }
    if (hasVariants) {
        updateData.price = null;
    }
    const updatedItem = await prisma.$transaction(async (tx) => {
        const item = await tx.item.update({
            where: { publicId: itemIdStr },
            data: updateData,
        });
        if (hasPrice) {
            await tx.variant.deleteMany({ where: { item_id: itemIdStr } });
        }
        else if (hasVariants) {
            await tx.variant.deleteMany({ where: { item_id: itemIdStr } });
            if (willHaveVariants) {
                await tx.variant.createMany({
                    data: variants.map((v) => ({
                        name: v.name,
                        price: toNumber(v.price),
                        item_id: itemIdStr,
                    })),
                });
            }
        }
        return tx.item.findUnique({
            where: { publicId: itemIdStr },
            include: { variants: true },
        });
    });
    res.status(200).json(new ApiResponse(200, updatedItem, true, "Item updated successfully"));
});
export const getItemsByCategory = asyncHandler(async (req, res) => {
    const category_id = req.params.cid;
    if (!category_id) {
        res.status(400).json(new ErrorResponse(400, "Missing 'c_id' query parameter"));
        return;
    }
    const categoryIdStr = toString(category_id);
    if (!categoryIdStr) {
        res.status(400).json(new ErrorResponse(400, "c_id must be a valid string"));
        return;
    }
    const items = await prisma.item.findMany({
        where: { category_id: categoryIdStr },
        orderBy: { name: "asc" },
        include: { variants: true },
    });
    res.status(200).json(new ApiResponse(200, items, true, "Items fetched successfully"));
});
export const deleteItem = asyncHandler(async (req, res) => {
    const { itemid } = (req.params || {});
    if (!itemid) {
        res.status(400).json(new ErrorResponse(400, "Missing 'itemid' in body.para"));
        return;
    }
    const itemIdStr = toString(itemid);
    if (!itemIdStr) {
        res.status(400).json(new ErrorResponse(400, "itemid must be a valid string"));
        return;
    }
    const existingItem = await prisma.item.findUnique({ where: { publicId: itemIdStr } });
    if (!existingItem) {
        res.status(404).json(new ErrorResponse(404, `Item with id ${itemIdStr} not found`));
        return;
    }
    await prisma.item.delete({ where: { publicId: itemIdStr } });
    res.status(200).json(new ApiResponse(200, null, true, "Item deleted successfully"));
});
