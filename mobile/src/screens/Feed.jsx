// Feed principal de publicações e análises do CineLog.
import { useCallback, useEffect, useState } from 'react';
import { router } from 'expo-router';
import {
    FlatList,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { cores, estilos } from '../theme/tema';
import { listarPosts } from '../services/post-servico';
import CardPost from '../components/CardPost';
import Aviso from '../components/Aviso';
import Botao from '../components/Botao';

const CATEGORIAS = [
    { chave: 'todos', label: 'Todos' },
    { chave: 'filme', label: 'Filmes' },
    { chave: 'serie', label: 'Séries' },
    { chave: 'livro', label: 'Livros' },
    { chave: 'outro', label: 'Outros' },
];

export default function Feed() {
    const [categoria, definirCategoria] = useState('todos');
    const [grupos, definirGrupos] = useState([]);
    const [carregando, definirCarregando] = useState(true);
    const [atualizando, definirAtualizando] = useState(false);
    const [erro, definirErro] = useState('');

    const carregarFeed = useCallback(async function carregar(cat = categoria, ehAtualizacao = false) {
        if (!ehAtualizacao) definirCarregando(true);
        definirErro('');

        try {
            const resposta = await listarPosts(cat);
            if (resposta && resposta.dados) {
                definirGrupos(resposta.dados);
            } else {
                definirGrupos([]);
            }
        } catch (falha) {
            definirErro(falha.message || 'Erro ao carregar o feed.');
        } finally {
            definirCarregando(false);
            definirAtualizando(false);
        }
    }, [categoria]);

    useEffect(function aoMudarCategoria() {
        carregarFeed(categoria);
    }, [categoria, carregarFeed]);

    function onRefresh() {
        definirAtualizando(true);
        carregarFeed(categoria, true);
    }

    return (
        <View style={estilos.tela}>
            {/* Filtros de Categoria */}
            <View style={estilosLocais.barraFiltros}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={estilosLocais.listaFiltros}
                >
                    {CATEGORIAS.map(function renderItem(item) {
                        const ativo = categoria === item.chave;
                        return (
                            <Pressable
                                key={item.chave}
                                onPress={function toque() {
                                    definirCategoria(item.chave);
                                }}
                                style={[estilos.chip, ativo && estilos.chipAtivo]}
                            >
                                <Text style={[estilos.chipTexto, ativo && estilos.chipTextoAtivo]}>
                                    {item.label}
                                </Text>
                            </Pressable>
                        );
                    })}
                </ScrollView>
            </View>

            {carregando && (
                <View style={estilos.conteudo}>
                    <Aviso
                        mensagem="Carregando publicações..."
                        carregando
                    />
                </View>
            )}

            {erro ? (
                <View style={estilos.conteudo}>
                    <Aviso
                        mensagem={erro}
                        erro
                        aoTentar={function tentar() {
                            carregarFeed(categoria);
                        }}
                    />
                </View>
            ) : null}

            {!carregando && grupos.length === 0 && !erro ? (
                <View style={[estilos.conteudo, estilosLocais.vazio]}>
                    <Text style={estilos.titulo}>Nenhuma publicação</Text>
                    <Text style={estilos.descricao}>
                        Seja o primeiro a avaliar um filme ou série nessa categoria!
                    </Text>
                    <Botao
                        titulo="Escrever avaliação"
                        aoPressionar={function irParaNovo() {
                            router.push('/posts/novo');
                        }}
                    />
                </View>
            ) : null}

            <FlatList
                data={grupos}
                keyExtractor={function extrair(item, index) {
                    if (item.tipo === 'analise') {
                        return 'analise-' + item.analise.id;
                    }
                    return 'post-' + (item.post ? item.post.id : index);
                }}
                contentContainerStyle={[estilos.conteudo, { paddingBottom: 80 }]}
                refreshControl={
                    <RefreshControl
                        refreshing={atualizando}
                        onRefresh={onRefresh}
                        tintColor={cores.destaque}
                    />
                }
                renderItem={function renderizar({ item }) {
                    return <CardPost grupo={item} />;
                }}
            />

            {/* Botão flutuante para nova publicação */}
            <Pressable
                onPress={function novoPost() {
                    router.push('/posts/novo');
                }}
                style={({ pressed }) => [
                    estilosLocais.botaoFlutuante,
                    pressed && estilos.pressionado,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Nova publicação"
            >
                <Text style={estilosLocais.iconeFlutuante}>+</Text>
            </Pressable>
        </View>
    );
}

const estilosLocais = StyleSheet.create({
    barraFiltros: {
        backgroundColor: cores.superficie,
        borderBottomColor: cores.borda,
        borderBottomWidth: 1,
        paddingVertical: 10,
    },
    listaFiltros: {
        paddingHorizontal: 16,
        gap: 8,
    },
    vazio: {
        alignItems: 'center',
        paddingVertical: 48,
        textAlign: 'center',
    },
    botaoFlutuante: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: cores.destaque,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    iconeFlutuante: {
        color: cores.sobreDestaque,
        fontSize: 32,
        fontWeight: 'bold',
        lineHeight: 34,
    },
});
