// Serviço de comentários para o CineLog mobile.
import { solicitarApi } from './api';

export function criarComentario(postId, conteudo) {
    return solicitarApi('/comentarios/' + postId, {
        method: 'POST',
        body: JSON.stringify({ conteudo: conteudo }),
    }, true);
}

export function excluirComentario(id) {
    return solicitarApi('/comentarios/' + id, {
        method: 'DELETE',
    }, true);
}
