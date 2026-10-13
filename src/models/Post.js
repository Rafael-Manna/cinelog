import { DataTypes } from 'sequelize';
import sequelize from '../config/orm.js';

const Post = sequelize.define('Post', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  titulo: { type: DataTypes.STRING, allowNull: false },
  categoria: { type: DataTypes.STRING, allowNull: false },
  // Escala 0 a 10, exibida como 5 estrelas (cada estrela vale 2, entao nota
  // impar vira meia estrela). Antes era 1 a 5 — ver o passo 'nota-escala-10'
  // em src/config/migracoes.js, que converteu as postagens antigas.
  nota: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 0, max: 10 }
  },
  conteudo: { type: DataTypes.TEXT, allowNull: false },
  posterUrl: { type: DataTypes.STRING, allowNull: true },
  imdbId: { type: DataTypes.STRING, allowNull: true }
}, {
  tableName: 'postagens',
  timestamps: true
});

export default Post;
