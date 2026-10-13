import { DataTypes } from 'sequelize';
import sequelize from '../config/orm.js';

const ListaItem = sequelize.define('ListaItem', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  titulo: { type: DataTypes.STRING, allowNull: false },
  categoria: { type: DataTypes.STRING, allowNull: false },
  ano: { type: DataTypes.STRING, allowNull: true },
  posterUrl: { type: DataTypes.STRING, allowNull: true },
  imdbId: { type: DataTypes.STRING, allowNull: true },
  // recalculado a cada voto / mudanca de membros (ver recalcularStatus no controller)
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'pendente',
    validate: { isIn: [['pendente', 'aprovado', 'rejeitado']] }
  }
}, {
  tableName: 'lista_itens',
  timestamps: true
});

export default ListaItem;
