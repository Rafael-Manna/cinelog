import { DataTypes, QueryTypes } from 'sequelize';

/*
  O sequelize.sync() cria tabelas novas, mas nao adiciona coluna em tabela que
  ja existe. Esta lista cobre essa diferenca.

  Cada entrada e [tabela, coluna, definicao]. Adicionou coluna em algum model?
  Acrescente aqui tambem. Nunca remova nem altere uma entrada antiga: o banco
  de producao pode ja ter passado por ela.
*/
const colunas = [
  ['analises', 'listaId', {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'listas', key: 'id' },
    onDelete: 'CASCADE'
  }],
  ['analises', 'listaItemId', {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'lista_itens', key: 'id' },
    onDelete: 'SET NULL'
  }],
  ['lista_itens', 'assistidoEm', { type: DataTypes.DATE, allowNull: true }],
  ['lista_itens', 'assistidoPorId', {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'usuarios', key: 'id' },
    onDelete: 'SET NULL'
  }],
  ['postagens', 'analiseId', {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'analises', key: 'id' },
    onDelete: 'SET NULL'
  }]
];

/*
  Mudancas de DADOS (nao de schema). Diferente das colunas, aqui nao da para
  olhar o banco e saber se ja rodou — por isso cada passo e registrado na tabela
  'migracoes' e nunca roda duas vezes.

  Nunca edite nem remova um passo ja publicado: o banco de producao pode ja
  te-lo aplicado. Para corrigir algo, acrescente um passo novo.
*/
const passos = [
  ['nota-escala-10', async (sequelize) => {
    // A nota era de 1 a 5 e passou a ser de 0 a 10 (para permitir meia estrela).
    // As postagens antigas precisam dobrar para continuar valendo o mesmo.
    await sequelize.query('UPDATE postagens SET nota = nota * 2');
  }]
];

async function garantirTabelaDeControle(queryInterface) {
  await queryInterface.createTable('migracoes', {
    nome: { type: DataTypes.STRING, primaryKey: true },
    aplicada_em: { type: DataTypes.DATE, allowNull: false }
  });
}

/*
  Idempotente: so aplica o que estiver faltando, entao pode rodar a cada boot.
  Roda depois do sync(), que e quem cria as tabelas novas.
  Devolve a lista do que foi efetivamente aplicado.
*/
export async function aplicarMigracoes(sequelize) {
  const queryInterface = sequelize.getQueryInterface();
  const aplicadas = [];

  for (const [tabela, coluna, definicao] of colunas) {
    const existentes = await queryInterface.describeTable(tabela);
    if (existentes[coluna]) continue;

    await queryInterface.addColumn(tabela, coluna, definicao);
    aplicadas.push(`${tabela}.${coluna}`);
  }

  await garantirTabelaDeControle(queryInterface);

  const registradas = await sequelize.query(
    'SELECT nome FROM migracoes',
    { type: QueryTypes.SELECT }
  );
  const jaRodou = new Set(registradas.map(r => r.nome));

  for (const [nome, executar] of passos) {
    if (jaRodou.has(nome)) continue;

    await executar(sequelize);
    await sequelize.query(
      'INSERT INTO migracoes (nome, aplicada_em) VALUES (?, ?)',
      { replacements: [nome, new Date()] }
    );
    aplicadas.push(`passo ${nome}`);
  }

  return aplicadas;
}
