const express = require('express');
const router = express.Router();
const { getAll, create, update, remove } = require('../controllers/promotionController');
const auth = require('../middleware/auth');
const {uploadSingle} = require('../middleware/upload');

router.get('/', getAll);
router.post('/', auth, uploadSingle, create);
router.put('/:id', auth, uploadSingle, update);
router.delete('/:id', auth, remove);

module.exports = router;
