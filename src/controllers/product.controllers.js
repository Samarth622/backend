import { Product } from "../models/product.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { chatgptResponse } from "../utils/chatgptRespinse.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

let analysis, productData, productDescription, healthMeter;

const productAnalysis = async (req, res) => {
    const { barcode, token } = req.body

    if (!token) {
        throw new ApiError(401, "Unauthorized User or Invalid token !!!");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id).select("-password");

    if (!user) {
        throw new ApiError(401, "Invalid Access Token. User not found.");
    }

    const product = await Product.findOne({ barcode });

    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    const { result, description, HM } = await chatgptResponse(
        product,
        user.allergies,
        user.medicalHistory
    );

    if (!result) {
        throw new ApiError(401, "Chat Gpt response error");
    }

    analysis = result;
    productData = product;
    productDescription = description;
    healthMeter = HM;

    console.log(analysis);
    console.log(productDescription);
    console.log(healthMeter);

    return res.status(200).json(new ApiResponse(200, "Analysis successfully"));
};

const productAna = async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        throw new ApiError(401, "Unauthorized User or Invalid token !!!");
    }

    const token = authHeader.split(" ")[1];
    const { name } = req.query;

    console.log(name);

    console.log(token);

    if (!token) {
        throw new ApiError(401, "Unauthorized User or Invalid token !!!");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id).select("-password");

    if (!user) {
        throw new ApiError(401, "Invalid Access Token. User not found.");
    }

    const product = await Product.findOne({name});

    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    const { result, description, HM } = await chatgptResponse(
        product,
        user.allergies,
        user.medicalHistory
    );

    if (!result) {
        throw new ApiError(401, "Chat Gpt response error");
    }

    analysis = result;
    productData = product;
    productDescription = description;
    healthMeter = HM;

    console.log(analysis);
    console.log(productDescription);
    console.log(healthMeter);

    return res.status(200).json(new ApiResponse(200, "Analysis successfully"));
};

const analysisDetail = async (req, res) => {
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { analysis, productData, productDescription, healthMeter },
                "Product Analysis"
            )
        );
};

const allProduct = async (req, res) => {
    try {
        // Get the category from query parameters (if provided)
        const category = req.query.category;
        console.log(category);

        // If category is provided, filter products by category, otherwise return all products
        const products = category
            ? await Product.find({ category }) // Filter products by category
            : await Product.find(); // Return all products if no category is provided

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    products,
                    category
                        ? `Getting Products for Category: ${category}`
                        : "Getting All Products"
                )
            );
    } catch (error) {
        // Handle errors and return an appropriate response
        throw new ApiError(404, "Error fetching products");
    }
};

export { productAnalysis, analysisDetail, allProduct, productAna };
