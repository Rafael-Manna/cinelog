// Componente para exibição e seleção de avaliação em estrelas (escala de 0 a 10, exibindo até 5 estrelas).
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { cores } from '../theme/tema';

export default function Estrelas({ nota = 0, aoMudar = null, tamanho = 18 }) {
    // Escala de 0 a 10: cada estrela equivale a 2 pontos
    const estrelasCheias = Math.floor(nota / 2);
    const temMeiaEstrela = (nota % 2) !== 0;

    const listaEstrelas = [1, 2, 3, 4, 5];

    function calcularSimbolo(indice) {
        if (indice <= estrelasCheias) {
            return '★';
        }
        if (indice === estrelasCheias + 1 && temMeiaEstrela) {
            return '⯨'; // Meia estrela
        }
        return '☆';
    }

    function selecionarEstrela(indice) {
        if (!aoMudar) return;
        // Se tocar na mesma estrela que já está cheia, altera para meia estrela
        const pontuacaoEstrelaCheia = indice * 2;
        if (nota === pontuacaoEstrelaCheia) {
            aoMudar(pontuacaoEstrelaCheia - 1);
        } else {
            aoMudar(pontuacaoEstrelaCheia);
        }
    }

    return (
        <View style={estilosLocais.container}>
            {listaEstrelas.map(function renderizar(indice) {
                const simbolo = calcularSimbolo(indice);
                const ativa = indice <= estrelasCheias || (indice === estrelasCheias + 1 && temMeiaEstrela);

                if (aoMudar) {
                    return (
                        <Pressable
                            key={indice}
                            onPress={function toque() {
                                selecionarEstrela(indice);
                            }}
                            hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                        >
                            <Text style={[
                                estilosLocais.estrela,
                                { fontSize: tamanho },
                                ativa ? estilosLocais.ativa : estilosLocais.inativa
                            ]}>
                                {simbolo}
                            </Text>
                        </Pressable>
                    );
                }

                return (
                    <Text
                        key={indice}
                        style={[
                            estilosLocais.estrela,
                            { fontSize: tamanho },
                            ativa ? estilosLocais.ativa : estilosLocais.inativa
                        ]}
                    >
                        {simbolo}
                    </Text>
                );
            })}
            <Text style={[estilosLocais.notaTexto, { fontSize: tamanho - 4 }]}>
                {(nota / 2).toFixed(nota % 2 !== 0 ? 1 : 0)}/5
            </Text>
        </View>
    );
}

const estilosLocais = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    estrela: {
        color: cores.destaque,
    },
    ativa: {
        color: cores.destaque,
    },
    inativa: {
        color: cores.neutro,
    },
    notaTexto: {
        color: cores.secundario,
        fontWeight: '600',
        marginLeft: 4,
    },
});
