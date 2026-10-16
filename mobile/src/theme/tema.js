// Centralizo cores, espaços e estilos visuais do aplicativo móvel CineLog.
// Deixo cores e estilos em um lugar só para manter a consistência da experiência cinematográfica.

import { StyleSheet } from 'react-native';

// Paleta escura cinematográfica com tons dourados para estrelas e destaques.
export const cores = {
    fundo: '#0D0F14',
    superficie: '#161922',
    superficieAlta: '#212634',
    borda: '#2D3344',
    texto: '#F3F4F8',
    secundario: '#98A0B3',
    destaque: '#E5A93C',
    sobreDestaque: '#130E05',
    erro: '#FF6B6B',
    sucesso: '#4EBA87',
    neutro: '#444C60',
};

// Compartilho os formatos e dimensões padronizados.
export const estilos = StyleSheet.create({
    tela: {
        flex: 1,
        backgroundColor: cores.fundo,
    },
    conteudo: {
        padding: 20,
        gap: 16,
        width: '100%',
        maxWidth: 720,
        alignSelf: 'center',
    },
    grupo: {
        gap: 10,
    },
    linha: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    expandir: {
        flex: 1,
    },
    etiqueta: {
        color: cores.destaque,
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 2,
    },
    titulo: {
        color: cores.texto,
        fontSize: 28,
        fontWeight: '700',
    },
    subtitulo: {
        color: cores.texto,
        fontSize: 18,
        fontWeight: '600',
    },
    texto: {
        color: cores.texto,
        fontSize: 15,
        lineHeight: 22,
    },
    descricao: {
        color: cores.secundario,
        fontSize: 14,
        lineHeight: 20,
    },
    cartao: {
        backgroundColor: cores.superficie,
        borderColor: cores.borda,
        borderWidth: 1,
        borderRadius: 16,
        padding: 16,
        gap: 12,
    },
    campo: {
        color: cores.texto,
        backgroundColor: cores.superficie,
        borderColor: cores.borda,
        borderWidth: 1,
        borderRadius: 12,
        minHeight: 50,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 15,
    },
    campoMultilinha: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    botao: {
        minHeight: 50,
        backgroundColor: cores.destaque,
        borderRadius: 12,
        paddingHorizontal: 18,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    botaoTexto: {
        color: cores.sobreDestaque,
        fontSize: 15,
        fontWeight: '700',
        textAlign: 'center',
    },
    botaoSecundario: {
        backgroundColor: cores.superficie,
        borderWidth: 1,
        borderColor: cores.borda,
    },
    textoSecundario: {
        color: cores.texto,
    },
    desabilitado: {
        opacity: 0.45,
    },
    pressionado: {
        opacity: 0.7,
    },
    erro: {
        color: cores.erro,
    },
    sucesso: {
        color: cores.sucesso,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: '#2A2418',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    iniciais: {
        color: cores.destaque,
        fontSize: 18,
        fontWeight: '700',
    },
    separador: {
        height: 12,
    },
    foto: {
        width: 90,
        height: 90,
        borderRadius: 18,
    },
    badge: {
        backgroundColor: cores.superficieAlta,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    badgeTexto: {
        color: cores.destaque,
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    chip: {
        backgroundColor: cores.superficie,
        borderColor: cores.borda,
        borderWidth: 1,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
    },
    chipAtivo: {
        backgroundColor: cores.destaque,
        borderColor: cores.destaque,
    },
    chipTexto: {
        color: cores.secundario,
        fontSize: 13,
        fontWeight: '600',
    },
    chipTextoAtivo: {
        color: cores.sobreDestaque,
        fontSize: 13,
        fontWeight: '700',
    },
    poster: {
        width: 70,
        height: 105,
        borderRadius: 8,
        backgroundColor: cores.superficieAlta,
    },
    posterGrande: {
        width: 120,
        height: 180,
        borderRadius: 12,
        backgroundColor: cores.superficieAlta,
        alignSelf: 'center',
    },
});
