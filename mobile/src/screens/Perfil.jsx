// Tela de perfil pessoal do CineLog mobile.
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { useAcesso } from '../contexts/AcessoContext';
import { atualizarPerfil } from '../services/acesso-servico';
import { estilos } from '../theme/tema';
import Campo from '../components/Campo';
import Botao from '../components/Botao';
import Aviso from '../components/Aviso';

export default function Perfil() {
    const { usuario, sair, atualizarPerfilLocal } = useAcesso();

    const [nome, definirNome] = useState(usuario ? usuario.nome : '');
    const [bio, definirBio] = useState(usuario && usuario.bio ? usuario.bio : '');
    const [salvando, definirSalvando] = useState(false);
    const [sucesso, definirSucesso] = useState('');
    const [erro, definirErro] = useState('');

    async function salvarAlteracoes() {
        if (!nome.trim()) {
            definirErro('O nome não pode ficar vazio.');
            return;
        }

        definirSalvando(true);
        definirErro('');
        definirSucesso('');

        try {
            const resposta = await atualizarPerfil(nome.trim(), bio.trim());
            if (resposta && resposta.dados) {
                atualizarPerfilLocal(resposta.dados);
                definirSucesso('Perfil atualizado com sucesso!');
            }
        } catch (falha) {
            definirErro(falha.message || 'Erro ao atualizar perfil.');
        } finally {
            definirSalvando(false);
        }
    }

    function confirmarSaida() {
        Alert.alert(
            'Sair do CineLog',
            'Deseja realmente encerrar sua sessão neste aparelho?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Sair',
                    style: 'destructive',
                    onPress: sair,
                },
            ]
        );
    }

    if (!usuario) return null;

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
                {/* Cabeçalho do Perfil */}
                <View style={[estilos.cartao, { alignItems: 'center', gap: 12 }]}>
                    <View style={[estilos.avatar, { width: 72, height: 72, borderRadius: 24 }]}>
                        <Text style={[estilos.iniciais, { fontSize: 28 }]}>
                            {usuario.nome ? usuario.nome.charAt(0).toUpperCase() : '?'}
                        </Text>
                    </View>
                    <Text style={estilos.titulo}>{usuario.nome}</Text>
                    <Text style={estilos.descricao}>{usuario.email}</Text>
                </View>

                {sucesso ? (
                    <Aviso mensagem={sucesso} />
                ) : null}

                {erro ? (
                    <Aviso
                        mensagem={erro}
                        erro
                    />
                ) : null}

                {/* Formulário de Edição */}
                <View style={estilos.cartao}>
                    <Text style={estilos.subtitulo}>Editar Perfil</Text>

                    <Campo
                        rotulo="Nome"
                        value={nome}
                        onChangeText={definirNome}
                        maxLength={120}
                        editable={!salvando}
                    />

                    <Campo
                        rotulo="Biografia / Bio"
                        value={bio}
                        onChangeText={definirBio}
                        placeholder="Quais seus gêneros e diretores favoritos?"
                        multiline
                        numberOfLines={4}
                        maxLength={300}
                        editable={!salvando}
                    />

                    <Botao
                        titulo={salvando ? 'Salvando...' : 'Salvar Alterações'}
                        aoPressionar={salvarAlteracoes}
                        desabilitado={salvando}
                    />
                </View>

                <View style={{ marginTop: 12 }}>
                    <Botao
                        titulo="Sair da Conta"
                        aoPressionar={confirmarSaida}
                        perigo
                    />
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
