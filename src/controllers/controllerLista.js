import { User, Post, Lista, ListaMembro, ListaItem, ItemVoto, Analise } from '../models/associacoes.js';

// Carrega a lista apenas se o usuario logado for membro dela.
// Devolve { lista, membro } ou null quando nao existe / nao participa.
async function carregarComoMembro(listaId, userId) {
  const lista = await Lista.findByPk(listaId, {
    include: [{ model: User, as: 'Dono', attributes: ['id', 'nome', 'avatarUrl'] }]
  });
  if (!lista) return null;

  const membro = await ListaMembro.findOne({ where: { listaId: lista.id, userId } });
  if (!membro) return null;

  return { lista, membro };
}

// Decide o status de um item: so entra na lista com unanimidade.
// Um "nao" de qualquer membro rejeita; faltando alguem votar, continua pendente.
async function recalcularStatus(item) {
  const totalMembros = await ListaMembro.count({ where: { listaId: item.listaId } });
  const votos = await ItemVoto.findAll({ where: { itemId: item.id } });

  let status = 'pendente';
  if (votos.some(v => v.voto === 'nao')) {
    status = 'rejeitado';
  } else if (votos.length >= totalMembros) {
    status = 'aprovado';
  }

  if (item.status !== status) {
    item.status = status;
    await item.save();
  }
  return status;
}

async function recalcularListaInteira(listaId) {
  const itens = await ListaItem.findAll({ where: { listaId } });
  for (const item of itens) await recalcularStatus(item);
}

export const listar = async (req, res) => {
  const vinculos = await ListaMembro.findAll({
    where: { userId: req.session.usuario.id },
    include: [{
      model: Lista,
      include: [{ model: User, as: 'Dono', attributes: ['id', 'nome', 'avatarUrl'] }]
    }],
    order: [['createdAt', 'DESC']]
  });

  const listas = [];
  for (const vinculo of vinculos) {
    if (!vinculo.Lista) continue;
    listas.push({
      lista: vinculo.Lista,
      papel: vinculo.papel,
      membros: await ListaMembro.count({ where: { listaId: vinculo.listaId } }),
      aprovados: await ListaItem.count({ where: { listaId: vinculo.listaId, status: 'aprovado' } }),
      pendentes: await ListaItem.count({ where: { listaId: vinculo.listaId, status: 'pendente' } })
    });
  }

  res.render('listas', { listas });
};

export const formNova = (req, res) => res.render('novaLista');

export const criar = async (req, res) => {
  const { nome, descricao } = req.body;
  if (!nome?.trim()) {
    req.flash('error', 'De um nome para a lista.');
    return res.redirect('/listas/nova');
  }

  const lista = await Lista.create({
    nome: nome.trim(),
    descricao: descricao?.trim() || null,
    ownerId: req.session.usuario.id
  });

  // o dono tambem e membro: assim ele vota junto nos itens
  await ListaMembro.create({
    listaId: lista.id,
    userId: req.session.usuario.id,
    papel: 'dono'
  });

  req.flash('success', 'Lista criada! Agora chame a galera.');
  res.redirect(`/listas/${lista.id}`);
};

export const detalhe = async (req, res) => {
  const usuarioId = req.session.usuario.id;
  const ctx = await carregarComoMembro(req.params.id, usuarioId);
  if (!ctx) {
    req.flash('error', 'Lista nao encontrada ou voce nao participa dela.');
    return res.redirect('/listas');
  }
  const { lista, membro } = ctx;

  const membros = await ListaMembro.findAll({
    where: { listaId: lista.id },
    include: [{ model: User, attributes: ['id', 'nome', 'avatarUrl'] }],
    order: [['createdAt', 'ASC']]
  });

  const itensBrutos = await ListaItem.findAll({
    where: { listaId: lista.id },
    include: [
      { model: User, as: 'Indicou', attributes: ['id', 'nome', 'avatarUrl'] },
      { model: User, as: 'MarcouAssistido', attributes: ['id', 'nome', 'avatarUrl'] },
      { model: Analise, include: [{ model: Post, attributes: ['id', 'userId'] }] },
      { model: ItemVoto, include: [{ model: User, attributes: ['id', 'nome', 'avatarUrl'] }] }
    ],
    order: [['createdAt', 'DESC']]
  });

  const itens = itensBrutos.map(item => {
    const votos = item.ItemVotos || [];
    const jaVotaram = new Set(votos.map(v => v.userId));
    return {
      dados: item,
      sim: votos.filter(v => v.voto === 'sim'),
      nao: votos.filter(v => v.voto === 'nao'),
      meuVoto: votos.find(v => v.userId === usuarioId)?.voto || null,
      faltam: membros.filter(m => !jaVotaram.has(m.userId)).map(m => m.User),
      podeRemover: item.addedById === usuarioId || membro.papel === 'dono',
      // ja escrevi a minha parte da analise conjunta desse item?
      minhaParte: item.Analise?.Posts?.find(p => p.userId === usuarioId) || null
    };
  });

  const aprovados = itens.filter(i => i.dados.status === 'aprovado');

  res.render('detalheLista', {
    lista,
    souDono: membro.papel === 'dono',
    membros,
    // aprovado e ainda nao assistido fica na fila; assistido ganha secao propria
    aprovados: aprovados.filter(i => !i.dados.assistidoEm),
    assistidos: aprovados.filter(i => i.dados.assistidoEm),
    pendentes: itens.filter(i => i.dados.status === 'pendente'),
    rejeitados: itens.filter(i => i.dados.status === 'rejeitado')
  });
};

export const adicionarMembro = async (req, res) => {
  const ctx = await carregarComoMembro(req.params.id, req.session.usuario.id);
  if (!ctx) {
    req.flash('error', 'Lista nao encontrada ou voce nao participa dela.');
    return res.redirect('/listas');
  }
  if (ctx.membro.papel !== 'dono') {
    req.flash('error', 'Somente o dono da lista pode convidar gente.');
    return res.redirect(`/listas/${req.params.id}`);
  }

  const email = (req.body.email || '').trim().toLowerCase();
  const convidado = await User.findOne({ where: { email } });

  if (!convidado) {
    req.flash('error', `Ninguem cadastrado com o email ${email}.`);
    return res.redirect(`/listas/${ctx.lista.id}`);
  }

  const jaEhMembro = await ListaMembro.findOne({
    where: { listaId: ctx.lista.id, userId: convidado.id }
  });
  if (jaEhMembro) {
    req.flash('error', `${convidado.nome} ja esta na lista.`);
    return res.redirect(`/listas/${ctx.lista.id}`);
  }

  await ListaMembro.create({ listaId: ctx.lista.id, userId: convidado.id });

  // entrou gente nova: itens aprovados voltam a depender do voto dela
  await recalcularListaInteira(ctx.lista.id);

  req.flash('success', `${convidado.nome} entrou na lista.`);
  res.redirect(`/listas/${ctx.lista.id}`);
};

export const removerMembro = async (req, res) => {
  const ctx = await carregarComoMembro(req.params.id, req.session.usuario.id);
  if (!ctx) {
    req.flash('error', 'Lista nao encontrada ou voce nao participa dela.');
    return res.redirect('/listas');
  }
  if (ctx.membro.papel !== 'dono') {
    req.flash('error', 'Somente o dono da lista pode remover membros.');
    return res.redirect(`/listas/${req.params.id}`);
  }

  const alvoId = parseInt(req.params.userId, 10);
  if (alvoId === ctx.lista.ownerId) {
    req.flash('error', 'O dono nao pode sair da propria lista - exclua a lista.');
    return res.redirect(`/listas/${ctx.lista.id}`);
  }

  const vinculo = await ListaMembro.findOne({
    where: { listaId: ctx.lista.id, userId: alvoId }
  });
  if (vinculo) {
    // sem os votos de quem saiu travando as decisoes
    await apagarVotosDaLista(ctx.lista.id, alvoId);
    await vinculo.destroy();
    await recalcularListaInteira(ctx.lista.id);
    req.flash('success', 'Membro removido.');
  }

  res.redirect(`/listas/${ctx.lista.id}`);
};

// Remove os votos de um usuario apenas nos itens de uma lista especifica
async function apagarVotosDaLista(listaId, userId) {
  const itens = await ListaItem.findAll({ where: { listaId }, attributes: ['id'] });
  if (!itens.length) return;
  await ItemVoto.destroy({ where: { userId, itemId: itens.map(i => i.id) } });
}

export const sair = async (req, res) => {
  const usuarioId = req.session.usuario.id;
  const ctx = await carregarComoMembro(req.params.id, usuarioId);
  if (!ctx) {
    req.flash('error', 'Lista nao encontrada ou voce nao participa dela.');
    return res.redirect('/listas');
  }
  if (ctx.membro.papel === 'dono') {
    req.flash('error', 'Voce e o dono dessa lista - exclua a lista em vez de sair.');
    return res.redirect(`/listas/${ctx.lista.id}`);
  }

  await apagarVotosDaLista(ctx.lista.id, usuarioId);
  await ctx.membro.destroy();
  await recalcularListaInteira(ctx.lista.id);

  req.flash('success', 'Voce saiu da lista.');
  res.redirect('/listas');
};

export const excluir = async (req, res) => {
  const ctx = await carregarComoMembro(req.params.id, req.session.usuario.id);
  if (!ctx) {
    req.flash('error', 'Lista nao encontrada ou voce nao participa dela.');
    return res.redirect('/listas');
  }
  if (ctx.membro.papel !== 'dono') {
    req.flash('error', 'Somente o dono pode excluir a lista.');
    return res.redirect(`/listas/${req.params.id}`);
  }

  await ctx.lista.destroy();
  req.flash('success', 'Lista excluida.');
  res.redirect('/listas');
};

export const adicionarItem = async (req, res) => {
  const usuarioId = req.session.usuario.id;
  const ctx = await carregarComoMembro(req.params.id, usuarioId);
  if (!ctx) {
    req.flash('error', 'Lista nao encontrada ou voce nao participa dela.');
    return res.redirect('/listas');
  }

  const { titulo, categoria, ano, posterUrl, imdbId } = req.body;
  if (!titulo?.trim() || !categoria?.trim()) {
    req.flash('error', 'Informe titulo e categoria do item.');
    return res.redirect(`/listas/${ctx.lista.id}`);
  }

  const item = await ListaItem.create({
    listaId: ctx.lista.id,
    titulo: titulo.trim(),
    categoria: categoria.trim().toLowerCase(),
    ano: ano?.trim() || null,
    posterUrl: posterUrl?.trim() || null,
    imdbId: imdbId?.trim() || null,
    addedById: usuarioId
  });

  // quem indica ja concorda
  await ItemVoto.create({ itemId: item.id, userId: usuarioId, voto: 'sim' });
  await recalcularStatus(item);

  req.flash('success', `"${item.titulo}" indicado - agora e esperar os votos.`);
  res.redirect(`/listas/${ctx.lista.id}`);
};

export const votar = async (req, res) => {
  const usuarioId = req.session.usuario.id;
  const item = await ListaItem.findByPk(req.params.itemId);
  if (!item) {
    req.flash('error', 'Item nao encontrado.');
    return res.redirect('/listas');
  }

  const ctx = await carregarComoMembro(item.listaId, usuarioId);
  if (!ctx) {
    req.flash('error', 'Voce nao participa dessa lista.');
    return res.redirect('/listas');
  }

  const voto = req.body.voto === 'nao' ? 'nao' : 'sim';
  const existente = await ItemVoto.findOne({ where: { itemId: item.id, userId: usuarioId } });

  if (existente) {
    existente.voto = voto;
    await existente.save();
  } else {
    await ItemVoto.create({ itemId: item.id, userId: usuarioId, voto });
  }

  const status = await recalcularStatus(item);
  if (status === 'aprovado') {
    req.flash('success', `"${item.titulo}" foi aprovado por todos!`);
  }

  res.redirect(`/listas/${item.listaId}`);
};

// A lista assiste junto, entao um membro marcar vale para todos.
export const marcarAssistido = async (req, res) => {
  const usuarioId = req.session.usuario.id;
  const item = await ListaItem.findByPk(req.params.itemId);
  if (!item) {
    req.flash('error', 'Item nao encontrado.');
    return res.redirect('/listas');
  }

  const ctx = await carregarComoMembro(item.listaId, usuarioId);
  if (!ctx) {
    req.flash('error', 'Voce nao participa dessa lista.');
    return res.redirect('/listas');
  }
  if (item.status !== 'aprovado') {
    req.flash('error', 'So da para marcar como assistido o que ja entrou na lista.');
    return res.redirect(`/listas/${item.listaId}`);
  }

  const desmarcando = !!item.assistidoEm;
  item.assistidoEm = desmarcando ? null : new Date();
  item.assistidoPorId = desmarcando ? null : usuarioId;
  await item.save();

  req.flash('success', desmarcando
    ? `"${item.titulo}" voltou para a fila.`
    : `"${item.titulo}" marcado como assistido — agora voces podem avaliar juntos.`);
  res.redirect(`/listas/${item.listaId}`);
};

// Abre (ou reaproveita) a analise conjunta de um item assistido e manda o
// membro escrever a parte dele.
export const avaliarJunto = async (req, res) => {
  const usuarioId = req.session.usuario.id;
  const item = await ListaItem.findByPk(req.params.itemId, { include: [{ model: Analise }] });
  if (!item) {
    req.flash('error', 'Item nao encontrado.');
    return res.redirect('/listas');
  }

  const ctx = await carregarComoMembro(item.listaId, usuarioId);
  if (!ctx) {
    req.flash('error', 'Voce nao participa dessa lista.');
    return res.redirect('/listas');
  }
  if (!item.assistidoEm) {
    req.flash('error', 'Marque como assistido antes de avaliar.');
    return res.redirect(`/listas/${item.listaId}`);
  }

  let analise = item.Analise;
  if (!analise) {
    analise = await Analise.create({
      listaId: item.listaId,
      listaItemId: item.id,
      titulo: item.titulo,
      categoria: item.categoria,
      ano: item.ano,
      posterUrl: item.posterUrl,
      imdbId: item.imdbId
    });
  }

  res.redirect(`/posts/novo?analise=${analise.id}`);
};

export const removerItem = async (req, res) => {
  const usuarioId = req.session.usuario.id;
  const item = await ListaItem.findByPk(req.params.itemId);
  if (!item) {
    req.flash('error', 'Item nao encontrado.');
    return res.redirect('/listas');
  }

  const ctx = await carregarComoMembro(item.listaId, usuarioId);
  if (!ctx) {
    req.flash('error', 'Voce nao participa dessa lista.');
    return res.redirect('/listas');
  }
  if (item.addedById !== usuarioId && ctx.membro.papel !== 'dono') {
    req.flash('error', 'Somente quem indicou o item (ou o dono da lista) pode remove-lo.');
    return res.redirect(`/listas/${item.listaId}`);
  }

  const listaId = item.listaId;
  await item.destroy();
  req.flash('success', 'Item removido.');
  res.redirect(`/listas/${listaId}`);
};
