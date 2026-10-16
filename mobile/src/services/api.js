// Centralizo as chamadas HTTP e traduzo falhas de comunicação em mensagens para as telas do CineLog.
import { obterToken } from './token-servico';

let avisarFimDaSessao = async function aguardarContexto() {};

// Guardo a função do contexto que devo chamar quando uma resposta da API encerrar a sessão.
export function acompanharSessao(funcao) {
    avisarFimDaSessao = funcao;
}

// Centralizo o pedido HTTP, a inclusão do token de sessão e o tratamento de erros amigáveis.
export async function solicitarApi(caminho, opcoes = {}, protegido = true) {
    const endereco = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

    if (!endereco || !/^https?:\/\//.test(endereco)) {
        throw new Error('Configure EXPO_PUBLIC_API_URL no ambiente do mobile para conectar à API.');
    }

    let token = null;
    const cabecalhos = Object.assign({}, opcoes.headers);

    // Se o corpo não for FormData, configuro o formato JSON
    if (!(opcoes.body instanceof FormData) && !cabecalhos['Content-Type']) {
        cabecalhos['Content-Type'] = 'application/json';
    }

    if (protegido) {
        token = await obterToken();
        if (token) {
            cabecalhos.Authorization = 'Bearer ' + token;
        }
    }

    const controle = new AbortController();
    const tempo = setTimeout(function encerrarEspera() {
        controle.abort();
    }, 45000);

    let resposta;

    try {
        resposta = await fetch(endereco.replace(/\/+$/, '') + caminho, Object.assign({}, opcoes, {
            signal: controle.signal,
            headers: cabecalhos,
        }));

        if (resposta.status === 204) {
            return null;
        }

        const resultado = await resposta.json();

        if (!resposta.ok) {
            if (resposta.status === 401 && protegido) {
                await avisarFimDaSessao();
            }

            let mensagem = 'Não foi possível concluir a solicitação.';
            if (resultado && typeof resultado.mensagem === 'string') {
                mensagem = resultado.mensagem;
            }

            throw Object.assign(new Error(mensagem), {
                status: resposta.status,
            });
        }

        return resultado;
    } catch (falha) {
        if (controle.signal.aborted) {
            throw new Error('A conexão demorou mais do que o esperado. Tente novamente.');
        }

        if (!resposta) {
            throw new Error('Não foi possível conectar ao servidor do CineLog. Verifique sua conexão e se a API está iniciada.');
        }

        if (falha instanceof SyntaxError) {
            throw new Error('O servidor enviou uma resposta em formato inválido.');
        }

        throw falha;
    } finally {
        clearTimeout(tempo);
    }
}
