// Padronizo os botões de ação do CineLog, incluindo aparência, toque e estado desabilitado.
import { Pressable, Text } from 'react-native';
import { estilos } from '../theme/tema';

export default function Botao({ titulo, aoPressionar, desabilitado = false, secundario = false, perigo = false }) {
    const estiloBotao = [];
    const estiloTexto = [];

    estiloBotao.push(estilos.botao);
    estiloTexto.push(estilos.botaoTexto);

    if (secundario) {
        estiloBotao.push(estilos.botaoSecundario);
        estiloTexto.push(estilos.textoSecundario);
    }

    if (perigo) {
        estiloBotao.push({ backgroundColor: '#9E2A2B' });
        estiloTexto.push({ color: '#FFFFFF' });
    }

    if (desabilitado) {
        estiloBotao.push(estilos.desabilitado);
    }

    function apresentarEstilo({ pressed }) {
        if (pressed) {
            return estiloBotao.concat(estilos.pressionado);
        }
        return estiloBotao;
    }

    return (
        <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: desabilitado }}
            disabled={desabilitado}
            onPress={aoPressionar}
            style={apresentarEstilo}
        >
            <Text style={estiloTexto}>{titulo}</Text>
        </Pressable>
    );
}
