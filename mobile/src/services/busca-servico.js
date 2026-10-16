// Serviço de busca de títulos no OMDb para o CineLog mobile.
import { solicitarApi } from './api';

export function buscarFilmes(termo) {
    if (!termo || termo.trim().length < 2) {
        return Promise.resolve({ resultados: [] });
    }
    return solicitarApi('/buscar?q=' + encodeURIComponent(termo.trim()), {
        method: 'GET',
    }, false);
}
