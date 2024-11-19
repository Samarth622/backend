import { Product } from "../models/product.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { chatgptResponse } from "../utils/chatgptRespinse.js";
import jwt from "jsonwebtoken";
// import client from "../utils/cloudvision.js";
import vision from "@google-cloud/vision";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

let analysis, productData, productDescription, healthMeter;

const productAnalysis = asyncHandler(async (req, res) => {
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
});

const productAna =asyncHandler(async (req, res) => {
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
});

const analysisDetail = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { analysis, productData, productDescription, healthMeter },
                "Product Analysis"
            )
        );
});

const allProduct = asyncHandler(async (req, res) => {
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
});

const extractText = async (req, res) => {
    try {
        if (!req.file) {
            throw new ApiError(400, 'No image file provided');
        }

        // Validate file type
        if (!['image/jpeg', 'image/png', 'image/jpg'].includes(req.file.mimetype)) {
            throw new ApiError(400, 'Invalid file type. Only JPEG and PNG are allowed.');
        }

        // Log environment variables (for development/debugging)
        if (process.env.NODE_ENV === 'development') {
            console.log('Client Email:', process.env.GOOGLE_CLOUD_CLIENT_EMAIL);
            console.log('Project ID:', process.env.GOOGLE_CLOUD_PROJECT_ID);
        }

        // Initialize Vision API client
        const client = new vision.ImageAnnotatorClient({
            credentials: {
                client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
                private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            },
            projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
        });

        // Perform text detection on the image
        const [result] = await client.textDetection({
            image: {
                content: req.file.buffer,
            },
        });

        const detections = result.textAnnotations;

        if (!detections || detections.length === 0) {
            throw new ApiError(400, 'No text detected in the image');
        }

        // Extract the full text (from the first annotation)
        const extractedText = detections[0].description;

        console.log(extractedText);

        // Send response
        return res.status(200).json(new ApiResponse(200, { extractedText }, 'Text extracted successfully'));
    } catch (error) {
        console.error('Error processing image:', error);

        // Handle API-specific or validation errors
        if (error.code === 7) {
            throw new ApiError(500, 'Authentication error with Google Vision API. Check credentials.');
        }

        // Generic error
        throw new ApiError(500, 'Failed to process the image');
    }
};


export { productAnalysis, analysisDetail, allProduct, productAna, extractText };
