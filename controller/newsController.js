const News      = require('../models/News')
const Category  = require('../models/Category')
const cloudinary = require('../config/cloudinary')

const uploadToCloudinary = async (file, folder) => {
  const source = file.tempFilePath || (() => {
    const b64 = file.data.toString('base64')
    return `data:${file.mimetype};base64,${b64}`
  })()
  const result = await cloudinary.uploader.upload(source, { folder })
  return result.secure_url
}

exports.getAllNews = async (req, res) => {
  try {
    const { category, page = 1, limit = 9, search } = req.query
    const query = { isPublished: true }

    if (category && category !== 'Бүгд') {
      const cat = await Category.findOne({ name: category })
      if (cat) query.category = cat._id
      else return res.json({ success: true, data: [], total: 0, pages: 0, currentPage: 1 })
    }

    if (search) query.title = { $regex: search, $options: 'i' }

    const total = await News.countDocuments(query)
    const news  = await News.find(query)
      .populate('author',   'name email role')
      .populate('category', 'name photo')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))

    res.json({ success: true, data: news, total, pages: Math.ceil(total / limit), currentPage: Number(page) })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

exports.getNewsById = async (req, res) => {
  try {
    const news = await News.findById(req.params.id)
      .populate('author',   'name email role')
      .populate('category', 'name photo description')

    if (!news) return res.status(404).json({ success: false, message: 'Мэдээ олдсонгүй' })

    await News.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } })
    res.json({ success: true, data: news })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

exports.createNews = async (req, res) => {
  try {
    const { title, content, category } = req.body

    const cat = await Category.findById(category)
    if (!cat) return res.status(400).json({ success: false, message: 'Категори олдсонгүй' })

    let image = 'no-photo.jpg'
    if (req.files && req.files.image) {
      image = await uploadToCloudinary(req.files.image, 'news')
    }

    const news = await News.create({ title, content, category, image, author: req.user._id })
    await news.populate([
      { path: 'author',   select: 'name email' },
      { path: 'category', select: 'name photo' }
    ])

    res.status(201).json({ success: true, data: news })
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: Object.values(err.errors).map(e => e.message).join(', ') })
    }
    res.status(500).json({ success: false, message: err.message })
  }
}
exports.updateNews = async (req, res) => {
  try {
    console.log('=== updateNews эхэллээ ===')
    console.log('req.body:', req.body)
    console.log('req.files:', req.files ? Object.keys(req.files) : 'байхгүй')
    const news = await News.findById(req.params.id)
    if (!news) return res.status(404).json({ success: false, message: 'Мэдээ олдсонгүй' })
    if (news.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Хандах эрх байхгүй' })
    }
    const updates = { ...req.body }
    console.log('updates:', updates)
    if (req.files && req.files.image) {
      console.log('Зураг upload эхэллээ...')
      try {
        updates.image = await uploadToCloudinary(req.files.image, 'news')
        console.log('✅ Зураг URL:', updates.image)
      } catch (cloudErr) {
        console.log('❌ Cloudinary алдаа:', cloudErr.message)
        return res.status(500).json({ success: false, message: 'Зураг: ' + cloudErr.message })
      }
    }
    const updated = await News.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })
      .populate('author',   'name email')
      .populate('category', 'name photo')
    console.log('✅ Амжилттай хадгалагдлаа')
    res.json({ success: true, data: updated })
  } catch (err) {
    console.log('❌ updateNews алдаа:', err.message)
    console.log('Stack:', err.stack)
    res.status(500).json({ success: false, message: err.message })
  }
}
exports.deleteNews = async (req, res) => {
  try {
    const news = await News.findById(req.params.id)
    if (!news) return res.status(404).json({ success: false, message: 'Мэдээ олдсонгүй' })

    if (news.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Хандах эрх байхгүй' })
    }

    await news.deleteOne()
    res.json({ success: true, message: 'Мэдээ амжилттай устгагдлаа' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}
