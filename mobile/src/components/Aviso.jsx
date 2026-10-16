// Apresento mensagens de espera ou erro e ofereço nova tentativa quando necessário.
import { ActivityIndicator, Text, View } from 'react-native';
import { cores, estilos } from '../theme/tema';
import Botao from './Botao';

export default function Aviso({ mensagem, carregando = false, erro = false, aoTentar = null }) {
    if (!mensagem && !carregando) {
        return null;
    }

    const estiloTexto = [];
    estiloTexto.push(estilos.descricao);
    if (erro) {
        estiloTexto.push(estilos.erro);
    }

    return (
        <View
            style={estilos.cartao}
            accessibilityLiveRegion="polite"
        >
            {carregando && <ActivityIndicator color={cores.destaque} />}
            {mensagem ? <Text style={estiloTexto}>{mensagem}</Text> : null}
            {aoTentar && (
                <Botao
                    titulo="Tentar novamente"
                    aoPressionar={aoTentar}
                    secundario
                />
            )}
        </View>
    );
}
