import { DataTypes } from 'sequelize';
import sequelize from '../config/orm.js';

const Lista = sequelize.define('Lista', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  nome: { type: DataTypes.STRING, allowNull: false },
  descricao: { type: DataTypes.TEXT, allowNull: true }
}, {
  tableName: 'listas',
  timestamps: true,
  // Sem isto o Sequelize "singulariza" Lista para Listum (trata como plural
  // latino, tipo datum/data) e os includes chegam em item.Listum, nao item.Lista.
  name: { singular: 'Lista', plural: 'Listas' }
});

export default Lista;
