import { Router } from "express";
import { productAnalysis, analysisDetail, allProduct, productAna, extractText } from "../controllers/product.controllers.js"
// import upload from "../middlewares/multer.js";
import multer from "multer";

export const productRouter = Router();

const upload = multer({
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    }
});

productRouter.route('/analysis').post(productAnalysis)
productRouter.route('/detail').get(analysisDetail)
productRouter.route('/allProducts').get(allProduct)
productRouter.route('/productAnalysis').get(productAna)
productRouter.route('/extractText').post(upload.single('image'), extractText);