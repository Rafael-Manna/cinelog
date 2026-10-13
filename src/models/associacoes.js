import User from './User.js';
import Post from './Post.js';
import Comment from './Comment.js';
import Lista from './Lista.js';
import ListaMembro from './ListaMembro.js';
import ListaItem from './ListaItem.js';
import ItemVoto from './ItemVoto.js';
import Analise from './Analise.js';

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

// quem marcou o item como assistido (vale para a lista toda)
User.hasMany(ListaItem, { as: 'ItensMarcados', foreignKey: 'assistidoPorId', onDelete: 'SET NULL' });
ListaItem.belongsTo(User, { as: 'MarcouAssistido', foreignKey: 'assistidoPorId' });

// ===== ANALISE EM CONJUNTO =====

// a analise nasce de um item ja assistido e pertence aquela lista
Lista.hasMany(Analise, { foreignKey: 'listaId', onDelete: 'CASCADE' });
Analise.belongsTo(Lista, { foreignKey: 'listaId' });

ListaItem.hasOne(Analise, { foreignKey: 'listaItemId', onDelete: 'SET NULL' });
Analise.belongsTo(ListaItem, { foreignKey: 'listaItemId' });

// cada membro escreve a sua postagem; as da mesma analise aparecem lado a lado
Analise.hasMany(Post, { foreignKey: 'analiseId', onDelete: 'SET NULL' });
Post.belongsTo(Analise, { foreignKey: 'analiseId' });

export { User, Post, Comment, Lista, ListaMembro, ListaItem, ItemVoto, Analise };
