// Model que representa a relacao "X segue Y".
// E uma tabela intermediaria (de junção) entre User e User mesmo
// (auto-relacionamento), porque um usuario segue varios e e seguido por varios.

const { DataTypes } = require('sequelize');
const sequelize = require('../config/orm');

const Follow = sequelize.define('Follow', {
  // Quem esta seguindo.
  followerId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  // Quem esta sendo seguido.
  followingId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'follows',
  timestamps: true,

  // Garante que a mesma combinacao (A segue B) nao se repete.
  // Sem isso, o banco aceitaria 2 registros iguais.
  indexes: [
    {
      unique: true,
      fields: ['followerId', 'followingId']
    }
  ]
});

module.exports = Follow;
