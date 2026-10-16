// Compartilho a sessão entre as telas e confiro o acesso salvo ao reabrir o CineLog.
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import * as acessoServico from '../services/acesso-servico';
import { acompanharSessao } from '../services/api';
import { obterToken, guardarToken, apagarToken } from '../services/token-servico';

const AcessoContext = createContext(null);

export function AcessoProvider({ children }) {
    const [usuario, definirUsuario] = useState(null);
    const [carregando, definirCarregando] = useState(true);
    const [erroInicial, definirErroInicial] = useState('');
    const [aviso, definirAviso] = useState('');

    const encerrarLocalmente = useCallback(async function encerrarLocalmente() {
        await apagarToken();
        definirUsuario(null);
    }, []);

    async function consultarSessaoSalva() {
        try {
            const token = await obterToken();
            if (token) {
                const resultado = await acessoServico.consultarPerfil();
                definirUsuario(resultado.dados);
            } else {
                definirUsuario(null);
            }
        } catch (falha) {
            if (falha.status === 401) {
                await apagarToken();
                definirUsuario(null);
            } else {
                definirErroInicial(falha.message);
            }
        } finally {
            definirCarregando(false);
        }
    }

    async function restaurar() {
        definirCarregando(true);
        definirErroInicial('');
        await consultarSessaoSalva();
    }

    useEffect(function iniciarAcesso() {
        acompanharSessao(encerrarLocalmente);
        consultarSessaoSalva();
    }, [encerrarLocalmente]);

    async function entrar(email, senha) {
        definirAviso('');
        const resposta = await acessoServico.entrar(email, senha);
        await guardarToken(resposta.token);
        definirUsuario(resposta.usuario);
    }

    async function cadastrar(nome, email, senha) {
        definirAviso('');
        const resposta = await acessoServico.cadastrar(nome, email, senha);
        await guardarToken(resposta.token);
        definirUsuario(resposta.usuario);
    }

    async function sair() {
        await encerrarLocalmente();
    }

    function atualizarPerfilLocal(novosDados) {
        definirUsuario(Object.assign({}, usuario, novosDados));
    }

    return (
        <AcessoContext.Provider value={{
            usuario: usuario,
            carregando: carregando,
            erroInicial: erroInicial,
            aviso: aviso,
            restaurar: restaurar,
            entrar: entrar,
            cadastrar: cadastrar,
            sair: sair,
            atualizarPerfilLocal: atualizarPerfilLocal,
        }}
        >
            {children}
        </AcessoContext.Provider>
    );
}

export function useAcesso() {
    return useContext(AcessoContext);
}
