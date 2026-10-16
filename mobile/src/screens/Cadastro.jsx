// Tela de cadastro de novas contas no CineLog.
import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAcesso } from '../contexts/AcessoContext';
import Campo from '../components/Campo';
import Botao from '../components/Botao';
import BotaoLink from '../components/BotaoLink';
import Aviso from '../components/Aviso';
import { estilos } from '../theme/tema';

export default function Cadastro() {
    const acesso = useAcesso();
    const [nome, definirNome] = useState('');
    const [email, definirEmail] = useState('');
    const [senha, definirSenha] = useState('');
    const [erro, definirErro] = useState('');
    const [enviando, definirEnviando] = useState(false);
    const envioEmAndamento = useRef(false);

    async function cadastrar() {
        if (envioEmAndamento.current) return;
        if (!nome.trim() || !email.trim() || !senha) {
            definirErro('Preencha seu nome, e-mail e senha.');
            return;
        }

        envioEmAndamento.current = true;
        definirEnviando(true);
        definirErro('');

        try {
            await acesso.cadastrar(nome.trim(), email.trim(), senha);
        } catch (falha) {
            definirErro(falha.message);
        } finally {
            envioEmAndamento.current = false;
            definirEnviando(false);
        }
    }

    let tituloBotao = 'Cadastrar';
    if (enviando) {
        tituloBotao = 'Criando conta...';
    }

    return (
        <SafeAreaView style={estilos.tela}>
            <KeyboardAvoidingView
                style={estilos.tela}
                behavior="padding"
                enabled={Platform.OS === 'ios'}
            >
                <ScrollView
                    contentContainerStyle={estilos.conteudo}
                    keyboardShouldPersistTaps="handled"
                >
                    <Text style={estilos.etiqueta}>NOVA CONTA</Text>
                    <Text style={estilos.titulo}>Junte-se ao CineLog</Text>
                    <Text style={estilos.descricao}>
                        Crie seu perfil e comece a avaliar filmes e séries.
                    </Text>

                    <Aviso
                        mensagem={erro}
                        erro
                    />

                    <Campo
                        rotulo="Nome completo"
                        value={nome}
                        onChangeText={definirNome}
                        maxLength={120}
                        editable={!enviando}
                        placeholder="Seu nome ou apelido"
                    />

                    <Campo
                        rotulo="E-mail"
                        value={email}
                        onChangeText={definirEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        maxLength={254}
                        editable={!enviando}
                        placeholder="seu@email.com"
                    />

                    <Campo
                        rotulo="Senha"
                        value={senha}
                        onChangeText={definirSenha}
                        secureTextEntry
                        autoCapitalize="none"
                        autoCorrect={false}
                        maxLength={128}
                        editable={!enviando}
                        placeholder="Crie uma senha segura"
                        onSubmitEditing={cadastrar}
                        returnKeyType="go"
                    />

                    <Botao
                        titulo={tituloBotao}
                        aoPressionar={cadastrar}
                        desabilitado={enviando}
                    />

                    {!enviando && (
                        <BotaoLink
                            titulo="Já tenho uma conta (Entrar)"
                            destino="/entrar"
                        />
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
