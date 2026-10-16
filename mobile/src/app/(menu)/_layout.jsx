// Menu inferior com abas de Feed, Listas e Perfil do CineLog.
import { Tabs } from 'expo-router/js-tabs';
import { cores } from '../../theme/tema';

export default function MenuInferior() {
    return (
        <Tabs screenOptions={{
            headerStyle: {
                backgroundColor: cores.superficie,
            },
            headerTintColor: cores.texto,
            headerShadowVisible: false,
            tabBarActiveTintColor: cores.destaque,
            tabBarInactiveTintColor: cores.secundario,
            tabBarIconStyle: {
                display: 'none',
            },
            tabBarLabelStyle: {
                fontSize: 14,
                fontWeight: '600',
            },
            tabBarItemStyle: {
                paddingVertical: 12,
            },
            tabBarStyle: {
                backgroundColor: cores.superficie,
                borderTopColor: cores.borda,
                minHeight: 56,
            },
            sceneStyle: {
                backgroundColor: cores.fundo,
            },
        }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Feed',
                    headerTitle: 'CineLog',
                }}
            />
            <Tabs.Screen
                name="listas"
                options={{
                    title: 'Listas',
                    headerTitle: 'Listas em Conjunto',
                }}
            />
            <Tabs.Screen
                name="perfil"
                options={{
                    title: 'Perfil',
                    headerTitle: 'Meu Perfil',
                }}
            />
        </Tabs>
    );
}
