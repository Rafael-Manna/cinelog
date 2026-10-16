// Organizo as telas públicas e protegidas do CineLog, conferindo a sessão antes de liberar o aplicativo.
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { cores, estilos } from '../theme/tema';
import { AcessoProvider, useAcesso } from '../contexts/AcessoContext';
import Aviso from '../components/Aviso';

function Telas() {
    const acesso = useAcesso();

    if (acesso.carregando || acesso.erroInicial) {
        let mensagem = 'Conectando ao CineLog...';
        let tentar = null;

        if (acesso.erroInicial) {
            mensagem = acesso.erroInicial;
            tentar = acesso.restaurar;
        }

        return (
            <View style={[estilos.tela, estilos.conteudo, { justifyContent: 'center' }]}>
                <Aviso
                    mensagem={mensagem}
                    carregando={acesso.carregando}
                    erro={Boolean(acesso.erroInicial)}
                    aoTentar={tentar}
                />
            </View>
        );
    }

    return (
        <Stack screenOptions={{
            headerStyle: {
                backgroundColor: cores.superficie,
            },
            headerTintColor: cores.texto,
            headerShadowVisible: false,
            contentStyle: {
                backgroundColor: cores.fundo,
            },
        }}
        >
            {/* Rotas Privadas (Apenas usuários autenticados) */}
            <Stack.Protected guard={Boolean(acesso.usuario)}>
                <Stack.Screen
                    name="(menu)"
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="posts/novo"
                    options={{ title: 'Nova Avaliação' }}
                />
                <Stack.Screen
                    name="posts/[id]"
                    options={{ title: 'Publicação' }}
                />
                <Stack.Screen
                    name="listas/nova"
                    options={{ title: 'Nova Lista' }}
                />
                <Stack.Screen
                    name="listas/[id]"
                    options={{ title: 'Lista Colaborativa' }}
                />
            </Stack.Protected>

            {/* Rotas Públicas (Visitantes e Login) */}
            <Stack.Protected guard={!acesso.usuario}>
                <Stack.Screen
                    name="entrar"
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="cadastro"
                    options={{ title: 'Criar Conta' }}
                />
            </Stack.Protected>
        </Stack>
    );
}

export default function Navegacao() {
    return (
        <AcessoProvider>
            <StatusBar style="light" />
            <Telas />
        </AcessoProvider>
    );
}
