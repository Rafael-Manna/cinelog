// Tela de criação de uma nova lista colaborativa no CineLog.
import { useState } from 'react';
import { router } from 'expo-router';
import { KeyboardAvoidingView, Platform, ScrollView, Text } from 'react-native';
import { estilos } from '../theme/tema';
import { criarLista } from '../services/lista-servico';
import Campo from '../components/Campo';
import Botao from '../components/Botao';
import Aviso from '../components/Aviso';

export default function NovaLista() {
    const [nome, definirNome] = useState('');
    const [descricao, definirDescricao] = useState('');
    const [salvando, definirSalvando] = useState(false);
    const [erro, definirErro] = useState('');

    async function salvar() {
        if (!nome.trim()) {
            definirErro('Informe um nome para a lista.');
            return;
        }

        definirSalvando(true);
        definirErro('');

        try {
            const resposta = await criarLista({
                nome: nome.trim(),
                descricao: descricao ? descricao.trim() : null,
            });

            if (resposta && resposta.dados) {
                router.replace('/listas/' + resposta.dados.id);
            } else {
                router.replace('/(menu)/listas');
            }
        } catch (falha) {
            definirErro(falha.message || 'Erro ao criar lista.');
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
                contentContainerStyle={estilos.conteudo}
                keyboardShouldPersistTaps="handled"
            >
                <Text style={estilos.etiqueta}>MASHUP</Text>
                <Text style={estilos.titulo}>Nova lista em conjunto</Text>
                <Text style={estilos.descricao}>
                    Você será o dono desta lista. Depois de criada, convide seus amigos pelo e-mail para votarem nos filmes que vocês pretendem assistir juntos!
                </Text>

                <Aviso
                    mensagem={erro}
                    erro
                />

                <Campo
                    rotulo="Nome da lista"
                    value={nome}
                    onChangeText={definirNome}
                    placeholder="Ex: Sexta do Terror, Férias com a Galera"
                    maxLength={100}
                    editable={!salvando}
                />

                <Campo
                    rotulo="Descrição (opcional)"
                    value={descricao}
                    onChangeText={definirDescricao}
                    placeholder="Ex: Só vale filme de suspense e ficção científica"
                    multiline
                    numberOfLines={3}
                    maxLength={250}
                    editable={!salvando}
                />

                <Botao
                    titulo={salvando ? 'Criando lista...' : 'Criar Lista Colaborativa'}
                    aoPressionar={salvar}
                    desabilitado={salvando}
                />
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
