// Model = representacao de uma tabela do banco no codigo.
// Esse arquivo define como e a tabela de usuarios.

const { DataTypes } = require('sequelize');
const sequelize = require('../config/orm');

// sequelize.define(nome, colunas, opcoes) cria o model.
const User = sequelize.define('User', {
  // ID e a chave primaria. autoIncrement = o banco gera 1, 2, 3... sozinho.
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },

  // Nome do usuario. allowNull: false = obrigatorio.
  nome: {
    type: DataTypes.STRING,
    allowNull: false
  },

  // Email tem que ser unico (nao podem ter dois usuarios com mesmo email)
  // e tem que ter formato de email (validacao automatica do Sequelize).
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },

  // Senha. NUNCA salvamos a senha "crua" - guardamos o HASH dela (texto embaralhado
  // gerado pelo bcrypt). Por isso e um STRING comum, mas o conteudo nao e legivel.
  senha: {
    type: DataTypes.STRING,
    allowNull: false
  },

  // role = papel do usuario. ENUM significa que so aceita um desses dois valores.
  // Padrao e 'user' (usuario comum).
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    defaultValue: 'user',
    allowNull: false
  },

  // Bio do perfil. TEXT aceita textos longos. allowNull: true = opcional.
  bio: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  // Caminho da foto de perfil. Salvamos o caminho relativo a partir de /public
  // (ex: "/uploads/avatars/3_1716525432.jpg"). Quando null, a view mostra
  // um avatar gerado por CSS com a inicial do nome.
  avatarUrl: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  // Nome da tabela no banco (se nao definir, o Sequelize chuta pluralizando o model).
  tableName: 'usuarios',

  // timestamps: true -> Sequelize cria automaticamente as colunas
  // createdAt e updatedAt e gerencia elas pra voce.
  timestamps: true
});

module.exports = User;
