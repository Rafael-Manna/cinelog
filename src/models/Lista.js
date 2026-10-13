import { DataTypes } from 'sequelize';
import sequelize from '../config/orm.js';

const Lista = sequelize.define('Lista', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  nome: { type: DataTypes.STRING, allowNull: false },
  descricao: { type: DataTypes.TEXT, allowNull: true }
}, {
  tableName: 'listas',
  timestamps: true
});

export default Lista;
