import User from './User.js';
import Post from './Post.js';
import Comment from './Comment.js';
import Lista from './Lista.js';
import ListaMembro from './ListaMembro.js';
import ListaItem from './ListaItem.js';
import ItemVoto from './ItemVoto.js';

User.hasMany(Post, { foreignKey: 'userId', onDelete: 'CASCADE' });
Post.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Comment, { foreignKey: 'userId', onDelete: 'CASCADE' });
Comment.belongsTo(User, { foreignKey: 'userId' });

Post.hasMany(Comment, { foreignKey: 'postId', onDelete: 'CASCADE' });
Comment.belongsTo(Post, { foreignKey: 'postId' });

// ===== LISTAS COLABORATIVAS =====

// quem criou a lista
User.hasMany(Lista, { foreignKey: 'ownerId', onDelete: 'CASCADE' });
Lista.belongsTo(User, { as: 'Dono', foreignKey: 'ownerId' });

// membros (inclui o dono): User <-> Lista via lista_membros
Lista.hasMany(ListaMembro, { foreignKey: 'listaId', onDelete: 'CASCADE' });
ListaMembro.belongsTo(Lista, { foreignKey: 'listaId' });

User.hasMany(ListaMembro, { foreignKey: 'userId', onDelete: 'CASCADE' });
ListaMembro.belongsTo(User, { foreignKey: 'userId' });

Lista.belongsToMany(User, {
  as: 'Membros',
  through: ListaMembro,
  foreignKey: 'listaId',
  otherKey: 'userId'
});
User.belongsToMany(Lista, {
  as: 'ListasParticipando',
  through: ListaMembro,
  foreignKey: 'userId',
  otherKey: 'listaId'
});

// itens indicados para a lista
Lista.hasMany(ListaItem, { foreignKey: 'listaId', onDelete: 'CASCADE' });
ListaItem.belongsTo(Lista, { foreignKey: 'listaId' });

User.hasMany(ListaItem, { foreignKey: 'addedById', onDelete: 'CASCADE' });
ListaItem.belongsTo(User, { as: 'Indicou', foreignKey: 'addedById' });

// votos (concordo / nao concordo) de cada membro em cada item
ListaItem.hasMany(ItemVoto, { foreignKey: 'itemId', onDelete: 'CASCADE' });
ItemVoto.belongsTo(ListaItem, { foreignKey: 'itemId' });

User.hasMany(ItemVoto, { foreignKey: 'userId', onDelete: 'CASCADE' });
ItemVoto.belongsTo(User, { foreignKey: 'userId' });

export { User, Post, Comment, Lista, ListaMembro, ListaItem, ItemVoto };
