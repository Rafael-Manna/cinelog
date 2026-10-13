import { DataTypes } from 'sequelize';
import sequelize from '../config/orm.js';

// Avaliacao conjunta de um titulo que a lista assistiu: agrupa uma postagem de
// cada membro, que no feed aparecem lado a lado. Os dados do filme sao copiados
// do item da lista para a analise sobreviver se o item for removido depois.
const Analise = sequelize.define('Analise', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  titulo: { type: DataTypes.STRING, allowNull: false },
  categoria: { type: DataTypes.STRING, allowNull: false },
  ano: { type: DataTypes.STRING, allowNull: true },
  posterUrl: { type: DataTypes.STRING, allowNull: true },
  imdbId: { type: DataTypes.STRING, allowNull: true }
}, {
  tableName: 'analises',
  timestamps: true
});

export default Analise;
