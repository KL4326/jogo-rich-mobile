# 💰 Magnata — Do zero ao bilhão

Jogo de celular de estratégia financeira para jogar em família, competindo para ver quem fica mais rico.
Nada de ficar tocando na tela: o dinheiro vem das suas **decisões**.

## Como instalar no celular (Android)
1. Abra a página **Releases** deste repositório no celular.
2. Baixe o arquivo `Magnata.apk` da versão mais recente.
3. Toque no arquivo e permita "instalar apps de fontes desconhecidas" quando o Android pedir.

O app abre o jogo hospedado em https://kl4326.github.io/jogo-rich-mobile/ — toda mudança no jogo chega sozinha, sem reinstalar. Também dá para jogar direto nesse link pelo navegador (inclusive iPhone).
Um APK novo só é necessário quando a parte Android muda (raro).

## O que tem no jogo
- **Carreira**: cursos (levam tempo real) liberam empregos melhores.
- **Empresas**: 12 negócios, do pastel à empresa espacial. Lucro dobra em 10/25/50/100… níveis.
- **Investimentos**: Bolsa (16 ações fictícias), Cripto, Renda Fixa (Poupança/CDB/Tesouro), Imóveis para aluguel e Crédito.
- **Mercado compartilhado**: os preços e as notícias são calculados a partir do relógio, então **todos os jogadores veem o mesmo mercado**. A cada hora cada setor entra num ciclo de alta, queda ou estabilidade; previsões (70% de acerto) e confirmações aparecem nas notícias.
- **Bens**: veículos (bônus no salário), moradia (sem aluguel + horas offline), luxo (prestígio).
- **Cartões**: Estudante → Prata → Ouro → Platinum → Black → Infinite → Diamante → Esmeralda → Obsidiana → Titânio → Magnata.
- **Níveis e conquistas**: 32 conquistas; cada nível dá +3% de renda e libera novas áreas.
- **Ranking da família**: cada um copia seu código e cola o dos outros (pelo WhatsApp).

⏱️ 1 dia no jogo = 1 minuto real. Com o app fechado a renda continua por algumas horas.

## Desenvolvimento
O jogo é HTML/CSS/JavaScript puro em `www/`, empacotado para Android com Capacitor.

```bash
npm install
npm run serve        # abre em http://localhost:8123 para testar no navegador
npx cap sync android # copia o jogo para o projeto Android
```
