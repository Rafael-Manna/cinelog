// Arquivo de configuracao do ORM (Sequelize) com o banco SQLite.
// ORM = "Object Relational Mapper". Em vez de escrever SQL na mao
// (ex: "SELECT * FROM usuarios"), voce trabalha com objetos JavaScript
// (ex: User.findAll()). O Sequelize traduz isso pra SQL por baixo dos panos.

import path from 'path';
import { fileURLToPath } from 'url';
import { Sequelize } from 'sequelize';

// Em ES Modules NAO existe __dirname/__filename automaticamente como no CommonJS.
// A gente recria usando import.meta.url (URL do arquivo atual).
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cria a "instancia" do Sequelize, que representa a conexao com o banco.
const sequelize = new Sequelize({
  // Qual banco estamos usando. Poderia ser 'mysql', 'postgres', etc.
  dialect: 'sqlite',

  // Caminho do arquivo do banco. SQLite e um banco que vive em um unico
  // arquivo no disco (nao precisa de servidor rodando separado).
  // __dirname = pasta onde esse arquivo (orm.js) esta = src/config
  // '..' = sobe uma pasta -> src, depois entra em database/bd.sqlite
  storage: path.join(__dirname, '..', 'database', 'bd.sqlite'),

  // logging: false -> nao imprime no console todo SQL que o Sequelize executa.
  // Se quiser ver as queries pra estudar, troca pra "console.log".
  logging: false
});

// Exporta a conexao pra ser usada nos models e no index.js.
export default sequelize;
