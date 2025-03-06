var express = require('express');
const { ConnectionCheckOutFailedEvent } = require('mongodb');
var router = express.Router();
let productModel = require('../schemas/product')


function buildQuery(obj){
  console.log(obj);
  let result = {};
  if(obj.name){
    result.name=new RegExp(obj.name,'i');
  }
  result.price = {};
  if(obj.price){
    if(obj.price.$gte){
      result.price.$gte = obj.price.$gte;
    }else{
      result.price.$gte = 0
    }
    if(obj.price.$lte){
      result.price.$lte = obj.price.$lte;
    }else{
      result.price.$lte = 10000;
    }
    
  }
  return result;
}

router.get('/', async function(req, res, next) {
  try {
    let query = buildQuery(req.query);
    let products = await productModel.find(query);
    res.status(200).send({
      success: true,
      data: products
    });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
});

router.get('/:id', async function(req, res, next) {
  try {
    let id = req.params.id;
    let query = { _id: id, $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }] };
    let product = await productModel.findOne(query);
    if (!product) {
      return res.status(404).send({ success: false, message: 'Product not found' });
    }
    res.status(200).send({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(404).send({
      success: false,
      message: 'Invalid ID format'
    });
  }
});

router.post('/', async function(req, res, next) {
  try {
    let newProduct = new productModel({
      name: req.body.name,
      price:req.body.price,
      quantity: req.body.quantity,
      category:req.body.category
    })
    await newProduct.save();
    res.status(200).send({
      success:true,
      data:newProduct
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
    let updatedProduct = await productModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedProduct) {
      return res.status(404).send({ success: false, message: 'Product not found' });
    }
    res.status(200).send({ success: true, data: updatedProduct });
  } catch (error) {
    res.status(400).send({ success: false, message: error.message });
  }
});

router.delete('/:id', async function(req, res, next) {
  try {
    let deletedProduct = await productModel.findById(req.params.id);
    if (!deletedProduct) {
      return res.status(404).send({ success: false, message: 'Product not found' });
    }
    deletedProduct.isDeleted = true;
    deletedProduct.updatedAt = new Date();
    await deletedProduct.save();
    res.status(200).send({ success: true, message: 'Product soft deleted', data: deletedProduct });
  } catch (error) {
    res.status(400).send({ success: false, message: error.message });
  }
});

module.exports = router;