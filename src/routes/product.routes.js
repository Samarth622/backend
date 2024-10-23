import { Router } from "express";
import { productAnalysis, analysisDetail, allProduct, productAna } from "../controllers/product.controllers.js"

export const productRouter = Router();

productRouter.route('/analysis').post(productAnalysis)
productRouter.route('/detail').get(analysisDetail)
productRouter.route('/allProducts').get(allProduct)
productRouter.route('/productAnalysis').get(productAna)
