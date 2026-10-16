// Guardo a credencial de acesso no espaço protegido do celular, sem salvar a senha.
import * as SecureStore from 'expo-secure-store';

const chave = 'cinelog.sessao';

// Leio a credencial no armazenamento protegido do sistema para recuperar o acesso do aparelho.
export function obterToken() {
    return SecureStore.getItemAsync(chave);
}

// Salvo a credencial no SecureStore para recuperar a sessão sem guardar a senha digitada.
export function guardarToken(token) {
    return SecureStore.setItemAsync(chave, token, {
        keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
}

// Retiro a credencial do celular ao deslogar.
export function apagarToken() {
    return SecureStore.deleteItemAsync(chave);
}
