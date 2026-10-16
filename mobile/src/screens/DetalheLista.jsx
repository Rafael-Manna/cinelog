// Tela de detalhes e gerenciamento de uma lista colaborativa (Mashup).
import { useCallback, useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { cores, estilos } from '../theme/tema';
import { useAcesso } from '../contexts/AcessoContext';
import {
    adicionarItem,
    adicionarMembro,
    avaliarJunto,
    consultarLista,
    excluirLista,
    marcarAssistido,
    removerItem,
    removerMembro,
    sairDaLista,
    votarItem,
} from '../services/lista-servico';
import Botao from '../components/Botao';
import Aviso from '../components/Aviso';
import BuscaOmdbModal from '../components/BuscaOmdbModal';

export default function DetalheLista() {
    const { id } = useLocalSearchParams();
    const { usuario } = useAcesso();

    const [dadosLista, definirDadosLista] = useState(null);
    const [abaAtiva, definirAbaAtiva] = useState('pendentes'); // 'pendentes' | 'aprovados' | 'assistidos' | 'membros'
    const [carregando, definirCarregando] = useState(true);
    const [erro, definirErro] = useState('');

    const [modalBuscaAberto, definirModalBuscaAberto] = useState(false);
    const [modalConvidarAberto, definirModalConvidarAberto] = useState(false);
    const [emailConvidado, definirEmailConvidado] = useState('');
    const [convidando, definirConvidando] = useState(false);

    const carregarDetalhes = useCallback(async function carregar() {
        definirCarregando(true);
        definirErro('');
        try {
            const resposta = await consultarLista(id);
            if (resposta && resposta.dados) {
                definirDadosLista(resposta.dados);
            }
        } catch (falha) {
            definirErro(falha.message || 'Erro ao carregar lista colaborativa.');
        } finally {
            definirCarregando(false);
        }
    }, [id]);

    useEffect(function iniciar() {
        carregarDetalhes();
    }, [carregarDetalhes]);

    async function votar(itemId, escolha) {
        try {
            await votarItem(itemId, escolha);
            carregarDetalhes();
        } catch (falha) {
            Alert.alert('Erro ao votar', falha.message || 'Não foi possível registrar o voto.');
        }
    }

    async function alternarAssistido(itemId) {
        try {
            await marcarAssistido(itemId);
            carregarDetalhes();
        } catch (falha) {
            Alert.alert('Erro', falha.message || 'Não foi possível atualizar.');
        }
    }

    async function iniciarAnaliseConjunta(item) {
        try {
            const resposta = await avaliarJunto(item.dados.id);
            if (resposta && resposta.dados) {
                router.push({
                    pathname: '/posts/novo',
                    params: {
                        analiseId: resposta.dados.id,
                        titulo: item.dados.titulo,
                        categoria: item.dados.categoria,
                        posterUrl: item.dados.posterUrl || '',
                        imdbId: item.dados.imdbId || '',
                    },
                });
            }
        } catch (falha) {
            Alert.alert('Erro', falha.message || 'Não foi possível iniciar avaliação.');
        }
    }

    async function indicarObra(obra) {
        try {
            await adicionarItem(id, {
                titulo: obra.titulo,
                categoria: obra.categoria,
                ano: obra.ano,
                posterUrl: obra.posterUrl,
                imdbId: obra.imdbId,
            });
            carregarDetalhes();
        } catch (falha) {
            Alert.alert('Erro ao indicar', falha.message || 'Não foi possível indicar o filme.');
        }
    }

    async function convidarMembro() {
        if (!emailConvidado.trim()) return;
        definirConvidando(true);
        try {
            await adicionarMembro(id, emailConvidado.trim());
            definirEmailConvidado('');
            definirModalConvidarAberto(false);
            carregarDetalhes();
            Alert.alert('Sucesso', 'Membro convidado para a lista!');
        } catch (falha) {
            Alert.alert('Erro ao convidar', falha.message || 'Não foi possível adicionar membro.');
        } finally {
            definirConvidando(false);
        }
    }

    async function excluirItemLista(itemId) {
        try {
            await removerItem(itemId);
            carregarDetalhes();
        } catch (falha) {
            Alert.alert('Erro', falha.message || 'Não foi possível remover item.');
        }
    }

    async function acaoSair() {
        Alert.alert(
            'Sair da lista',
            'Deseja realmente sair desta lista colaborativa?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Sair',
                    style: 'destructive',
                    onPress: async function executarSaida() {
                        try {
                            await sairDaLista(id);
                            router.replace('/(menu)/listas');
                        } catch (falha) {
                            Alert.alert('Erro', falha.message || 'Não foi possível sair.');
                        }
                    },
                },
            ]
        );
    }

    async function acaoExcluirLista() {
        Alert.alert(
            'Excluir lista',
            'Tem certeza que deseja apagar esta lista e todos os itens dela?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async function executarExclusao() {
                        try {
                            await excluirLista(id);
                            router.replace('/(menu)/listas');
                        } catch (falha) {
                            Alert.alert('Erro', falha.message || 'Não foi possível excluir.');
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

    if (!dadosLista) {
        return (
            <View style={[estilos.tela, estilos.conteudo]}>
                <Aviso
                    mensagem={erro || 'Lista não encontrada.'}
                    erro
                    aoTentar={carregarDetalhes}
                />
            </View>
        );
    }

    const { lista, souDono, membros, aprovados, assistidos, pendentes, rejeitados } = dadosLista;

    return (
        <View style={estilos.tela}>
            <ScrollView contentContainerStyle={[estilos.conteudo, { paddingBottom: 80 }]}>
                {/* Cabeçalho da Lista */}
                <View style={estilos.cartao}>
                    <View style={estilos.linha}>
                        <View style={estilos.expandir}>
                            <Text style={estilos.titulo}>{lista.nome}</Text>
                            {lista.descricao ? (
                                <Text style={estilos.descricao}>{lista.descricao}</Text>
                            ) : null}
                        </View>
                        <View style={estilos.badge}>
                            <Text style={estilos.badgeTexto}>
                                {souDono ? 'Você é o Dono' : 'Membro'}
                            </Text>
                        </View>
                    </View>

                    <View style={estilos.linha}>
                        <Botao
                            titulo="🎬 Indicar Filme / Série"
                            aoPressionar={function abrir() {
                                definirModalBuscaAberto(true);
                            }}
                        />
                        {souDono ? (
                            <Botao
                                titulo="✉️ Convidar"
                                aoPressionar={function abrirConvidar() {
                                    definirModalConvidarAberto(true);
                                }}
                                secundario
                            />
                        ) : null}
                    </View>
                </View>

                {/* Abas de Navegação Interna da Lista */}
                <View style={estilosLocais.navegacaoAbas}>
                    <Pressable
                        onPress={function() { definirAbaAtiva('pendentes'); }}
                        style={[estilosLocais.aba, abaAtiva === 'pendentes' && estilosLocais.abaAtiva]}
                    >
                        <Text style={[estilosLocais.abaTexto, abaAtiva === 'pendentes' && estilosLocais.abaTextoAtivo]}>
                            Votação ({pendentes.length})
                        </Text>
                    </Pressable>

                    <Pressable
                        onPress={function() { definirAbaAtiva('aprovados'); }}
                        style={[estilosLocais.aba, abaAtiva === 'aprovados' && estilosLocais.abaAtiva]}
                    >
                        <Text style={[estilosLocais.abaTexto, abaAtiva === 'aprovados' && estilosLocais.abaTextoAtivo]}>
                            Fila ({aprovados.length})
                        </Text>
                    </Pressable>

                    <Pressable
                        onPress={function() { definirAbaAtiva('assistidos'); }}
                        style={[estilosLocais.aba, abaAtiva === 'assistidos' && estilosLocais.abaAtiva]}
                    >
                        <Text style={[estilosLocais.abaTexto, abaAtiva === 'assistidos' && estilosLocais.abaTextoAtivo]}>
                            Assistidos ({assistidos.length})
                        </Text>
                    </Pressable>

                    <Pressable
                        onPress={function() { definirAbaAtiva('membros'); }}
                        style={[estilosLocais.aba, abaAtiva === 'membros' && estilosLocais.abaAtiva]}
                    >
                        <Text style={[estilosLocais.abaTexto, abaAtiva === 'membros' && estilosLocais.abaTextoAtivo]}>
                            Galera ({membros.length})
                        </Text>
                    </Pressable>
                </View>

                {/* Conteúdo da Aba VOTAÇÃO PENDENTE */}
                {abaAtiva === 'pendentes' && (
                    <View style={estilos.grupo}>
                        {pendentes.length === 0 ? (
                            <View style={estilosLocais.vazioAba}>
                                <Text style={estilos.descricao}>Nenhum item aguardando votos no momento.</Text>
                            </View>
                        ) : (
                            pendentes.map(function renderPendente(item) {
                                return (
                                    <View
                                        key={item.dados.id}
                                        style={estilos.cartao}
                                    >
                                        <View style={estilos.linha}>
                                            {item.dados.posterUrl ? (
                                                <Image
                                                    source={{ uri: item.dados.posterUrl }}
                                                    style={estilos.poster}
                                                />
                                            ) : null}
                                            <View style={[estilos.expandir, estilos.grupo]}>
                                                <Text style={estilos.subtitulo}>{item.dados.titulo}</Text>
                                                <Text style={estilos.descricao}>
                                                    Indicado por {item.dados.Indicou ? item.dados.Indicou.nome : 'membro'}
                                                </Text>
                                                <Text style={estilos.descricao}>
                                                    👍 {item.sim.length} sim • 👎 {item.nao.length} não
                                                </Text>
                                                {item.faltam && item.faltam.length > 0 && (
                                                    <Text style={[estilos.descricao, { fontSize: 12 }]}>
                                                        Faltam votar: {item.faltam.map(function(m) { return m.nome; }).join(', ')}
                                                    </Text>
                                                )}
                                            </View>
                                        </View>

                                        {/* Botões de Voto Unânime */}
                                        <View style={estilos.linha}>
                                            <Pressable
                                                onPress={function() { votar(item.dados.id, 'sim'); }}
                                                style={[
                                                    estilosLocais.botaoVoto,
                                                    item.meuVoto === 'sim' ? estilosLocais.votoAtivoSim : estilosLocais.votoInativo,
                                                ]}
                                            >
                                                <Text style={estilosLocais.textoVoto}>
                                                    {item.meuVoto === 'sim' ? '✓ Quero ver' : 'Quero ver'}
                                                </Text>
                                            </Pressable>

                                            <Pressable
                                                onPress={function() { votar(item.dados.id, 'nao'); }}
                                                style={[
                                                    estilosLocais.botaoVoto,
                                                    item.meuVoto === 'nao' ? estilosLocais.votoAtivoNao : estilosLocais.votoInativo,
                                                ]}
                                            >
                                                <Text style={estilosLocais.textoVoto}>
                                                    {item.meuVoto === 'nao' ? '✕ Não quero (Veto)' : 'Não quero'}
                                                </Text>
                                            </Pressable>

                                            {item.podeRemover && (
                                                <Pressable
                                                    onPress={function() { excluirItemLista(item.dados.id); }}
                                                    style={estilosLocais.botaoLixeira}
                                                >
                                                    <Text style={{ color: cores.erro }}>🗑️</Text>
                                                </Pressable>
                                            )}
                                        </View>
                                    </View>
                                );
                            })
                        )}
                    </View>
                )}

                {/* Conteúdo da Aba FILA APROVADOS (Prontos para assistir) */}
                {abaAtiva === 'aprovados' && (
                    <View style={estilos.grupo}>
                        {aprovados.length === 0 ? (
                            <View style={estilosLocais.vazioAba}>
                                <Text style={estilos.descricao}>Nenhum item aprovado por todos ainda.</Text>
                            </View>
                        ) : (
                            aprovados.map(function renderAprovado(item) {
                                return (
                                    <View
                                        key={item.dados.id}
                                        style={estilos.cartao}
                                    >
                                        <View style={estilos.linha}>
                                            {item.dados.posterUrl ? (
                                                <Image
                                                    source={{ uri: item.dados.posterUrl }}
                                                    style={estilos.poster}
                                                />
                                            ) : null}
                                            <View style={[estilos.expandir, estilos.grupo]}>
                                                <Text style={estilos.subtitulo}>{item.dados.titulo}</Text>
                                                <Text style={estilos.descricao}>
                                                    ✅ Aprovado por 100% dos membros
                                                </Text>
                                                <Botao
                                                    titulo="Marcar como Assistido"
                                                    aoPressionar={function() { alternarAssistido(item.dados.id); }}
                                                />
                                            </View>
                                        </View>
                                    </View>
                                );
                            })
                        )}
                    </View>
                )}

                {/* Conteúdo da Aba JÁ ASSISTIDOS (Avaliar Junto) */}
                {abaAtiva === 'assistidos' && (
                    <View style={estilos.grupo}>
                        {assistidos.length === 0 ? (
                            <View style={estilosLocais.vazioAba}>
                                <Text style={estilos.descricao}>Nenhum item foi marcado como assistido ainda.</Text>
                            </View>
                        ) : (
                            assistidos.map(function renderAssistido(item) {
                                return (
                                    <View
                                        key={item.dados.id}
                                        style={estilos.cartao}
                                    >
                                        <View style={estilos.linha}>
                                            {item.dados.posterUrl ? (
                                                <Image
                                                    source={{ uri: item.dados.posterUrl }}
                                                    style={estilos.poster}
                                                />
                                            ) : null}
                                            <View style={[estilos.expandir, estilos.grupo]}>
                                                <Text style={estilos.subtitulo}>{item.dados.titulo}</Text>
                                                <Text style={estilos.descricao}>
                                                    👀 Assistido em conjunto
                                                </Text>

                                                {item.minhaParte ? (
                                                    <View style={estilos.badge}>
                                                        <Text style={estilos.badgeTexto}>
                                                            ✓ Você já escreveu sua crítica
                                                        </Text>
                                                    </View>
                                                ) : (
                                                    <Botao
                                                        titulo="✍️ Avaliar Junto (Escrever Crítica)"
                                                        aoPressionar={function() { iniciarAnaliseConjunta(item); }}
                                                    />
                                                )}
                                            </View>
                                        </View>
                                    </View>
                                );
                            })
                        )}
                    </View>
                )}

                {/* Conteúdo da Aba MEMBROS */}
                {abaAtiva === 'membros' && (
                    <View style={estilos.grupo}>
                        {membros.map(function renderMembro(m) {
                            const ehDonoDesteMembro = m.userId === lista.ownerId;
                            return (
                                <View
                                    key={m.id}
                                    style={[estilos.cartao, estilos.linha]}
                                >
                                    <View style={estilos.avatar}>
                                        <Text style={estilos.iniciais}>
                                            {m.User && m.User.nome ? m.User.nome.charAt(0).toUpperCase() : '?'}
                                        </Text>
                                    </View>
                                    <View style={estilos.expandir}>
                                        <Text style={[estilos.texto, { fontWeight: '700' }]}>
                                            {m.User ? m.User.nome : 'Membro'}
                                        </Text>
                                        <Text style={estilos.descricao}>
                                            {ehDonoDesteMembro ? '👑 Criador da Lista' : 'Membro votante'}
                                        </Text>
                                    </View>
                                    {souDono && !ehDonoDesteMembro && (
                                        <Pressable
                                            onPress={async function() {
                                                try {
                                                    await removerMembro(id, m.userId);
                                                    carregarDetalhes();
                                                } catch (e) {
                                                    Alert.alert('Erro', e.message);
                                                }
                                            }}
                                        >
                                            <Text style={{ color: cores.erro, fontSize: 13 }}>Remover</Text>
                                        </Pressable>
                                    )}
                                </View>
                            );
                        })}

                        {/* Botões de Ação na Lista */}
                        <View style={{ marginTop: 24, gap: 12 }}>
                            {souDono ? (
                                <Botao
                                    titulo="Excluir Lista Colaborativa"
                                    aoPressionar={acaoExcluirLista}
                                    perigo
                                />
                            ) : (
                                <Botao
                                    titulo="Sair da Lista"
                                    aoPressionar={acaoSair}
                                    secundario
                                />
                            )}
                        </View>
                    </View>
                )}
            </ScrollView>

            {/* Modal para convidar amigo por email */}
            <Modal
                visible={modalConvidarAberto}
                transparent
                animationType="fade"
                onRequestClose={function() { definirModalConvidarAberto(false); }}
            >
                <View style={estilosLocais.fundoModal}>
                    <View style={estilosLocais.caixaModal}>
                        <Text style={estilos.subtitulo}>Convidar amigo</Text>
                        <Text style={estilos.descricao}>
                            Digite o e-mail cadastrado do amigo que você quer convidar para a lista:
                        </Text>
                        <TextInput
                            style={estilos.campo}
                            placeholder="amigo@email.com"
                            placeholderTextColor={cores.secundario}
                            value={emailConvidado}
                            onChangeText={definirEmailConvidado}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                        <View style={estilos.linha}>
                            <Botao
                                titulo="Cancelar"
                                aoPressionar={function() { definirModalConvidarAberto(false); }}
                                secundario
                            />
                            <Botao
                                titulo={convidando ? 'Adicionando...' : 'Adicionar à lista'}
                                aoPressionar={convidarMembro}
                                desabilitado={convidando || !emailConvidado.trim()}
                            />
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Modal de busca OMDb para indicar filmes */}
            <BuscaOmdbModal
                visivel={modalBuscaAberto}
                aoFechar={function() { definirModalBuscaAberto(false); }}
                aoSelecionar={indicarObra}
            />
        </View>
    );
}

const estilosLocais = StyleSheet.create({
    centro: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    navegacaoAbas: {
        flexDirection: 'row',
        backgroundColor: cores.superficie,
        borderRadius: 12,
        padding: 4,
        borderWidth: 1,
        borderColor: cores.borda,
    },
    aba: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 8,
    },
    abaAtiva: {
        backgroundColor: cores.superficieAlta,
    },
    abaTexto: {
        color: cores.secundario,
        fontSize: 12,
        fontWeight: '600',
    },
    abaTextoAtivo: {
        color: cores.destaque,
        fontWeight: '700',
    },
    vazioAba: {
        padding: 32,
        alignItems: 'center',
    },
    botaoVoto: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    votoAtivoSim: {
        backgroundColor: cores.sucesso,
    },
    votoAtivoNao: {
        backgroundColor: cores.erro,
    },
    votoInativo: {
        backgroundColor: cores.superficieAlta,
        borderWidth: 1,
        borderColor: cores.borda,
    },
    textoVoto: {
        color: cores.texto,
        fontWeight: '700',
        fontSize: 13,
    },
    botaoLixeira: {
        padding: 8,
    },
    fundoModal: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    caixaModal: {
        width: '100%',
        maxWidth: 480,
        backgroundColor: cores.superficie,
        borderRadius: 16,
        padding: 20,
        gap: 16,
        borderColor: cores.borda,
        borderWidth: 1,
    },
});
