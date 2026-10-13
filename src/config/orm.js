import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Sequelize } from 'sequelize';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Em producao (Render, etc) o banco vem pela DATABASE_URL do Postgres.
// Sem ela, continua o SQLite local de desenvolvimento.
const urlPostgres = process.env.DATABASE_URL;

let sequelize;

if (urlPostgres) {
  // Neon e Render ja mandam ?sslmode=require na connection string e usam
  // certificado publicamente confiavel; nesse caso o proprio driver resolve o
  // SSL e nao sobrescrevemos nada. So forcamos SSL quando a URL nao diz nada.
  const sslNaUrl = urlPostgres.includes('sslmode=');

  sequelize = new Sequelize(urlPostgres, {
    dialect: 'postgres',
    logging: false,
    ...(sslNaUrl ? {} : { dialectOptions: { ssl: true } })
  });
} else {
  const dbDir = path.join(__dirname, '..', 'database');

  // O SQLite nao cria a pasta do arquivo sozinho: sem isso o sync() falha com SQLITE_CANTOPEN
  fs.mkdirSync(dbDir, { recursive: true });

  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(dbDir, 'bd.sqlite'),
    logging: false,
    hooks: {
      // So o SQLite precisa disso: as foreign keys (e o onDelete: CASCADE) vem
      // desligadas em cada conexao. No Postgres elas ja valem sempre.
      afterConnect: (conexao) => new Promise((resolve, reject) => {
        conexao.run('PRAGMA foreign_keys = ON', err => err ? reject(err) : resolve());
      })
    }
  });
}

export default sequelize;
