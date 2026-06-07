const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/authMiddleware');

// ---------------- GET ALL PRODUCTS ----------------
router.get('/', async (req, res, next) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    next(error);
  }
});

// ---------------- GET SINGLE PRODUCT ----------------
router.get('/:id', async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    res.json(product);
  } catch (error) {
    next(error);
  }
});

// ---------------- CREATE PRODUCT (ADMIN ONLY) ----------------
router.post('/', protect, admin, async (req, res, next) => {
  const {
    name,
    description,
    price,
    countInStock,
    imageUrl,
    category,
    brand,
  } = req.body;

  try {
    const product = new Product({
      name,
      description,
      price,
      countInStock,
      imageUrl,
      category,
      brand,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    next(error);
  }
});

// ---------------- UPDATE PRODUCT (ADMIN ONLY) ----------------
router.put('/:id', protect, admin, async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    product.name = req.body.name || product.name;
    product.description = req.body.description || product.description;
    product.price = req.body.price || product.price;
    product.countInStock = req.body.countInStock || product.countInStock;
    product.imageUrl = req.body.imageUrl || product.imageUrl;
    product.category = req.body.category || product.category;
    product.brand = req.body.brand || product.brand;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    next(error);
  }
});

// ---------------- DELETE PRODUCT (ADMIN ONLY) ----------------
router.delete('/:id', protect, admin, async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    await product.deleteOne();

    res.json({ message: 'Product removed' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;