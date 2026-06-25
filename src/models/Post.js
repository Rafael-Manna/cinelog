import { DataTypes } from 'sequelize';
import sequelize from '../config/orm.js';

const Post = sequelize.define('Post', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  titulo: { type: DataTypes.STRING, allowNull: false },
  categoria: { type: DataTypes.STRING, allowNull: false },
  nota: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1, max: 5 }
  },
  conteudo: { type: DataTypes.TEXT, allowNull: false },
  posterUrl: { type: DataTypes.STRING, allowNull: true },
  imdbId: { type: DataTypes.STRING, allowNull: true }
}, {
  tableName: 'postagens',
  timestamps: true
});

export default Post;
