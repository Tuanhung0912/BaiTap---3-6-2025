var express = require('express');
var router = express.Router();
let categoryModel = require('../schemas/category')



router.get('/', async function(req, res, next) {
    let categories = await categoryModel.find({ isDeleted: false });
    res.status(200).send({
      success: true,
      data: categories
    });
  });
  
router.get('/:id', async function(req, res, next) {
    try {
      let id = req.params.id;
      let category = await categoryModel.findOne({ _id: id, isDeleted: false });
      if (!category) {
        return res.status(404).send({
          success: false,
          message: "Không có ID phù hợp"
        });
      }
      res.status(200).send({
        success: true,
        data: category
      });
    } catch (error) {
      res.status(404).send({
        success: false,
        message: "Không có ID phù hợp"
      });
    }
  });

router.post('/', async function(req, res, next) {
  try {
    let newCategory = new categoryModel({
      name: req.body.name,
    })
    await newCategory.save();
    res.status(200).send({
      success:true,
      data:newCategory
    });
  } catch (error) {
    res.status(404).send({
      success:false,
      message:error.message
    });
  }
});

router.put('/:id', async function(req, res, next) {
    try {
      let id = req.params.id;
      let updatedCategory = await categoryModel.findByIdAndUpdate(id, req.body, { new: true });
      if (!updatedCategory) {
        return res.status(404).send({ success: false, message: "Không tìm thấy category" });
      }
      res.status(200).send({ success: true, data: updatedCategory });
    } catch (error) {
      res.status(400).send({ success: false, message: error.message });
    }
  });
  
router.delete('/:id', async function(req, res, next) {
    try {
      let id = req.params.id;
      let category = await categoryModel.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
      if (!category) {
        return res.status(404).send({ success: false, message: "Không tìm thấy category" });
      }
      res.status(200).send({ success: true, message: "Success" });
    } catch (error) {
      res.status(400).send({ success: false, message: error.message });
    }
  });


module.exports = router;