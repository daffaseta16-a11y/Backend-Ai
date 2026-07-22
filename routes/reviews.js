const express = require('express');
const router = express.Router();
const {
  getAll,
  getByProduct,
  getSummary,
  create,
  update,
  toggleStatus,
  remove
} = require('../controllers/reviewController');
const auth = require('../middleware/auth');
const {uploadSingle} = require('../middleware/upload');

router.get('/', getAll);
router.get('/product/:productId', getByProduct);
router.get('/product/:productId/summary', getSummary);
router.post('/', uploadSingle, create);
router.put('/:id', auth, uploadSingle, update);
router.patch('/:id/status', auth, toggleStatus);
router.delete('/:id', auth, remove);

module.exports = router;
