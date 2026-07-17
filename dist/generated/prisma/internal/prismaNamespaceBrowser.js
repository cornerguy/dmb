import * as runtime from "@prisma/client/runtime/index-browser";
export const Decimal = runtime.Decimal;
export const NullTypes = {
    DbNull: runtime.NullTypes.DbNull,
    JsonNull: runtime.NullTypes.JsonNull,
    AnyNull: runtime.NullTypes.AnyNull,
};
export const DbNull = runtime.DbNull;
export const JsonNull = runtime.JsonNull;
export const AnyNull = runtime.AnyNull;
export const ModelName = {
    RestaurantAdmin: 'RestaurantAdmin',
    Restaurant: 'Restaurant',
    Category: 'Category',
    Item: 'Item',
    Variant: 'Variant'
};
export const TransactionIsolationLevel = runtime.makeStrictEnum({
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
});
export const RestaurantAdminScalarFieldEnum = {
    id: 'id',
    publicId: 'publicId',
    username: 'username',
    password: 'password',
    refreshToken: 'refreshToken'
};
export const RestaurantScalarFieldEnum = {
    id: 'id',
    publicId: 'publicId',
    name: 'name',
    adminId: 'adminId',
    tagline: 'tagline',
    backgroundUrl: 'backgroundUrl',
    logoUrl: 'logoUrl',
    primaryColor: 'primaryColor',
    tabStyle: 'tabStyle',
    roundness: 'roundness',
    accentColor: 'accentColor',
    headerText: 'headerText',
    showSearch: 'showSearch',
    showItemCount: 'showItemCount',
    showDivider: 'showDivider',
    stickyNav: 'stickyNav',
    domain: 'domain'
};
export const CategoryScalarFieldEnum = {
    id: 'id',
    publicId: 'publicId',
    name: 'name',
    restaurant_id: 'restaurant_id',
    icon: 'icon'
};
export const ItemScalarFieldEnum = {
    id: 'id',
    publicId: 'publicId',
    name: 'name',
    description: 'description',
    price: 'price',
    category_id: 'category_id',
    badges: 'badges'
};
export const VariantScalarFieldEnum = {
    id: 'id',
    publicId: 'publicId',
    name: 'name',
    price: 'price',
    item_id: 'item_id'
};
export const SortOrder = {
    asc: 'asc',
    desc: 'desc'
};
export const QueryMode = {
    default: 'default',
    insensitive: 'insensitive'
};
export const NullsOrder = {
    first: 'first',
    last: 'last'
};
