const express = require('express');
const router = express.Router();
const { getAll, getById, create, update, remove } = require('../controllers/categoryController');
const auth = require('../middleware/auth');

router.get('/', getAll);
router.get('/:id', getById);
router.post('/', auth, create);
router.put('/:id', auth, update);
router.delete('/:id', auth, remove);

module.exports = router;
