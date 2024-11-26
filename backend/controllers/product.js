const { Product } = require('../models');
const multer = require('multer');
const uploadToCloudinary = require('../middlewares/upload-cloud');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');

// Middleware de upload em memória
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Formato de arquivo não suportado. Apenas JPG e PNG são aceitos.'));
    }
  },
});

// Criar produto
const createProduct = [
  upload.single('productImage'),
  uploadToCloudinary,
  body('name').notEmpty().withMessage('Nome é obrigatório'),
  body('price').isNumeric().withMessage('O preço deve ser numérico'),

  async (req, res) => {
    try {
      const transformedData = {
        ...req.body,
        id: uuidv4(),
        name: req.body.name.toLowerCase(),
        productImage: req.cloudinaryUrl || null,
        expiryDate: new Date(),
      };

      const product = await Product.create(transformedData);
      return res.status(201).json(product);
    } catch (error) {
      console.error('Erro ao criar produto:', error.message);
      return res.status(500).json({ error: error.message });
    }
  },
];

// Atualizar produto
const updateProductById = [
  upload.single('productImage'),
  uploadToCloudinary,
  body('name').optional().notEmpty().withMessage('Nome não pode estar vazio'),
  body('price').optional().isNumeric().withMessage('O preço deve ser numérico'),

  async (req, res) => {
    try {
      console.log('Arquivo recebido pelo multer:', req.file);

      const { id } = req.params;
      const product = await Product.findOne({ where: { id } });

      if (!product) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }

      const updatedData = { ...req.body };

      if (req.cloudinaryUrl) {
        console.log('Nova URL do Cloudinary:', req.cloudinaryUrl);
        updatedData.productImage = req.cloudinaryUrl;
      } else {
        console.log('Nenhuma nova URL do Cloudinary disponível.');
      }

      await product.update(updatedData);
      console.log('Produto atualizado com sucesso:', updatedData);

      return res.status(200).json(product);
    } catch (error) {
      console.error('Erro ao atualizar produto:', error.message);
      return res.status(500).json({ error: error.message });
    }
  },
];

// Buscar todos os produtos
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll({ order: [['createdAt', 'DESC']] });
    return res.status(200).json(products);
  } catch (error) {
    console.error('Erro ao buscar produtos:', error.message);
    return res.status(500).json({ error: error.message });
  }
};

// Buscar produto por ID
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findOne({ where: { id } });

    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    return res.status(200).json(product);
  } catch (error) {
    console.error('Erro ao buscar produto por ID:', error.message);
    return res.status(500).json({ error: error.message });
  }
};

// Deletar produto
const deleteProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = await Product.destroy({ where: { id } });

    if (!deletedProduct) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    return res.status(200).json({ message: 'Produto deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar produto:', error.message);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createProduct,
  updateProductById,
  getAllProducts,
  getProductById,
  deleteProductById,
};
