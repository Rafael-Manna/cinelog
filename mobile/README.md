# CineLog Mobile 🎬📱

Aplicativo móvel do **CineLog**, construído com **Expo**, **React Native** e **Expo Router**, seguindo rigorosamente a arquitetura, convenções e bibliotecas do projeto **Academia App**.

---

## 🚀 Tecnologias e Bibliotecas

- **Framework:** Expo SDK 57 (~57.0.29) & React Native 0.86.3
- **Navegação:** Expo Router (~57.0.27) com estrutura baseada em arquivos (`src/app/`), rotas protegidas (`Stack.Protected`) e abas inferiores (`expo-router/js-tabs`)
- **Segurança e Sessão:** `expo-secure-store` e `@react-native-async-storage/async-storage` para armazenamento protegido de JWT
- **Design System e Tema:** Tema cinematográfico escuro em `src/theme/tema.js` com paleta de cores, botões, campos, cartões e tipografia padronizados
- **API Externa:** Integração com OMDb API para autocomplete de filmes e séries com pôster

---

## 📂 Arquitetura de Pastas

```
mobile/
├── src/
│   ├── app/                      # Rotas e layouts do Expo Router
│   │   ├── (menu)/               # Abas do rodapé (Feed, Listas, Perfil)
│   │   ├── posts/                # Rotas de detalhe e criação de avaliação
│   │   ├── listas/               # Rotas de detalhe e criação de lista colaborativa
│   │   ├── entrar.jsx            # Tela de login público
│   │   ├── cadastro.jsx          # Tela de cadastro público
│   │   └── _layout.jsx           # Navegador raiz (Stack) com proteção de rotas
│   ├── components/               # Componentes visuais reutilizáveis
│   │   ├── Aviso.jsx
│   │   ├── Botao.jsx
│   │   ├── BotaoLink.jsx
│   │   ├── BuscaOmdbModal.jsx    # Modal de busca no OMDb com pôster
│   │   ├── Campo.jsx
│   │   ├── CardLista.jsx         # Card de lista Mashup com estatísticas
│   │   ├── CardPost.jsx          # Card de post individual ou análise conjunta
│   │   └── Estrelas.jsx          # Avaliação visual e interativa (0-10)
│   ├── contexts/
│   │   └── AcessoContext.jsx     # Gerenciamento global de sessão e login
│   ├── screens/                  # Telas com regras de apresentação e dados
│   │   ├── Cadastro.jsx
│   │   ├── DetalheLista.jsx      # Gestão da lista, membros, votação e fila
│   │   ├── DetalhePost.jsx       # Crítica completa e comentários
│   │   ├── Entrar.jsx
│   │   ├── Feed.jsx              # Feed com filtro de categorias
│   │   ├── Listas.jsx            # Minhas listas em conjunto
│   │   ├── NovaLista.jsx
│   │   ├── NovaPostagem.jsx      # Avaliação simples ou em conjunto
│   │   └── Perfil.jsx            # Edição de perfil e bio
│   ├── services/                 # Comunicação com a API REST
│   │   ├── acesso-servico.js
│   │   ├── api.js                # Cliente HTTP centralizado com fetch e timeout
│   │   ├── busca-servico.js
│   │   ├── comentario-servico.js
│   │   ├── lista-servico.js
│   │   ├── post-servico.js
│   │   └── token-servico.js      # Manipulação segura do SecureStore
│   └── theme/
│       └── tema.js               # Design tokens e folhas de estilo
├── app.json                      # Configuração do Expo
├── package.json                  # Dependências sincronizadas com o Academia App
└── jsconfig.json
```

---

## 🛠️ Como Executar

### 1. Iniciar a API do CineLog
No terminal da raiz do projeto (`cinelog`):
```bash
npm run dev
```
A API ficará disponível em `http://localhost:3000/api`.

### 2. Configurar a URL da API no Mobile
Na pasta `mobile`, crie o arquivo `.env` (ou copie de `.env.example`):
```bash
# Se estiver testando no emulador Android do PC:
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000/api

# Se estiver testando no celular físico via Expo Go (mesmo Wi-Fi):
# Substitua pelo IP da sua máquina local (ex: 192.168.1.15):
EXPO_PUBLIC_API_URL=http://SEU_IP_LOCAL:3000/api
```

### 3. Instalar Dependências e Iniciar o App
No terminal dentro da pasta `mobile`:
```bash
cd mobile
npm install
npx expo start
```
- Pressione `a` para abrir no emulador Android
- Ou escaneie o QR Code no app **Expo Go** no seu celular
