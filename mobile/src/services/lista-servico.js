// Serviço de listas colaborativas, votações unânimes e análises conjuntas do CineLog mobile.
import { solicitarApi } from './api';

export function listarListas() {
    return solicitarApi('/listas', {
        method: 'GET',
    }, true);
}

export function criarLista(dados) {
    return solicitarApi('/listas', {
        method: 'POST',
        body: JSON.stringify(dados),
    }, true);
}

export function consultarLista(id) {
    return solicitarApi('/listas/' + id, {
        method: 'GET',
    }, true);
}

export function excluirLista(id) {
    return solicitarApi('/listas/' + id, {
        method: 'DELETE',
    }, true);
}

export function sairDaLista(id) {
    return solicitarApi('/listas/' + id + '/sair', {
        method: 'POST',
    }, true);
}

export function adicionarMembro(id, email) {
    return solicitarApi('/listas/' + id + '/membros', {
        method: 'POST',
        body: JSON.stringify({ email: email }),
    }, true);
}

export function removerMembro(id, userId) {
    return solicitarApi('/listas/' + id + '/membros/' + userId, {
        method: 'DELETE',
    }, true);
}

export function adicionarItem(id, item) {
    return solicitarApi('/listas/' + id + '/itens', {
        method: 'POST',
        body: JSON.stringify(item),
    }, true);
}

export function votarItem(itemId, voto) {
    return solicitarApi('/listas/itens/' + itemId + '/voto', {
        method: 'POST',
        body: JSON.stringify({ voto: voto }),
    }, true);
}

export function marcarAssistido(itemId) {
    return solicitarApi('/listas/itens/' + itemId + '/assistido', {
        method: 'POST',
    }, true);
}

export function avaliarJunto(itemId) {
    return solicitarApi('/listas/itens/' + itemId + '/avaliar', {
        method: 'POST',
    }, true);
}

export function removerItem(itemId) {
    return solicitarApi('/listas/itens/' + itemId, {
        method: 'DELETE',
    }, true);
}
