const NewsCategory = require('../models/Category')
const News  = require('../models/News')
const path = require('path')
const cloudinary = require('../config/cloudinary')

exports.getAllCategories = async (req, res, next) => {
    try {
        const categories = await NewsCategory.find().sort({ createdAt: -1 })
        res.status(200).json({
            success: true,
            count: categories.length,
            data: categories
        })
    } catch (err) {
        res.status(400).json({ success: false, error: err.message })
    }
}

exports.getCategoryById = async (req, res, next) => {
    try {
        const category = await NewsCategory.findById(req.params.id)
        if (!category) {
            return res.status(404).json({ success: false, message: 'Категори олдсонгүй' })
        }
        res.status(200).json({ success: true, data: category })
    } catch (err) {
        res.status(400).json({ success: false, error: err.message })
    }
}

exports.createCategory = async (req, res) => {
  try {
    let photo = 'no-photo.jpg'
    if (req.files && req.files.photo) {
      const file = req.files.photo
      const result = await cloudinary.uploader.upload(
        `data:${file.mimetype};base64,${file.data.toString('base64')}`,
        { folder: 'categories' }
      )
      photo = result.secure_url
    }
    const category = await NewsCategory.create({ ...req.body, photo })
    res.status(201).json({ success: true, data: category })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

exports.updateCategory = async (req, res) => {
  try {
    const updates = { ...req.body }
    if (req.files && req.files.photo) {
      const file = req.files.photo
      const result = await cloudinary.uploader.upload(
        `data:${file.mimetype};base64,${file.data.toString('base64')}`,
        { folder: 'categories' }
      )
      updates.photo = result.secure_url
    }
    const category = await NewsCategory.findByIdAndUpdate(req.params.id, updates, { new: true })
    res.status(200).json({ success: true, data: category })
  } catch (err) {
    res.status(400).json({ success: false, error: err.message })
  }
}

exports.deleteCategory = async (req, res, next) => {
    try {
        const category = await NewsCategory.findById(req.params.id)
        if (!category) {
            return res.status(404).json({ success: false, message: 'Категори олдсонгүй' })
        }
        const deleted = await News.deleteMany({ category: req.params.id })
        await category.deleteOne()
        res.status(200).json({
            success: true,
            message: `Категори болон ${deleted.deletedCount} мэдээ устгагдлаа`
        })
    } catch (err) {
        res.status(400).json({ success: false, error: err.message })
    }
}
