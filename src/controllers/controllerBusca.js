const tiposCategoria = {
  movie: 'filme',
  series: 'serie',
  episode: 'episodio'
};

export const buscar = async (req, res) => {
  const termo = (req.query.q || '').trim();
  if (termo.length < 2) return res.json({ resultados: [] });

  const chave = process.env.OMDB_API_KEY;
  if (!chave) {
    return res.json({ erro: 'OMDB_API_KEY nao configurada', resultados: [] });
  }

  try {
    const url = `http://www.omdbapi.com/?apikey=${chave}&s=${encodeURIComponent(termo)}`;
    const resposta = await fetch(url);
    const dados = await resposta.json();

    if (dados.Response === 'False') return res.json({ resultados: [] });

    const resultados = (dados.Search || []).map(item => ({
      imdbId: item.imdbID,
      titulo: item.Title,
      ano: item.Year,
      categoria: tiposCategoria[item.Type] || 'outro',
      posterUrl: item.Poster && item.Poster !== 'N/A' ? item.Poster : null
    }));

    res.json({ resultados });
  } catch (err) {
    console.error('Erro ao buscar no OMDb:', err);
    res.status(500).json({ erro: 'Erro ao buscar', resultados: [] });
  }
};
