// Tela para criar uma nova avaliação individual ou escrever sua parte de uma análise conjunta.
import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import {
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { cores, estilos } from '../theme/tema';
import { criarPost } from '../services/post-servico';
import Campo from '../components/Campo';
import Botao from '../components/Botao';
import Aviso from '../components/Aviso';
import Estrelas from '../components/Estrelas';
import BuscaOmdbModal from '../components/BuscaOmdbModal';

const CATEGORIAS = [
    { chave: 'filme', label: 'Filme' },
    { chave: 'serie', label: 'Série' },
    { chave: 'livro', label: 'Livro' },
    { chave: 'outro', label: 'Outro' },
];

export default function NovaPostagem() {
    const params = useLocalSearchParams();
    const analiseParam = typeof params.analiseId === 'string' ? params.analiseId : (Array.isArray(params.analiseId) ? params.analiseId[0] : null);
    const analiseId = analiseParam ? parseInt(analiseParam, 10) : null;

    const tituloInicial = typeof params.titulo === 'string' ? params.titulo : (Array.isArray(params.titulo) ? params.titulo[0] : '');
    const categoriaInicial = typeof params.categoria === 'string' ? params.categoria : (Array.isArray(params.categoria) ? params.categoria[0] : 'filme');
    const posterUrlInicial = typeof params.posterUrl === 'string' ? params.posterUrl : (Array.isArray(params.posterUrl) ? params.posterUrl[0] : '');
    const imdbIdInicial = typeof params.imdbId === 'string' ? params.imdbId : (Array.isArray(params.imdbId) ? params.imdbId[0] : '');

    const [titulo, definirTitulo] = useState(tituloInicial);
    const [categoria, definirCategoria] = useState(categoriaInicial);
    const [nota, definirNota] = useState(8); // valor padrão: 4 estrelas (8/10)
    const [conteudo, definirConteudo] = useState('');
    const [posterUrl, definirPosterUrl] = useState(posterUrlInicial);
    const [imdbId, definirImdbId] = useState(imdbIdInicial);

    const [modalBuscaAberto, definirModalBuscaAberto] = useState(false);
    const [salvando, definirSalvando] = useState(false);
    const [erro, definirErro] = useState('');

    function aoSelecionarObra(item) {
        definirTitulo(item.titulo);
        if (item.categoria) definirCategoria(item.categoria);
        if (item.posterUrl) definirPosterUrl(item.posterUrl);
        if (item.imdbId) definirImdbId(item.imdbId);
    }

    async function salvar() {
        if (!titulo.trim() || !conteudo.trim()) {
            definirErro('Informe o título e escreva sua opinião.');
            return;
        }

        definirSalvando(true);
        definirErro('');

        try {
            await criarPost({
                titulo: titulo.trim(),
                categoria: categoria,
                nota: nota,
                conteudo: conteudo.trim(),
                posterUrl: posterUrl ? posterUrl.trim() : null,
                imdbId: imdbId ? imdbId.trim() : null,
                analiseId: analiseId,
            });

            router.replace('/(menu)');
        } catch (falha) {
            definirErro(falha.message || 'Erro ao publicar avaliação.');
        } finally {
            definirSalvando(false);
        }
    }

    return (
        <KeyboardAvoidingView
            style={estilos.tela}
            behavior="padding"
            enabled={Platform.OS === 'ios'}
        >
            <ScrollView
                contentContainerStyle={[estilos.conteudo, { paddingBottom: 40 }]}
                keyboardShouldPersistTaps="handled"
            >
                {analiseId ? (
                    <View style={estilos.badge}>
                        <Text style={estilos.badgeTexto}>
                            Escrevendo sua parte da Análise Conjunta
                        </Text>
                    </View>
                ) : (
                    <Botao
                        titulo="🔍 Buscar título no OMDb (com pôster)"
                        aoPressionar={function abrir() {
                            definirModalBuscaAberto(true);
                        }}
                        secundario
                    />
                )}

                <Aviso
                    mensagem={erro}
                    erro
                />

                {posterUrl ? (
                    <View style={estilosLocais.previaPoster}>
                        <Image
                            source={{ uri: posterUrl }}
                            style={estilos.posterGrande}
                            resizeMode="cover"
                        />
                        <Pressable
                            onPress={function removerFoto() {
                                definirPosterUrl('');
                            }}
                            style={estilosLocais.removerPoster}
                        >
                            <Text style={estilos.descricao}>Remover pôster</Text>
                        </Pressable>
                    </View>
                ) : null}

                <Campo
                    rotulo="Título da obra"
                    value={titulo}
                    onChangeText={definirTitulo}
                    placeholder="Ex: Interstellar"
                    editable={!analiseId && !salvando}
                />

                {/* Seleção de Categoria */}
                <View style={estilos.grupo}>
                    <Text style={estilos.texto}>Categoria</Text>
                    <View style={estilos.linha}>
                        {CATEGORIAS.map(function renderCat(item) {
                            const ativa = categoria === item.chave;
                            return (
                                <Pressable
                                    key={item.chave}
                                    onPress={function escolher() {
                                        if (!analiseId) definirCategoria(item.chave);
                                    }}
                                    style={[estilos.chip, ativa && estilos.chipAtivo]}
                                >
                                    <Text style={[estilos.chipTexto, ativa && estilos.chipTextoAtivo]}>
                                        {item.label}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>
                </View>

                {/* Seleção de Nota */}
                <View style={estilos.grupo}>
                    <Text style={estilos.texto}>Sua avaliação</Text>
                    <View style={estilosLocais.containerEstrelas}>
                        <Estrelas
                            nota={nota}
                            aoMudar={definirNota}
                            tamanho={32}
                        />
                        <Text style={estilos.descricao}>Toque para ajustar a nota</Text>
                    </View>
                </View>

                <Campo
                    rotulo="Sua opinião / Crítica"
                    value={conteudo}
                    onChangeText={definirConteudo}
                    placeholder="O que achou da narrativa, atuações, direção?"
                    multiline
                    numberOfLines={6}
                    editable={!salvando}
                />

                <Botao
                    titulo={salvando ? 'Publicando...' : 'Publicar Avaliação'}
                    aoPressionar={salvar}
                    desabilitado={salvando}
                />
            </ScrollView>

            <BuscaOmdbModal
                visivel={modalBuscaAberto}
                aoFechar={function fechar() {
                    definirModalBuscaAberto(false);
                }}
                aoSelecionar={aoSelecionarObra}
            />
        </KeyboardAvoidingView>
    );
}

const estilosLocais = StyleSheet.create({
    previaPoster: {
        alignItems: 'center',
        gap: 8,
    },
    removerPoster: {
        padding: 4,
    },
    containerEstrelas: {
        backgroundColor: cores.superficie,
        padding: 16,
        borderRadius: 12,
        borderColor: cores.borda,
        borderWidth: 1,
        alignItems: 'center',
        gap: 8,
    },
});
