const express = require('express');
const router = express.Router();
const { getAll, getById, create, update, remove, getLatest, getRelated, addProductImages, deleteProductImage, reorderProductImages, getProductImages } = require('../controllers/productController');
const auth = require('../middleware/auth');
const { uploadSingle, uploadMultiple } = require('../middleware/upload');

router.get('/', getAll);
router.get('/latest', getLatest);
router.get('/:id', getById);
router.get('/:id/related', getRelated);
router.post("/", auth, uploadSingle, create);
router.put("/:id", auth, uploadSingle, update);
router.delete('/:id', auth, remove);

// Multiple images endpoints
router.post('/:id/images', auth, uploadMultiple, addProductImages);
router.delete('/:id/images/:imageId', auth, deleteProductImage);
router.put('/:id/images/reorder', auth, reorderProductImages);
router.get('/:id/images', getProductImages);

module.exports = router;