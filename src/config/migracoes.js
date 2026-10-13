import { DataTypes } from 'sequelize';

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
  Idempotente: so adiciona o que estiver faltando, entao pode rodar a cada boot.
  Roda depois do sync(), que e quem cria as tabelas novas.
  Devolve a lista do que foi efetivamente adicionado.
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

  return aplicadas;
}
