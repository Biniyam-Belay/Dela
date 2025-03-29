// backend/src/routes/categoryRoutes.js
import express from 'express';
// Remove createCategory import
import { getAllCategories } from '../controllers/categoryController.js';
// No need for protect/authorize here

const router = express.Router();

router.route('/')
  .get(getAllCategories); // Only keep GET for public viewing
  // REMOVED .post(createCategory);

export default router;