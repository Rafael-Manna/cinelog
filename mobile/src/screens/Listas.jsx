// Tela de listas colaborativas (Mashup) do CineLog mobile.
import { useCallback, useEffect, useState } from 'react';
import { router } from 'expo-router';
import {
    FlatList,
    Pressable,
    RefreshControl,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { cores, estilos } from '../theme/tema';
import { listarListas } from '../services/lista-servico';
import CardLista from '../components/CardLista';
import Aviso from '../components/Aviso';
import Botao from '../components/Botao';

export default function Listas() {
    const [listas, definirListas] = useState([]);
    const [carregando, definirCarregando] = useState(true);
    const [atualizando, definirAtualizando] = useState(false);
    const [erro, definirErro] = useState('');

    const carregarListas = useCallback(async function carregar(ehAtualizacao = false) {
        if (!ehAtualizacao) definirCarregando(true);
        definirErro('');

        try {
            const resposta = await listarListas();
            if (resposta && resposta.dados) {
                definirListas(resposta.dados);
            } else {
                definirListas([]);
            }
        } catch (falha) {
            definirErro(falha.message || 'Erro ao carregar listas colaborativas.');
        } finally {
            definirCarregando(false);
            definirAtualizando(false);
        }
    }, []);

    useEffect(function iniciar() {
        carregarListas();
    }, [carregarListas]);

    function onRefresh() {
        definirAtualizando(true);
        carregarListas(true);
    }

    return (
        <View style={estilos.tela}>
            {carregando && (
                <View style={estilos.conteudo}>
                    <Aviso
                        mensagem="Carregando suas listas..."
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
                            carregarListas();
                        }}
                    />
                </View>
            ) : null}

            {!carregando && listas.length === 0 && !erro ? (
                <View style={[estilos.conteudo, estilosLocais.vazio]}>
                    <Text style={estilos.titulo}>Nenhuma lista criada</Text>
                    <Text style={estilos.descricao}>
                        Crie uma lista colaborativa (Mashup), convide amigos pelo e-mail e só assistam filmes aprovados por todos!
                    </Text>
                    <Botao
                        titulo="Criar primeira lista"
                        aoPressionar={function irParaNova() {
                            router.push('/listas/nova');
                        }}
                    />
                </View>
            ) : null}

            <FlatList
                data={listas}
                keyExtractor={function extrair(item) {
                    return 'lista-' + item.lista.id;
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
                    return <CardLista item={item} />;
                }}
            />

            <Pressable
                onPress={function novaLista() {
                    router.push('/listas/nova');
                }}
                style={({ pressed }) => [
                    estilosLocais.botaoFlutuante,
                    pressed && estilos.pressionado,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Nova lista colaborativa"
            >
                <Text style={estilosLocais.iconeFlutuante}>+</Text>
            </Pressable>
        </View>
    );
}

const estilosLocais = StyleSheet.create({
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
