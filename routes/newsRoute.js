const express    = require('express')
const router     = express.Router()
const fileupload = require('express-fileupload')
const {
  getAllNews, getNewsById, createNews, updateNews, deleteNews
} = require('../controller/newsController')
const { protect, authorize } = require('../middleware/auth')

const upload = fileupload({
  useTempFiles: true,
  tempFileDir: '/tmp/',
  limits: { fileSize: 10 * 1024 * 1024 }
})

router.get('/',     getAllNews)
router.get('/:id',  getNewsById)
router.post('/',    protect, authorize('user','editor','admin'), upload, createNews)
router.put('/:id',  protect, upload, updateNews)
router.delete('/:id', protect, deleteNews)

module.exports = router
