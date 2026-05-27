// Esse arquivo "casa" os models entre si, dizendo como uma tabela se
// relaciona com a outra. E aqui que o Sequelize cria as chaves estrangeiras
// (foreign keys) automaticamente.

import User from './User.js';
import Post from './Post.js';
import Comment from './Comment.js';
import Follow from './Follow.js';

// ===== User <-> Post (1-para-muitos) =====
// Um usuario pode ter VARIAS postagens.
// onDelete: 'CASCADE' -> se o usuario for apagado, suas postagens tambem somem.
User.hasMany(Post, { foreignKey: 'userId', onDelete: 'CASCADE' });
Post.belongsTo(User, { foreignKey: 'userId' });

// ===== User <-> Comment (1-para-muitos) =====
User.hasMany(Comment, { foreignKey: 'userId', onDelete: 'CASCADE' });
Comment.belongsTo(User, { foreignKey: 'userId' });

// ===== Post <-> Comment (1-para-muitos) =====
Post.hasMany(Comment, { foreignKey: 'postId', onDelete: 'CASCADE' });
Comment.belongsTo(Post, { foreignKey: 'postId' });

// ===== Comment <-> Comment (auto-relacao para respostas) =====
// Um comentario pode ter VARIAS respostas (que tambem sao comentarios).
// "as" = apelido pra identificar essa associacao. Sem isso, daria conflito
// com Comment.belongsTo(Post, ...) acima.
Comment.hasMany(Comment, {
  as: 'Respostas',
  foreignKey: 'parentId',
  onDelete: 'CASCADE'
});
Comment.belongsTo(Comment, { as: 'Pai', foreignKey: 'parentId' });

// ===== User <-> User (muitos-para-muitos, atraves de Follow) =====
// Usamos belongsToMany porque a relacao "seguir" e N-N (cada um segue varios
// e e seguido por varios). O Follow e a tabela intermediaria.

// "Seguindo" = pessoas que ESTE usuario segue.
// Eu sou o follower, os outros sao o following.
User.belongsToMany(User, {
  through: Follow,
  as: 'Seguindo',
  foreignKey: 'followerId',   // a coluna do MEU id na tabela follows
  otherKey: 'followingId'     // a coluna do id da pessoa que sigo
});

// "Seguidores" = pessoas que seguem ESTE usuario.
// Aqui e o inverso: o outro e o follower, eu sou o following.
User.belongsToMany(User, {
  through: Follow,
  as: 'Seguidores',
  foreignKey: 'followingId',
  otherKey: 'followerId'
});

// Exporta todos juntos pra ser pratico importar nos controllers.
export { User, Post, Comment, Follow };
