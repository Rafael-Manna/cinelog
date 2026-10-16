// Card que apresenta uma publicação individual ou uma análise em conjunto no feed do CineLog.
import { router } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { cores, estilos } from '../theme/tema';
import Estrelas from './Estrelas';

export default function CardPost({ grupo }) {
    if (grupo.tipo === 'analise') {
        const analise = grupo.analise;
        const posts = grupo.posts || [];
        const totalMembros = grupo.totalMembros || 0;
        const faltamEscrever = totalMembros - posts.length;

        return (
            <View style={[estilos.cartao, estilosLocais.cartaoAnalise]}>
                <View style={estilos.linha}>
                    <View style={estilos.badge}>
                        <Text style={estilos.badgeTexto}>
                            ANÁLISE CONJUNTA • {analise.Lista ? analise.Lista.nome : 'LISTA'}
                        </Text>
                    </View>
                    {faltamEscrever > 0 && (
                        <Text style={[estilos.descricao, { fontSize: 12 }]}>
                            Falta {faltamEscrever} membro escrever
                        </Text>
                    )}
                </View>

                <View style={estilos.linha}>
                    {analise.posterUrl ? (
                        <Image
                            source={{ uri: analise.posterUrl }}
                            style={estilos.poster}
                            resizeMode="cover"
                        />
                    ) : null}
                    <View style={[estilos.expandir, estilos.grupo]}>
                        <Text style={estilos.subtitulo}>{analise.titulo}</Text>
                        <View style={estilos.linha}>
                            {analise.ano && <Text style={estilos.descricao}>{analise.ano}</Text>}
                            <Text style={estilos.descricao}>• {analise.categoria}</Text>
                        </View>
                    </View>
                </View>

                {/* Avaliações lado a lado dos membros que já escreveram */}
                <View style={estilosLocais.gradeAvaliacoes}>
                    {posts.map(function renderItem(post) {
                        return (
                            <Pressable
                                key={post.id}
                                onPress={function toque() {
                                    router.push('/posts/' + post.id);
                                }}
                                style={({ pressed }) => [
                                    estilosLocais.subCard,
                                    pressed && estilos.pressionado,
                                ]}
                            >
                                <View style={estilos.linha}>
                                    <View style={estilos.avatar}>
                                        <Text style={estilos.iniciais}>
                                            {post.User && post.User.nome ? post.User.nome.charAt(0).toUpperCase() : '?'}
                                        </Text>
                                    </View>
                                    <View style={estilos.expandir}>
                                        <Text style={[estilos.texto, { fontWeight: '700' }]}>
                                            {post.User ? post.User.nome : 'Anônimo'}
                                        </Text>
                                        <Estrelas nota={post.nota} tamanho={14} />
                                    </View>
                                </View>
                                <Text
                                    style={estilos.descricao}
                                    numberOfLines={3}
                                >
                                    "{post.conteudo}"
                                </Text>
                            </Pressable>
                        );
                    })}
                </View>
            </View>
        );
    }

    // Postagem individual comum
    const post = grupo.post;
    if (!post) return null;

    return (
        <Pressable
            onPress={function toque() {
                router.push('/posts/' + post.id);
            }}
            style={({ pressed }) => [
                estilos.cartao,
                pressed && estilos.pressionado,
            ]}
        >
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
                        avaliou {post.categoria}
                    </Text>
                </View>
                <Estrelas nota={post.nota} />
            </View>

            <View style={estilos.linha}>
                {post.posterUrl ? (
                    <Image
                        source={{ uri: post.posterUrl }}
                        style={estilos.poster}
                        resizeMode="cover"
                    />
                ) : null}
                <View style={[estilos.expandir, estilos.grupo]}>
                    <Text style={estilos.subtitulo}>{post.titulo}</Text>
                    <Text
                        style={estilos.texto}
                        numberOfLines={4}
                    >
                        {post.conteudo}
                    </Text>
                </View>
            </View>
        </Pressable>
    );
}

const estilosLocais = StyleSheet.create({
    cartaoAnalise: {
        borderColor: cores.destaque,
        borderWidth: 1.5,
    },
    gradeAvaliacoes: {
        gap: 10,
        marginTop: 6,
    },
    subCard: {
        backgroundColor: cores.superficieAlta,
        padding: 12,
        borderRadius: 12,
        gap: 8,
    },
});
