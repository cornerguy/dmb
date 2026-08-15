import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "../utils/asyncHandeler.js";
import { ErrorResponse } from "../utils/Error-Response.js";
import ApiResponse from "../utils/API-Response.js";
export const addResturant = asyncHandler(async (req, res) => {
});
export const getRestaurantInfo = asyncHandler(async (req, res) => {
    const restaurant_id = String(req.params.rid) || undefined;
    if (!restaurant_id) {
        res.status(400).json(new ErrorResponse(400, "Missing 'restaurant_id' in request query r_id"));
        return;
    }
    const restaurant = await prisma.restaurant.findUnique({
        where: { publicId: restaurant_id },
    });
    if (!restaurant) {
        res.status(404).json(new ErrorResponse(404, `Restaurant with id ${restaurant_id} not found`));
        return;
    }
    res.status(200).json(new ApiResponse(200, restaurant, true, "Restaurant fetched successfully"));
});
export const updateRestaurantInfo = asyncHandler(async (req, res) => {
    const { restaurant_id, name, tagline, primaryColor, accentColor, tabStyle, logoUrl, backgroundUrl, roundness, showSearch, showItemCount, stickyNav, domain, showDivider, headerText, defaultImageUrl, showItemImage, headerLayout, logoShape, overlayStyle, overlayIntensity, headingFont, headerAlign, headerSize, categoryVariant, categorySize, itemSize, itemImagePosition, itemImageShape, currencySymbol, surfaceColor, boardEnabled, boardText } = req.body?.para || {};
    if (!restaurant_id) {
        res.status(400).json(new ErrorResponse(400, "Missing 'restaurant_id' in request body.para"));
        return;
    }
    const existing = await prisma.restaurant.findUnique({
        where: { publicId: restaurant_id },
    });
    if (!existing) {
        res.status(404).json(new ErrorResponse(404, `Restaurant with id ${restaurant_id} not found`));
        return;
    }
    const updateData = {};
    if (name !== undefined)
        updateData.name = name;
    if (tagline !== undefined)
        updateData.tagline = tagline;
    if (primaryColor !== undefined)
        updateData.primaryColor = primaryColor;
    if (accentColor !== undefined)
        updateData.accentColor = accentColor;
    if (tabStyle !== undefined)
        updateData.tabStyle = tabStyle;
    if (roundness !== undefined)
        updateData.roundness = roundness;
    if (showSearch !== undefined)
        updateData.showSearch = showSearch;
    if (showItemCount !== undefined)
        updateData.showItemCount = showItemCount;
    if (stickyNav !== undefined)
        updateData.stickyNav = stickyNav;
    if (logoUrl !== undefined)
        updateData.logoUrl = logoUrl;
    if (backgroundUrl !== undefined)
        updateData.backgroundUrl = backgroundUrl;
    if (showDivider !== undefined)
        updateData.showDivider = showDivider;
    if (headerText !== undefined)
        updateData.headerText = headerText;
    if (showItemImage !== undefined)
        updateData.showItemImage = showItemImage;
    if (defaultImageUrl !== undefined)
        updateData.defaultImageUrl = defaultImageUrl;
    if (headerLayout !== undefined)
        updateData.headerLayout = headerLayout;
    if (logoShape !== undefined)
        updateData.logoShape = logoShape;
    if (overlayStyle !== undefined)
        updateData.overlayStyle = overlayStyle;
    if (overlayIntensity !== undefined)
        updateData.overlayIntensity = overlayIntensity;
    if (headingFont !== undefined)
        updateData.headingFont = headingFont;
    if (headingFont !== undefined)
        updateData.headingFont = headingFont;
    if (headerAlign !== undefined)
        updateData.headerAlign = headerAlign;
    if (headerSize !== undefined)
        updateData.headerSize = headerSize;
    if (categorySize !== undefined)
        updateData.categorySize = categorySize;
    if (categoryVariant !== undefined)
        updateData.categoryVariant = categoryVariant;
    if (itemSize !== undefined)
        updateData.itemSize = itemSize;
    if (itemImagePosition !== undefined)
        updateData.itemImagePosition = itemImagePosition;
    if (itemImageShape !== undefined)
        updateData.itemImageShape = itemImageShape;
    if (currencySymbol !== undefined)
        updateData.currencySymbol = currencySymbol;
    if (surfaceColor !== undefined)
        updateData.surfaceColor = surfaceColor;
    if (boardEnabled !== undefined)
        updateData.boardEnabled = boardEnabled;
    if (boardText !== undefined && boardText !== null)
        updateData.boardText = boardText;
    if (Object.keys(updateData).length === 0) {
        res.status(400).json(new ErrorResponse(400, "No update fields provided (name, tagline, primaryColor, accentColor)"));
        return;
    }
    const updatedRestaurant = await prisma.restaurant.update({
        where: { publicId: restaurant_id },
        data: updateData,
    });
    res.status(200).json(new ApiResponse(200, updatedRestaurant, true, "Restaurant updated successfully"));
});
