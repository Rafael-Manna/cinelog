// Controlador das listas colaborativas e votações para a API móvel.
import { User, Post, Lista, ListaMembro, ListaItem, ItemVoto, Analise } from '../models/associacoes.js';

async function carregarComoMembro(listaId, userId) {
  const lista = await Lista.findByPk(listaId, {
    include: [{ model: User, as: 'Dono', attributes: ['id', 'nome', 'avatarUrl'] }]
  });
  if (!lista) return null;

  const membro = await ListaMembro.findOne({ where: { listaId: lista.id, userId } });
  if (!membro) return null;

  return { lista, membro };
}

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
  for (const item of itens) {
    await recalcularStatus(item);
  }
}

async function apagarVotosDaLista(listaId, userId) {
  const itens = await ListaItem.findAll({ where: { listaId }, attributes: ['id'] });
  if (!itens.length) return;
  await ItemVoto.destroy({ where: { userId, itemId: itens.map(i => i.id) } });
}

export const listar = async (req, res) => {
  try {
    const vinculos = await ListaMembro.findAll({
      where: { userId: req.usuario.id },
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

    return res.json({ dados: listas });
  } catch (err) {
    console.error('Erro ao listar listas colaborativas mobile:', err);
    return res.status(500).json({ mensagem: 'Erro ao listar colaborações.' });
  }
};

export const criar = async (req, res) => {
  const { nome, descricao } = req.body;
  if (!nome || !nome.trim()) {
    return res.status(400).json({ mensagem: 'Dê um nome para a lista.' });
  }

  try {
    const lista = await Lista.create({
      nome: nome.trim(),
      descricao: descricao ? descricao.trim() : null,
      ownerId: req.usuario.id
    });

    await ListaMembro.create({
      listaId: lista.id,
      userId: req.usuario.id,
      papel: 'dono'
    });

    return res.status(201).json({
      mensagem: 'Lista criada! Convide amigos pelo e-mail.',
      dados: lista
    });
  } catch (err) {
    console.error('Erro ao criar lista mobile:', err);
    return res.status(500).json({ mensagem: 'Erro ao criar lista.' });
  }
};

export const detalhe = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const ctx = await carregarComoMembro(req.params.id, usuarioId);
    if (!ctx) {
      return res.status(404).json({ mensagem: 'Lista não encontrada ou você não participa dela.' });
    }
    const { lista, membro } = ctx;

    const membros = await ListaMembro.findAll({
      where: { listaId: lista.id },
      include: [{ model: User, attributes: ['id', 'nome', 'email', 'avatarUrl'] }],
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
        minhaParte: item.Analise?.Posts?.find(p => p.userId === usuarioId) || null
      };
    });

    const aprovados = itens.filter(i => i.dados.status === 'aprovado');

    return res.json({
      dados: {
        lista,
        souDono: membro.papel === 'dono',
        membros,
        aprovados: aprovados.filter(i => !i.dados.assistidoEm),
        assistidos: aprovados.filter(i => i.dados.assistidoEm),
        pendentes: itens.filter(i => i.dados.status === 'pendente'),
        rejeitados: itens.filter(i => i.dados.status === 'rejeitado')
      }
    });
  } catch (err) {
    console.error('Erro ao buscar detalhes da lista mobile:', err);
    return res.status(500).json({ mensagem: 'Erro ao carregar lista.' });
  }
};

export const adicionarMembro = async (req, res) => {
  try {
    const ctx = await carregarComoMembro(req.params.id, req.usuario.id);
    if (!ctx) {
      return res.status(404).json({ mensagem: 'Lista não encontrada ou você não participa dela.' });
    }
    if (ctx.membro.papel !== 'dono') {
      return res.status(403).json({ mensagem: 'Somente o dono da lista pode convidar membros.' });
    }

    const email = (req.body.email || '').trim().toLowerCase();
    const convidado = await User.findOne({ where: { email } });
    if (!convidado) {
      return res.status(404).json({ mensagem: `Nenhum usuário cadastrado com o e-mail ${email}.` });
    }

    const jaEhMembro = await ListaMembro.findOne({
      where: { listaId: ctx.lista.id, userId: convidado.id }
    });
    if (jaEhMembro) {
      return res.status(400).json({ mensagem: `${convidado.nome} já participa desta lista.` });
    }

    await ListaMembro.create({ listaId: ctx.lista.id, userId: convidado.id });
    await recalcularListaInteira(ctx.lista.id);

    return res.json({
      mensagem: `${convidado.nome} foi adicionado à lista.`,
      dados: convidado
    });
  } catch (err) {
    console.error('Erro ao adicionar membro mobile:', err);
    return res.status(500).json({ mensagem: 'Erro ao adicionar membro.' });
  }
};

export const removerMembro = async (req, res) => {
  try {
    const ctx = await carregarComoMembro(req.params.id, req.usuario.id);
    if (!ctx) {
      return res.status(404).json({ mensagem: 'Lista não encontrada ou você não participa dela.' });
    }
    if (ctx.membro.papel !== 'dono') {
      return res.status(403).json({ mensagem: 'Somente o dono da lista pode remover membros.' });
    }

    const alvoId = parseInt(req.params.userId, 10);
    if (alvoId === ctx.lista.ownerId) {
      return res.status(400).json({ mensagem: 'O dono não pode ser removido da própria lista.' });
    }

    const vinculo = await ListaMembro.findOne({
      where: { listaId: ctx.lista.id, userId: alvoId }
    });
    if (vinculo) {
      await apagarVotosDaLista(ctx.lista.id, alvoId);
      await vinculo.destroy();
      await recalcularListaInteira(ctx.lista.id);
    }

    return res.json({ mensagem: 'Membro removido da lista.' });
  } catch (err) {
    console.error('Erro ao remover membro mobile:', err);
    return res.status(500).json({ mensagem: 'Erro ao remover membro.' });
  }
};

export const sair = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const ctx = await carregarComoMembro(req.params.id, usuarioId);
    if (!ctx) {
      return res.status(404).json({ mensagem: 'Lista não encontrada ou você não participa dela.' });
    }
    if (ctx.membro.papel === 'dono') {
      return res.status(400).json({ mensagem: 'Você é o criador desta lista. Exclua a lista em vez de sair.' });
    }

    await apagarVotosDaLista(ctx.lista.id, usuarioId);
    await ctx.membro.destroy();
    await recalcularListaInteira(ctx.lista.id);

    return res.json({ mensagem: 'Você saiu da lista.' });
  } catch (err) {
    console.error('Erro ao sair da lista mobile:', err);
    return res.status(500).json({ mensagem: 'Erro ao sair da lista.' });
  }
};

export const excluir = async (req, res) => {
  try {
    const ctx = await carregarComoMembro(req.params.id, req.usuario.id);
    if (!ctx) {
      return res.status(404).json({ mensagem: 'Lista não encontrada.' });
    }
    if (ctx.membro.papel !== 'dono') {
      return res.status(403).json({ mensagem: 'Somente o criador pode excluir esta lista.' });
    }

    await ctx.lista.destroy();
    return res.json({ mensagem: 'Lista excluída com sucesso.' });
  } catch (err) {
    console.error('Erro ao excluir lista mobile:', err);
    return res.status(500).json({ mensagem: 'Erro ao excluir lista.' });
  }
};

export const adicionarItem = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const ctx = await carregarComoMembro(req.params.id, usuarioId);
    if (!ctx) {
      return res.status(404).json({ mensagem: 'Lista não encontrada ou você não participa dela.' });
    }

    const { titulo, categoria, ano, posterUrl, imdbId } = req.body;
    if (!titulo || !titulo.trim() || !categoria || !categoria.trim()) {
      return res.status(400).json({ mensagem: 'Informe o título e a categoria do item.' });
    }

    const item = await ListaItem.create({
      listaId: ctx.lista.id,
      titulo: titulo.trim(),
      categoria: categoria.trim().toLowerCase(),
      ano: ano ? ano.trim() : null,
      posterUrl: posterUrl ? posterUrl.trim() : null,
      imdbId: imdbId ? imdbId.trim() : null,
      addedById: usuarioId
    });

    await ItemVoto.create({ itemId: item.id, userId: usuarioId, voto: 'sim' });
    await recalcularStatus(item);

    return res.status(201).json({
      mensagem: `"${item.titulo}" indicado com sucesso!`,
      dados: item
    });
  } catch (err) {
    console.error('Erro ao indicar item na lista mobile:', err);
    return res.status(500).json({ mensagem: 'Erro ao indicar item.' });
  }
};

export const votar = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const item = await ListaItem.findByPk(req.params.itemId);
    if (!item) {
      return res.status(404).json({ mensagem: 'Item não encontrado.' });
    }

    const ctx = await carregarComoMembro(item.listaId, usuarioId);
    if (!ctx) {
      return res.status(403).json({ mensagem: 'Você não participa desta lista.' });
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
    return res.json({
      mensagem: status === 'aprovado' ? `"${item.titulo}" foi aprovado por todos!` : 'Voto registrado.',
      status
    });
  } catch (err) {
    console.error('Erro ao votar em item mobile:', err);
    return res.status(500).json({ mensagem: 'Erro ao computar voto.' });
  }
};

export const marcarAssistido = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const item = await ListaItem.findByPk(req.params.itemId);
    if (!item) {
      return res.status(404).json({ mensagem: 'Item não encontrado.' });
    }

    const ctx = await carregarComoMembro(item.listaId, usuarioId);
    if (!ctx) {
      return res.status(403).json({ mensagem: 'Você não participa desta lista.' });
    }
    if (item.status !== 'aprovado') {
      return res.status(400).json({ mensagem: 'Apenas itens aprovados podem ser marcados como assistidos.' });
    }

    const desmarcando = Boolean(item.assistidoEm);
    item.assistidoEm = desmarcando ? null : new Date();
    item.assistidoPorId = desmarcando ? null : usuarioId;
    await item.save();

    return res.json({
      mensagem: desmarcando ? `"${item.titulo}" voltou para a fila.` : `"${item.titulo}" marcado como assistido!`,
      dados: item
    });
  } catch (err) {
    console.error('Erro ao marcar assistido mobile:', err);
    return res.status(500).json({ mensagem: 'Erro ao alterar status de assistido.' });
  }
};

export const avaliarJunto = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const item = await ListaItem.findByPk(req.params.itemId, { include: [{ model: Analise }] });
    if (!item) {
      return res.status(404).json({ mensagem: 'Item não encontrado.' });
    }

    const ctx = await carregarComoMembro(item.listaId, usuarioId);
    if (!ctx) {
      return res.status(403).json({ mensagem: 'Você não participa desta lista.' });
    }
    if (!item.assistidoEm) {
      return res.status(400).json({ mensagem: 'Marque o item como assistido antes de avaliar em conjunto.' });
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

    return res.json({ dados: analise });
  } catch (err) {
    console.error('Erro ao iniciar avaliação conjunta mobile:', err);
    return res.status(500).json({ mensagem: 'Erro ao iniciar avaliação conjunta.' });
  }
};

export const removerItem = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const item = await ListaItem.findByPk(req.params.itemId);
    if (!item) {
      return res.status(404).json({ mensagem: 'Item não encontrado.' });
    }

    const ctx = await carregarComoMembro(item.listaId, usuarioId);
    if (!ctx) {
      return res.status(403).json({ mensagem: 'Você não participa desta lista.' });
    }
    if (item.addedById !== usuarioId && ctx.membro.papel !== 'dono') {
      return res.status(403).json({ mensagem: 'Apenas quem indicou ou o dono da lista pode remover o item.' });
    }

    await item.destroy();
    return res.json({ mensagem: 'Item removido da lista.' });
  } catch (err) {
    console.error('Erro ao remover item mobile:', err);
    return res.status(500).json({ mensagem: 'Erro ao remover item.' });
  }
};
