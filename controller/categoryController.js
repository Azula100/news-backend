const NewsCategory = require('../models/Category')
const News         = require('../models/News')
const cloudinary   = require('../config/cloudinary')

const uploadToCloudinary = async (file, folder) => {
  const b64     = file.data.toString('base64')
  const dataUri = `data:${file.mimetype};base64,${b64}`
  const result  = await cloudinary.uploader.upload(dataUri, { folder })
  return result.secure_url
}

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await NewsCategory.find().sort({ createdAt: -1 })
    res.status(200).json({ success: true, count: categories.length, data: categories })
  } catch (err) {
    res.status(400).json({ success: false, error: err.message })
  }
}

exports.getCategoryById = async (req, res) => {
  try {
    const category = await NewsCategory.findById(req.params.id)
    if (!category) return res.status(404).json({ success: false, message: 'Категори олдсонгүй' })
    res.status(200).json({ success: true, data: category })
  } catch (err) {
    res.status(400).json({ success: false, error: err.message })
  }
}

exports.createCategory = async (req, res) => {
  try {
    const existing = await NewsCategory.findOne({ name: req.body.name?.trim() })
    if (existing) return res.status(400).json({ success: false, message: 'Энэ нэртэй категори аль хэдийн байна' })

    let photo = 'no-photo.jpg'
    if (req.files && req.files.photo) {
      photo = await uploadToCloudinary(req.files.photo, 'categories')
    }

    const category = await NewsCategory.create({ ...req.body, photo })
    res.status(201).json({ success: true, data: category })
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: Object.values(err.errors).map(e => e.message).join(', ') })
    }
    res.status(400).json({ success: false, error: err.message })
  }
}

exports.updateCategory = async (req, res) => {
  try {
    const updates = { ...req.body }

    if (req.files && req.files.photo) {
      updates.photo = await uploadToCloudinary(req.files.photo, 'categories')
    }
    const category = await NewsCategory.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })
    if (!category) return res.status(404).json({ success: false, message: 'Категори олдсонгүй' })
    res.status(200).json({ success: true, data: category })
  } catch (err) {
    res.status(400).json({ success: false, error: err.message })
  }
}
exports.deleteCategory = async (req, res) => {
  try {
    const category = await NewsCategory.findById(req.params.id)
    if (!category) return res.status(404).json({ success: false, message: 'Категори олдсонгүй' })

    const deleted = await News.deleteMany({ category: req.params.id })
    await category.deleteOne()

    res.status(200).json({ success: true, message: `Категори болон ${deleted.deletedCount} мэдээ устгагдлаа` })
  } catch (err) {
    res.status(400).json({ success: false, error: err.message })
  }
}
