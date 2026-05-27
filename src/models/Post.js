// Model da tabela de postagens (as avaliacoes que o usuario escreve).

import { DataTypes } from 'sequelize';
import sequelize from '../config/orm.js';

const Post = sequelize.define('Post', {
  // Chave primaria.
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },

  // Titulo da avaliacao (ex: "Matrix", "O Senhor dos Aneis").
  titulo: {
    type: DataTypes.STRING,
    allowNull: false
  },

  // Categoria (filme, serie, livro, etc). Quando vem do OMDb,
  // setamos automaticamente baseado no Type retornado pela API.
  categoria: {
    type: DataTypes.STRING,
    allowNull: false
  },

  // Nota de 1 a 5.
  nota: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1, max: 5 }
  },

  // Texto da avaliacao.
  conteudo: {
    type: DataTypes.TEXT,
    allowNull: false
  },

  // URL do poster (capa do filme/serie). Vem do OMDb quando o usuario
  // escolhe via autocomplete. Fica null se for um titulo digitado a mao.
  posterUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },

  // ID do titulo no IMDb (ex: "tt0133093" pra Matrix). Salvamos pra
  // poder buscar mais detalhes depois se quiser (e evitar duplicatas).
  imdbId: {
    type: DataTypes.STRING,
    allowNull: true
  }

  // userId e criado automaticamente pela associacao User.hasMany(Post).
}, {
  tableName: 'postagens',
  timestamps: true
});

export default Post;
