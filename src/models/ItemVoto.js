import { DataTypes } from 'sequelize';
import sequelize from '../config/orm.js';

const ItemVoto = sequelize.define('ItemVoto', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  voto: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { isIn: [['sim', 'nao']] }
  }
}, {
  tableName: 'lista_votos',
  timestamps: true,
  indexes: [{ unique: true, fields: ['itemId', 'userId'] }]
});

export default ItemVoto;
