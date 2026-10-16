// Tela com o detalhamento completo de uma avaliação e seus comentários.
import { useCallback, useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import {
    ActivityIndicator,
    Alert,
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
import { useAcesso } from '../contexts/AcessoContext';
import { consultarPost, excluirPost } from '../services/post-servico';
import { criarComentario, excluirComentario } from '../services/comentario-servico';
import Estrelas from '../components/Estrelas';
import Campo from '../components/Campo';
import Botao from '../components/Botao';
import Aviso from '../components/Aviso';

export default function DetalhePost() {
    const { id } = useLocalSearchParams();
    const { usuario } = useAcesso();

    const [post, definirPost] = useState(null);
    const [carregando, definirCarregando] = useState(true);
    const [erro, definirErro] = useState('');

    const [novoComentario, definirNovoComentario] = useState('');
    const [enviandoComentario, definirEnviandoComentario] = useState(false);

    const carregarDetalhes = useCallback(async function carregar() {
        definirCarregando(true);
        definirErro('');
        try {
            const resposta = await consultarPost(id);
            if (resposta && resposta.dados) {
                definirPost(resposta.dados);
            }
        } catch (falha) {
            definirErro(falha.message || 'Erro ao carregar publicação.');
        } finally {
            definirCarregando(false);
        }
    }, [id]);

    useEffect(function iniciar() {
        carregarDetalhes();
    }, [carregarDetalhes]);

    async function enviarComentario() {
        if (!novoComentario.trim()) return;

        definirEnviandoComentario(true);
        try {
            const resposta = await criarComentario(id, novoComentario.trim());
            definirNovoComentario('');
            if (resposta && resposta.dados && post) {
                const comentariosAtualizados = (post.Comments || []).concat(resposta.dados);
                definirPost(Object.assign({}, post, { Comments: comentariosAtualizados }));
            }
        } catch (falha) {
            Alert.alert('Erro', falha.message || 'Não foi possível comentar.');
        } finally {
            definirEnviandoComentario(false);
        }
    }

    async function deletarComentario(comentarioId) {
        try {
            await excluirComentario(comentarioId);
            if (post) {
                const filtrados = (post.Comments || []).filter(function(c) {
                    return c.id !== comentarioId;
                });
                definirPost(Object.assign({}, post, { Comments: filtrados }));
            }
        } catch (falha) {
            Alert.alert('Erro', falha.message || 'Não foi possível excluir o comentário.');
        }
    }

    async function confirmarExclusaoPost() {
        Alert.alert(
            'Excluir publicação',
            'Tem certeza que deseja apagar esta avaliação?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async function executarExclusao() {
                        try {
                            await excluirPost(id);
                            router.replace('/(menu)');
                        } catch (falha) {
                            Alert.alert('Erro', falha.message || 'Erro ao excluir.');
                        }
                    },
                },
            ]
        );
    }

    if (carregando) {
        return (
            <View style={[estilos.tela, estilosLocais.centro]}>
                <ActivityIndicator
                    size="large"
                    color={cores.destaque}
                />
            </View>
        );
    }

    if (!post) {
        return (
            <View style={[estilos.tela, estilos.conteudo]}>
                <Aviso
                    mensagem={erro || 'Publicação não encontrada.'}
                    erro
                    aoTentar={carregarDetalhes}
                />
            </View>
        );
    }

    const souAutor = usuario && post.userId === usuario.id;

    return (
        <KeyboardAvoidingView
            style={estilos.tela}
            behavior="padding"
            enabled={Platform.OS === 'ios'}
        >
            <ScrollView
                contentContainerStyle={[estilos.conteudo, { paddingBottom: 60 }]}
                keyboardShouldPersistTaps="handled"
            >
                {/* Cabeçalho do Autor */}
                <View style={estilos.linha}>
                    <View style={estilos.avatar}>
                        <Text style={estilos.iniciais}>
                            {post.User && post.User.nome ? post.User.nome.charAt(0).toUpperCase() : '?'}
                        </Text>
                    </View>
                    <View style={estilos.expandir}>
                        <Text style={[estilos.texto, { fontWeight: '700' }]}>
                            {post.User ? post.User.nome : 'Usuário'}
                        </Text>
                        <Text style={estilos.descricao}>
                            {post.categoria}
                        </Text>
                    </View>
                    <Estrelas
                        nota={post.nota}
                        tamanho={20}
                    />
                </View>

                {/* Pôster e Informações */}
                <View style={[estilos.cartao, estilosLocais.cartaoPrincipal]}>
                    {post.posterUrl ? (
                        <Image
                            source={{ uri: post.posterUrl }}
                            style={estilos.posterGrande}
                            resizeMode="cover"
                        />
                    ) : null}

                    <Text style={estilos.titulo}>{post.titulo}</Text>
                    <Text style={[estilos.texto, estilosLocais.conteudoTexto]}>
                        {post.conteudo}
                    </Text>
                </View>

                {/* Opção de exclusão pelo autor */}
                {souAutor && (
                    <Botao
                        titulo="Excluir minha publicação"
                        aoPressionar={confirmarExclusaoPost}
                        perigo
                    />
                )}

                {/* Seção de Comentários */}
                <View style={[estilos.grupo, { marginTop: 12 }]}>
                    <Text style={estilos.subtitulo}>
                        Comentários ({post.Comments ? post.Comments.length : 0})
                    </Text>

                    {post.Comments && post.Comments.length > 0 ? (
                        post.Comments.map(function renderComentario(c) {
                            const meuComentario = usuario && c.userId === usuario.id;
                            return (
                                <View
                                    key={c.id}
                                    style={[estilos.cartao, estilosLocais.cartaoComentario]}
                                >
                                    <View style={estilos.linha}>
                                        <View style={[estilos.avatar, { width: 36, height: 36, borderRadius: 10 }]}>
                                            <Text style={[estilos.iniciais, { fontSize: 14 }]}>
                                                {c.User && c.User.nome ? c.User.nome.charAt(0).toUpperCase() : '?'}
                                            </Text>
                                        </View>
                                        <View style={estilos.expandir}>
                                            <Text style={[estilos.texto, { fontWeight: '600' }]}>
                                                {c.User ? c.User.nome : 'Usuário'}
                                            </Text>
                                        </View>
                                        {meuComentario && (
                                            <Pressable
                                                onPress={function apagar() {
                                                    deletarComentario(c.id);
                                                }}
                                            >
                                                <Text style={{ color: cores.erro, fontSize: 13 }}>Excluir</Text>
                                            </Pressable>
                                        )}
                                    </View>
                                    <Text style={estilos.texto}>{c.conteudo}</Text>
                                </View>
                            );
                        })
                    ) : (
                        <Text style={estilos.descricao}>Nenhum comentário ainda. Deixe sua opinião!</Text>
                    )}
                </View>

                {/* Formulário para novo comentário */}
                {usuario && (
                    <View style={[estilos.cartao, { marginTop: 8 }]}>
                        <Campo
                            rotulo="Escrever comentário"
                            value={novoComentario}
                            onChangeText={definirNovoComentario}
                            placeholder="O que achou desta crítica?"
                            multiline
                            numberOfLines={3}
                            editable={!enviandoComentario}
                        />
                        <Botao
                            titulo={enviandoComentario ? 'Enviando...' : 'Comentar'}
                            aoPressionar={enviarComentario}
                            desabilitado={enviandoComentario || !novoComentario.trim()}
                        />
                    </View>
                )}
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const estilosLocais = StyleSheet.create({
    centro: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    cartaoPrincipal: {
        gap: 16,
    },
    conteudoTexto: {
        fontSize: 16,
        lineHeight: 26,
    },
    cartaoComentario: {
        padding: 12,
        backgroundColor: cores.superficieAlta,
        gap: 8,
    },
});
