// Card que exibe o resumo de uma lista colaborativa (Mashup) do CineLog mobile.
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { cores, estilos } from '../theme/tema';

export default function CardLista({ item }) {
    const lista = item.lista;
    if (!lista) return null;

    return (
        <Pressable
            onPress={function toque() {
                router.push('/listas/' + lista.id);
            }}
            style={({ pressed }) => [
                estilos.cartao,
                pressed && estilos.pressionado,
            ]}
        >
            <View style={estilos.linha}>
                <View style={estilos.expandir}>
                    <Text style={estilos.subtitulo}>{lista.nome}</Text>
                    {lista.descricao ? (
                        <Text
                            style={estilos.descricao}
                            numberOfLines={2}
                        >
                            {lista.descricao}
                        </Text>
                    ) : null}
                </View>
                <View style={estilos.badge}>
                    <Text style={estilos.badgeTexto}>
                        {item.papel === 'dono' ? 'Criador' : 'Membro'}
                    </Text>
                </View>
            </View>

            <View style={[estilos.linha, estilosLocais.rodape]}>
                <Text style={estilos.descricao}>
                    👥 {item.membros} {item.membros === 1 ? 'membro' : 'membros'}
                </Text>
                <Text style={estilos.descricao}>
                    🎬 {item.aprovados} {item.aprovados === 1 ? 'aprovado' : 'aprovados'}
                </Text>
                {item.pendentes > 0 ? (
                    <Text style={[estilos.descricao, { color: cores.destaque }]}>
                        ⏳ {item.pendentes} para votar
                    </Text>
                ) : null}
            </View>
        </Pressable>
    );
}

const estilosLocais = StyleSheet.create({
    rodape: {
        borderTopColor: cores.borda,
        borderTopWidth: 1,
        paddingTop: 10,
        justifyContent: 'space-between',
    },
});
