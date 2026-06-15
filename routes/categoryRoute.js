const express    = require('express')
const router     = express.Router()
const fileupload = require('express-fileupload')
const {
  getAllCategories, getCategoryById, createCategory, updateCategory, deleteCategory
} = require('../controller/categoryController')
const { protect, authorize } = require('../middleware/auth')

const upload = fileupload({
  useTempFiles: true,
  tempFileDir: '/tmp/',
  limits: { fileSize: 10 * 1024 * 1024 }
})

router.get('/',      getAllCategories)
router.get('/:id',   getCategoryById)
router.post('/',     protect, authorize('admin'), upload, createCategory)
router.put('/:id',   protect, authorize('admin'), upload, updateCategory)
router.delete('/:id', protect, authorize('admin'), deleteCategory)

module.exports = router
