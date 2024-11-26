const { Category, Product } = require('../models');
const { v4: uuidv4 } = require('uuid');
const transporter = require('../config/nodemailer');
const { body, validationResult } = require('express-validator');

// Middleware para validar os dados da categoria
const validateCategory = [
  body('name').notEmpty().withMessage('O nome da categoria é obrigatório'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

/**
 * Cria uma nova categoria e envia um e-mail de notificação
 * @param {*} req
 * @param {*} res
 * @returns Object
 */
const createCategory = [
  validateCategory,
  async (req, res) => {
    try {
      const category = await Category.create({ ...req.body, id: uuidv4() });

      // Configurar e enviar e-mail de notificação
      const mailOptions = {
        from: 'thiago.taroco@uncisal.edu.br',
        to: 'thiagortaroco@gmail.com',
        subject: 'Nova categoria criada',
        text: `Uma nova categoria foi criada: ${category.name}`,
        html: `<p>Uma nova categoria foi criada: <strong>${category.name}</strong></p>`,
      };

      await transporter.sendMail(mailOptions);

      return res.status(201).json({
        message: 'Categoria criada com sucesso!',
        category,
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },
];

/**
 * Busca todas as categorias ordenadas por data de criação
 * @param {*} req
 * @param {*} res
 * @returns Object
 */
const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      order: [['createdAt', 'DESC']],
    });
    return res.status(200).json(categories);
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

/**
 * Busca uma categoria pelo ID
 * @param {*} req
 * @param {*} res
 * @returns Object
 */
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findOne({
      where: { id },
    });

    if (category) {
      return res.status(200).json(category);
    }

    return res.status(404).json({ error: 'Categoria não encontrada' });
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

/**
 * Atualiza uma categoria pelo ID e envia um e-mail de notificação
 * @param {*} req
 * @param {*} res
 * @returns Object
 */
const updateCategory = [
  validateCategory,
  async (req, res) => {
    try {
      const { id } = req.params;
      const [updated] = await Category.update(req.body, { where: { id } });

      if (updated) {
        const updatedCategory = await Category.findOne({
          where: { id },
          include: [Product],
        });

        // Configurar e enviar e-mail de notificação
        const mailOptions = {
          from: 'thiago.taroco@uncisal.edu.br',
          to: 'thiagortaroco@gmail.com',
          subject: 'Categoria Atualizada',
          text: `A categoria "${updatedCategory.name}" foi atualizada com sucesso!`,
          html: `<p>A categoria <strong>${updatedCategory.name}</strong> foi atualizada com sucesso!</p>`,
        };

        await transporter.sendMail(mailOptions);

        return res.status(200).json({
          message: 'Categoria atualizada com sucesso!',
          category: updatedCategory,
        });
      }

      return res.status(404).json({ error: 'Categoria não encontrada' });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },
];

/**
 * Deleta uma categoria pelo ID
 * @param {*} req
 * @param {*} res
 * @returns Object
 */
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Category.destroy({ where: { id } });

    if (deleted) {
      return res.status(200).json({ message: 'Categoria deletada com sucesso' });
    }

    return res.status(404).json({ error: 'Categoria não encontrada' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
