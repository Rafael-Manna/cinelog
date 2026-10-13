import { DataTypes } from 'sequelize';
import sequelize from '../config/orm.js';

const ListaMembro = sequelize.define('ListaMembro', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  papel: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'membro',
    validate: { isIn: [['dono', 'membro']] }
  }
}, {
  tableName: 'lista_membros',
  timestamps: true,
  indexes: [{ unique: true, fields: ['listaId', 'userId'] }]
});

export default ListaMembro;
