/*
  Roda as migracoes manualmente. O app ja faz isso sozinho no boot
  (ver index.js), entao este script serve para:

    - conferir o estado do banco sem subir o servidor
    - migrar producao antes do deploy, se preferir separar as duas coisas

    Local (SQLite):   node scripts/migrar.mjs
    Producao:         descomente a DATABASE_URL no .env e rode o mesmo comando

  E idempotente: so adiciona o que estiver faltando.
*/
import 'dotenv/config';
import sequelize from '../src/config/orm.js';
import { aplicarMigracoes } from '../src/config/migracoes.js';
import '../src/models/associacoes.js';

console.log(`banco: ${sequelize.getDialect()}`);

await sequelize.sync();
console.log('sync: tabelas novas criadas (se houver)');

const aplicadas = await aplicarMigracoes(sequelize);
console.log(aplicadas.length
  ? `colunas adicionadas: ${aplicadas.join(', ')}`
  : 'nada a fazer, banco ja esta atualizado');

await sequelize.close();
