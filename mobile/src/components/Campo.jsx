// Reúno rótulo e entrada de texto para manter os formulários consistentes no CineLog.
import { Text, TextInput, View } from 'react-native';
import { cores, estilos } from '../theme/tema';

export default function Campo(propriedades) {
    const estiloCampo = [];
    estiloCampo.push(estilos.campo);
    if (propriedades.multiline) {
        estiloCampo.push(estilos.campoMultilinha);
    }

    return (
        <View style={estilos.grupo}>
            {propriedades.rotulo && (
                <Text style={estilos.texto}>{propriedades.rotulo}</Text>
            )}
            <TextInput
                style={estiloCampo}
                placeholderTextColor={cores.secundario}
                selectionColor={cores.destaque}
                accessibilityLabel={propriedades.rotulo || propriedades.placeholder}
                value={propriedades.value}
                onChangeText={propriedades.onChangeText}
                editable={propriedades.editable}
                maxLength={propriedades.maxLength}
                placeholder={propriedades.placeholder}
                keyboardType={propriedades.keyboardType}
                autoCapitalize={propriedades.autoCapitalize}
                autoCorrect={propriedades.autoCorrect}
                onSubmitEditing={propriedades.onSubmitEditing}
                returnKeyType={propriedades.returnKeyType}
                secureTextEntry={propriedades.secureTextEntry}
                multiline={propriedades.multiline}
                numberOfLines={propriedades.numberOfLines}
            />
        </View>
    );
}
