import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    barcode: {
        type: String,
    },
    type: {
        type: String,
    },
    category: {
        type: String,
    },
    nutritions: {
        type: String,
    },
    ingredients: {
        type: String,
    },
    carbonFootprint: {
        type: String,
    },
});

export const Product = mongoose.model("Product", productSchema);
