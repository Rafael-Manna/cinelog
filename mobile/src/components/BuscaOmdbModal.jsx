// Modal de busca de filmes, séries e obras via API do OMDb com preenchimento automático.
import { useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cores, estilos } from '../theme/tema';
import { buscarFilmes } from '../services/busca-servico';
import Botao from './Botao';

export default function BuscaOmdbModal({ visivel, aoFechar, aoSelecionar }) {
    const [termo, definirTermo] = useState('');
    const [resultados, definirResultados] = useState([]);
    const [buscando, definirBuscando] = useState(false);
    const [erro, definirErro] = useState('');

    async function executarBusca() {
        if (!termo || termo.trim().length < 2) {
            definirErro('Digite pelo menos 2 caracteres.');
            return;
        }

        definirBuscando(true);
        definirErro('');
        try {
            const resposta = await buscarFilmes(termo);
            if (resposta && resposta.resultados) {
                definirResultados(resposta.resultados);
                if (resposta.resultados.length === 0) {
                    definirErro('Nenhum título encontrado para essa busca.');
                }
            } else {
                definirResultados([]);
            }
        } catch (falha) {
            definirErro(falha.message || 'Erro ao consultar filmes.');
        } finally {
            definirBuscando(false);
        }
    }

    function escolherItem(item) {
        aoSelecionar(item);
        definirTermo('');
        definirResultados([]);
        aoFechar();
    }

    return (
        <Modal
            visible={visivel}
            animationType="slide"
            onRequestClose={aoFechar}
        >
            <SafeAreaView style={estilos.tela}>
                <View style={[estilos.conteudo, { flex: 1 }]}>
                    <View style={estilos.linha}>
                        <View style={estilos.expandir}>
                            <Text style={estilos.titulo}>Buscar no OMDb</Text>
                            <Text style={estilos.descricao}>Encontre filmes e séries com pôster automático</Text>
                        </View>
                        <Pressable
                            onPress={aoFechar}
                            style={estilosLocais.fechar}
                        >
                            <Text style={estilosLocais.fecharTexto}>✕</Text>
                        </Pressable>
                    </View>

                    <View style={estilos.linha}>
                        <TextInput
                            style={[estilos.campo, estilos.expandir]}
                            placeholder="Ex: The Batman, Breaking Bad..."
                            placeholderTextColor={cores.secundario}
                            selectionColor={cores.destaque}
                            value={termo}
                            onChangeText={definirTermo}
                            onSubmitEditing={executarBusca}
                            returnKeyType="search"
                            autoCorrect={false}
                        />
                        <Botao
                            titulo={buscando ? '...' : 'Buscar'}
                            aoPressionar={executarBusca}
                            desabilitado={buscando}
                        />
                    </View>

                    {buscando && (
                        <View style={estilosLocais.centro}>
                            <ActivityIndicator
                                size="large"
                                color={cores.destaque}
                            />
                            <Text style={estilos.descricao}>Procurando no catálogo...</Text>
                        </View>
                    )}

                    {erro ? (
                        <Text style={[estilos.descricao, estilos.erro]}>{erro}</Text>
                    ) : null}

                    <FlatList
                        data={resultados}
                        keyExtractor={function extrair(item) {
                            return item.imdbId || item.titulo;
                        }}
                        contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
                        renderItem={function renderizar({ item }) {
                            return (
                                <Pressable
                                    onPress={function toque() {
                                        escolherItem(item);
                                    }}
                                    style={({ pressed }) => [
                                        estilos.cartao,
                                        estilos.linha,
                                        pressed && estilos.pressionado,
                                    ]}
                                >
                                    {item.posterUrl ? (
                                        <Image
                                            source={{ uri: item.posterUrl }}
                                            style={estilos.poster}
                                            resizeMode="cover"
                                        />
                                    ) : (
                                        <View style={[estilos.poster, estilosLocais.semPoster]}>
                                            <Text style={estilos.descricao}>Sem foto</Text>
                                        </View>
                                    )}
                                    <View style={[estilos.expandir, estilos.grupo]}>
                                        <Text
                                            style={estilos.subtitulo}
                                            numberOfLines={2}
                                        >
                                            {item.titulo}
                                        </Text>
                                        <View style={estilos.linha}>
                                            {item.ano && (
                                                <Text style={estilos.descricao}>{item.ano}</Text>
                                            )}
                                            <View style={estilos.badge}>
                                                <Text style={estilos.badgeTexto}>
                                                    {item.categoria}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                </Pressable>
                            );
                        }}
                    />
                </View>
            </SafeAreaView>
        </Modal>
    );
}

const estilosLocais = StyleSheet.create({
    fechar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: cores.superficie,
        alignItems: 'center',
        justifyContent: 'center',
    },
    fecharTexto: {
        color: cores.texto,
        fontSize: 18,
        fontWeight: 'bold',
    },
    centro: {
        padding: 24,
        alignItems: 'center',
        gap: 12,
    },
    semPoster: {
        alignItems: 'center',
        justifyContent: 'center',
    },
});
