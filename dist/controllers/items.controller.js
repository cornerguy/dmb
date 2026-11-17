import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "../utils/asyncHandeler.js";
import { ErrorResponse } from "../utils/Error-Response.js";
import ApiResponse from "../utils/API-Response.js";
import { uploadImage } from "../utils/upload.js";
import { v4 as uuidv4 } from "uuid";
import { storage } from "../utils/storage/index.js";
import { UPLOAD_PUBLIC_BASE, S3_PUBLIC_URL_BASE } from "../env.js";
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
const parseImageUrl = (val) => {
    if (val === undefined)
        return { provided: false, value: null, valid: true };
    if (val === null || typeof val !== "string" || val.trim() === "") {
        return { provided: true, value: null, valid: true };
    }
    const trimmed = val.trim();
    const valid = /^https?:\/\/\S+$/i.test(trimmed) || trimmed.startsWith("/");
    return { provided: true, value: valid ? trimmed : null, valid };
};
const isManagedImageUrl = (url) => {
    if (!url)
        return false;
    return [UPLOAD_PUBLIC_BASE, S3_PUBLIC_URL_BASE].some((base) => !!base && url.startsWith(base.replace(/\/+$/, "")));
};
export const addItem = asyncHandler(async (req, res) => {
    const rawPara = req.body?.para;
    const para = typeof rawPara === 'string' ? JSON.parse(rawPara) : rawPara;
    const { name, description, price, category_id, variants, badges, available, imageURL } = para || {};
    const parsedImageUrl = parseImageUrl(imageURL);
    if (!parsedImageUrl.valid) {
        res.status(400).json(new ErrorResponse(400, "imageURL must be a valid http(s) URL"));
        return;
    }
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
    const existingItem = await prisma.item.findMany({
        where: {
            category_id: categoryIdStr,
            name: {
                equals: name,
                mode: "insensitive"
            }
        },
    });
    if (existingItem.length !== 0) {
        res.status(409).json(new ErrorResponse(409, "Existing name Already Exist"));
        return;
    }
    const priceNum = toNumber(price);
    const hasPrice = priceNum !== null;
    const badgesToAdd = Array.isArray(badges) && badges.length > 0 && badges;
    const hasVariants = Array.isArray(variants) && variants.length > 0;
    let ItemImageUrl = '';
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
    const data = { name, description: description || null, category_id: categoryIdStr, badges: badgesToAdd || [], imageURL: parsedImageUrl.value, available };
    if (hasPrice)
        data.price = priceNum;
    if (hasVariants)
        data.variants = { create: validatedVariants };
    let resStatus = { code: 201, msg: "Item created successfully" };
    if (req.file) {
        const publicUrl = await uploadImage(req.file.buffer, `itemsImages/${uuidv4()}.webp`);
        if (publicUrl) {
            ItemImageUrl = String(publicUrl);
            data.imageURL = ItemImageUrl;
        }
        else {
            resStatus.code = 207;
            resStatus.msg = "Item Added But Failed To Add Image";
        }
    }
    const item = await prisma.item.create({ data, include: { variants: true } });
    res.status(resStatus.code).json(new ApiResponse(resStatus.code, item, true, resStatus.msg));
    return;
});
export const updateItem = asyncHandler(async (req, res) => {
    const rawPara = req.body?.para;
    const para = typeof rawPara === 'string' ? JSON.parse(rawPara) : rawPara;
    const { item_id, name, description, price, category_id, variants, badges, removeImage, available, imageURL } = para || {};
    const parsedImageUrl = parseImageUrl(imageURL);
    if (!parsedImageUrl.valid) {
        res.status(400).json(new ErrorResponse(400, "imageURL must be a valid http(s) URL"));
        return;
    }
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
    updateData.available = available;
    if (name !== undefined)
        updateData.name = name;
    if (description !== undefined)
        updateData.description = description;
    if (badgesToadd !== false)
        updateData.badges = badgesToadd;
    if (name !== undefined) {
        const targetCategoryId = category_id !== undefined ? toString(category_id) : existingItem.category_id;
        if (targetCategoryId) {
            const duplicateItems = await prisma.item.findMany({
                where: {
                    category_id: targetCategoryId,
                    name: {
                        equals: name,
                        mode: "insensitive"
                    }
                },
            });
            if (duplicateItems.length !== 0 && duplicateItems[0]?.publicId !== itemIdStr) {
                res.status(409).json(new ErrorResponse(409, "Existing name Already Exist"));
                return;
            }
        }
    }
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
    let resStatus = { code: 200, msg: "Item Updated successfully" };
    if (removeImage || req.file || parsedImageUrl.provided) {
        if (existingItem.imageURL && isManagedImageUrl(existingItem.imageURL)) {
            try {
                await storage.delete(existingItem.imageURL);
            }
            catch (error) {
                console.log(error);
            }
        }
        if (req.file) {
            const publicUrl = await uploadImage(req.file.buffer, `itemsImages/${uuidv4()}.webp`);
            if (publicUrl) {
                updateData.imageURL = String(publicUrl);
            }
            else {
                updateData.imageURL = parsedImageUrl.value;
                resStatus.code = 207;
                resStatus.msg = "Item Updated But Failed To Add Image";
            }
        }
        else {
            updateData.imageURL = parsedImageUrl.value;
        }
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
    res.status(resStatus.code).json(new ApiResponse(resStatus.code, updatedItem, true, resStatus.msg));
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
    const { item_id } = (req.params || {});
    if (!item_id) {
        res.status(400).json(new ErrorResponse(400, "Missing 'itemid' in body.para"));
        return;
    }
    const itemIdStr = toString(item_id);
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
    if (existingItem.imageURL && isManagedImageUrl(existingItem.imageURL)) {
        try {
            await storage.delete(existingItem.imageURL);
        }
        catch (error) {
            console.log(error);
        }
    }
    res.status(200).json(new ApiResponse(200, null, true, "Item deleted successfully"));
});
