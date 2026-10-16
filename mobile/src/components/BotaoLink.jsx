// Botão de navegação que aponta para outra rota do aplicativo.
import { Link } from 'expo-router';
import { Pressable, Text } from 'react-native';
import { estilos } from '../theme/tema';

export default function BotaoLink({ titulo, destino }) {
    function apresentarEstilo({ pressed }) {
        if (pressed) {
            return [estilos.botao, estilos.botaoSecundario, estilos.pressionado];
        }
        return [estilos.botao, estilos.botaoSecundario];
    }

    return (
        <Link
            asChild
            href={destino}
        >
            <Pressable
                accessibilityRole="link"
                style={apresentarEstilo}
            >
                <Text style={[estilos.botaoTexto, estilos.textoSecundario]}>{titulo}</Text>
            </Pressable>
        </Link>
    );
}
