// Serviço de publicações, avaliações e feed do CineLog mobile.
import { solicitarApi } from './api';

export function listarPosts(categoria = 'todos') {
    let caminho = '/posts';
    if (categoria && categoria !== 'todos') {
        caminho = caminho + '?categoria=' + encodeURIComponent(categoria);
    }
    return solicitarApi(caminho, {
        method: 'GET',
    }, false);
}

export function consultarPost(id) {
    return solicitarApi('/posts/' + id, {
        method: 'GET',
    }, false);
}

export function criarPost(dados) {
    return solicitarApi('/posts', {
        method: 'POST',
        body: JSON.stringify(dados),
    }, true);
}

export function atualizarPost(id, dados) {
    return solicitarApi('/posts/' + id, {
        method: 'PUT',
        body: JSON.stringify(dados),
    }, true);
}

export function excluirPost(id) {
    return solicitarApi('/posts/' + id, {
        method: 'DELETE',
    }, true);
}
