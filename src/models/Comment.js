// Model da tabela de comentarios feitos nas postagens.

import { DataTypes } from 'sequelize';
import sequelize from '../config/orm.js';

const Comment = sequelize.define('Comment', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },

  // O texto do comentario.
  conteudo: {
    type: DataTypes.TEXT,
    allowNull: false
  },

  // Se esse comentario for uma RESPOSTA a outro comentario, parentId
  // guarda o ID do comentario pai. Se for um comentario "raiz" (direto no post),
  // parentId fica null.
  // Limitamos a apenas 1 nivel de aninhamento: respostas nao podem ter respostas.
  parentId: {
    type: DataTypes.INTEGER,
    allowNull: true
  }

  // userId (autor) e postId (postagem que recebeu o comentario) sao criados
  // automaticamente pelas associacoes em associacoes.js
}, {
  tableName: 'comentarios',
  timestamps: true
});

export default Comment;
