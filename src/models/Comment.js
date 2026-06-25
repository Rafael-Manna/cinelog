import { DataTypes } from 'sequelize';
import sequelize from '../config/orm.js';

const Comment = sequelize.define('Comment', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  conteudo: { type: DataTypes.TEXT, allowNull: false }
}, {
  tableName: 'comentarios',
  timestamps: true
});

export default Comment;
