// Serviço de autenticação e perfil do CineLog mobile.
import { solicitarApi } from './api';

export function entrar(email, senha) {
    return solicitarApi('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: email, senha: senha }),
    }, false);
}

export function cadastrar(nome, email, senha) {
    return solicitarApi('/auth/registro', {
        method: 'POST',
        body: JSON.stringify({ nome: nome, email: email, senha: senha }),
    }, false);
}

export function consultarPerfil() {
    return solicitarApi('/auth/perfil', {
        method: 'GET',
    }, true);
}

export function atualizarPerfil(nome, bio) {
    return solicitarApi('/auth/perfil', {
        method: 'PUT',
        body: JSON.stringify({ nome: nome, bio: bio }),
    }, true);
}

export function enviarAvatar(formData) {
    return solicitarApi('/auth/avatar', {
        method: 'POST',
        body: formData,
        headers: {},
    }, true);
}
