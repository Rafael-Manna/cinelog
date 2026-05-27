// Controller que faz proxy pro OMDb. O navegador chama esse endpoint
// (sem precisar saber a chave), o servidor chama o OMDb com a chave,
// e retorna o resultado pro navegador.
//
// Por que proxy?
// Se a gente chamasse o OMDb direto do JavaScript do navegador, a chave
// ficaria visivel no codigo fonte da pagina. Qualquer um copiaria e
// estouraria nosso limite de 1000 buscas/dia.

// Mapeia o "Type" do OMDb pra nossa categoria interna.
function categoriaDoTipo(omdbType) {
  if (omdbType === 'movie') return 'filme';
  if (omdbType === 'series') return 'serie';
  if (omdbType === 'episode') return 'episodio';
  return 'outro';
}

// GET /api/buscar?q=matrix -> retorna uma lista de resultados em JSON.
export const buscar = async (req, res) => {
  const termo = (req.query.q || '').trim();

  // Se nao mandou nada ou muito curto, retorna lista vazia (sem chamar a API).
  // Evita request desnecessario pro OMDb e mantem o autocomplete responsivo.
  if (termo.length < 2) {
    return res.json({ resultados: [] });
  }

  const chave = process.env.OMDB_API_KEY;

  // Se a chave nao foi configurada no .env, avisa o cliente.
  if (!chave) {
    return res.json({
      erro: 'OMDB_API_KEY nao configurada no .env',
      resultados: []
    });
  }

  try {
    // Monta a URL do OMDb. encodeURIComponent escapa espacos e caracteres especiais.
    // O parametro "s" e o termo de busca, retorna ate 10 resultados por pagina.
    const url = `http://www.omdbapi.com/?apikey=${chave}&s=${encodeURIComponent(termo)}`;

    // fetch nativo do Node (disponivel a partir do Node 18).
    const resposta = await fetch(url);
    const dados = await resposta.json();

    // Quando o OMDb nao acha nada, ele retorna { Response: "False", Error: "Movie not found!" }
    if (dados.Response === 'False') {
      return res.json({ resultados: [] });
    }

    // Normaliza os resultados pra um formato simples e enxuto pro front.
    // O OMDb retorna campos em PascalCase; convertemos pra camelCase.
    // Tambem filtramos posters "N/A" (quando o titulo nao tem capa cadastrada).
    const resultados = (dados.Search || []).map(item => ({
      imdbId: item.imdbID,
      titulo: item.Title,
      ano: item.Year,
      tipo: item.Type,                       // movie | series | episode
      categoria: categoriaDoTipo(item.Type), // filme | serie | episodio
      posterUrl: item.Poster && item.Poster !== 'N/A' ? item.Poster : null
    }));

    res.json({ resultados });
  } catch (err) {
    console.error('Erro ao buscar no OMDb:', err);
    res.status(500).json({ erro: 'Erro ao buscar', resultados: [] });
  }
};
