# Site IPJC v3

Site estático (HTML/CSS/JS puro) da Igreja Presbiteriana em Jardim Camburi.

## Estrutura

```
ipjc-site/
├── index.html              Home
├── quem-somos.html         História, identidade visual, missão/visão/valores
├── no-que-cremos.html      Cinco Solas, doutrinas, Símbolos de Westminster
├── ministerios.html        Grade de ministérios com filtro (ministerios.html#adoracao etc.)
├── ministerio.html         Página individual: ministerio.html?m=<slug>
├── programacoes.html       Programação fixa, calendário e programações especiais
├── evento.html             Página de cada programação: evento.html?e=<id> (com mapa)
├── boletins.html           Boletim do mês + arquivo por ano (#2026)
├── blog.html               Texto em destaque, filtro por tema, busca e "carregar mais"
├── post.html               Página de cada texto: post.html?p=<id>
├── congregacoes.html       Cards das congregações (com foto)
├── congregacao.html        Página de cada congregação: congregacao.html?c=<slug>
├── social.html             ONG Jardins Cultivando Vidas: apresentação, vídeo e como ajudar
├── contato.html            Formulários em abas (#fale-conosco, #oracao, #visitante) + canais e mapa
├── privacidade.html        Política de Privacidade (LGPD)
├── membro.html             "Quero ser membro": passos (catecúmenos) + formulário FielWeb (membresia.url)
├── contribua.html          Dízimos e ofertas: Pix (chave, copia e cola, QR) e dados bancários
├── pequenos-grupos.html    Pequenos Grupos de Discipulado (contato via secretaria, sem dados pessoais)
├── plano-leitura.html      Plano de leitura bíblica em 1 ano + assets/docs/plano-leitura-biblica-ipjc.pdf
├── admin.html              Painel de administração (fora do menu; noindex)
├── 404.html                Página "não encontrada" (configure na hospedagem)
├── robots.txt / sitemap.xml  Para o Google (domínio www.ipjc.org.br)
├── (demais páginas .html na raiz — próximas etapas)
├── css/style.css           Tokens da marca, header, rodapé, componentes e seções
├── css/quem-somos.css      Estilos exclusivos do Quem Somos
├── js/quem-somos.js        Linha do tempo, símbolo interativo, valores
├── css/no-que-cremos.css   Estilos exclusivos do No que Cremos
├── js/no-que-cremos.js     Cards dos Solas, contagem e catecismo
├── css/ministerios.css     Lista e página individual de ministério
├── js/ministerios.js       Filtro da lista e montagem da página individual
├── css/programacoes.css    Calendário e cards de programações
├── js/programacoes.js      Calendário, filtros, destaque por #id e arquivo .ics
├── css/evento.css / js/evento.js     Página da programação
├── css/boletins.css / js/boletins.js Boletins mensais e capas automáticas
├── css/blog.css / js/blog.js         Lista e página de cada texto
├── css/congregacoes.css / js/congregacoes.js  Lista e página de cada congregação
├── css/social.css / js/social.js             Página da ONG
├── css/contato.css / js/contato.js           Abas, validação e envio dos formulários
├── css/privacidade.css                       Política de Privacidade
├── css/admin.css / js/admin.js               Painel de administração
├── js/dados.js             Objeto global IPJC — dados fixos da igreja
├── js/conteudo.js          Programações, boletins e blog PUBLICADOS (gerado pelo admin)
├── js/admin-config.js      Usuário e resumo SHA-256 da senha do painel
├── js/site.js              Renderiza header/rodapé e o conteúdo de cada página
└── assets/img/
    ├── logo/               Assinatura oficial (vetor do PDF) em todas as versões do manual
    ├── ministerios/        <slug>.png (colorida) e <slug>-mono.png (azul, para os cards)
    ├── congregacoes/  social/  quem-somos/
    └── eventos/  boletins/  blog/
```

## Como funciona

- Cada página tem `<body data-page="...">`, `<div id="site-header">` e `<div id="site-footer">`.
- `site.js` monta o header/rodapé e chama o renderizador da página (`IPJCSite.registrarPagina`).
- Textos simples podem ser ligados aos dados com `data-ipjc="contato.telefone"` e links com `data-ipjc-href="redes.spotify"`.
- O admin salva `programacoes`, `boletins` e `blog` no localStorage (`ipjc-v3-dados`), que sobrescrevem os padrões do `dados.js`.
- Programações com data passada somem automaticamente.

## Ministérios

Cada ministério em `js/dados.js` aceita: `nome`, `sigla`, `categoria`, `resumo`, `descricao`
(parágrafos separados por linha em branco), `quando`, `publico`, `local`, `logo` (monocromática, cards), `logoCor` (página) e `subcards`.
Programações com `ministerio: '<slug>'` aparecem na página do ministério.

## Programações

- Links `programacoes.html#<id-do-evento>` abrem a página já no evento, com destaque.
- O calendário marca as programações especiais (por categoria) e a programação fixa
  (domingos: cultos e EBD; quartas: ensaio do coral).
- "Adicionar à agenda" gera um arquivo .ics (Google Agenda, iPhone, Outlook).
- Todo contato por WhatsApp vai para o número oficial da igreja (`contato.whatsapp`).

## Programações

Cada programação tem página própria (`evento.html?e=<id>`) com arte, data, horário, local,
mapa (Google Maps embutido + botões Google Maps/Waze), inscrição, WhatsApp, "Adicionar à agenda"
e "Compartilhar". Campo `endereco` (opcional) alimenta o mapa; em branco, usa o endereço da igreja
quando o local é o templo.

## Boletins (mensais)

Campos: `id`, `mes` ('AAAA-MM'), `titulo` (opcional), `resumo` (opcional), `arquivo` e `capa` (opcional).
A capa é a 1ª página do documento, automaticamente:
1. `capa` preenchida → usa a imagem (ex.: 1ª página exportada do Canva em PNG);
2. `arquivo` do Google Drive → miniatura da 1ª página gerada pelo Drive (arquivo compartilhado
   como "qualquer pessoa com o link");
3. `arquivo` em `assets/boletins/*.pdf` → 1ª página desenhada com PDF.js;
4. nada disso → capa gerada na identidade da igreja.

## Blog

Campos: `id` (vira o endereço `post.html?p=<id>`), `titulo`, `subtitulo`, `autor`, `data`, `tag`,
`resumo`, `imagem` (opcional) e `texto`. A categoria (`tag`) é escolhida da lista `blogCategorias` em `js/dados.js`. O texto aceita: parágrafos separados por linha em branco,
`## subtítulo`, `> citação`, `**negrito**`, `*itálico*` e `[link](https://...)`.
Sem imagem, o post ganha uma capa tipográfica na cor do tema.

## Congregações

Campos em `js/dados.js`: `nome`, `cidade`, `resumo`, `historia`, `endereco` (mapa), `pastor`,
`telefone` (vira link de ligação), `instagram`, `logo`, `foto` e `programas`
(`[{ tipo: 'Culto', descricao: 'Domingos, 18h' }]`, com o tipo em negrito).
**Fotos:** salve em `assets/img/congregacoes/` (horizontal, 1600×1000 px) e preencha `foto`.
Enquanto não houver foto, aparece um espaço reservado com a logo.

## Formulários (Contato)

Enviados por e-mail pelo **FormSubmit** (formsubmit.co), sem cadastro:
- Fale conosco e Visitante → `contato.email`; Pedido de oração → `contato.emailOracao`.
- **Ativação:** no primeiro envio, o FormSubmit manda um e-mail de ativação para cada endereço.
  Abra e clique em "Activate Form" uma única vez; só depois disso as mensagens passam a chegar.
- Se o envio falhar, o formulário oferece o WhatsApp oficial.
- Proteção contra robôs: campo invisível (honeypot). Consentimento LGPD obrigatório.

## Painel de administração (`admin.html`)

- **Acesso:** usuário `admin`, senha inicial `diaaposdia2027` — **troque antes de publicar**
  (Publicar → Trocar senha → substitua `js/admin-config.js`).
- **Programações, Boletins e Blog:** criar, editar (o formulário vem preenchido e o botão vira
  "Atualizar") e excluir. A categoria lista cada ministério/sociedade agrupado por categoria.
- As alterações ficam salvas **no navegador de quem edita** e já aparecem no site nesse navegador.
- **Para publicar para todos:** Publicar → "Baixar conteudo.js" → substitua `js/conteudo.js` na hospedagem.
- **Backup:** exportar/importar .json. "Descartar alterações" volta ao conteúdo publicado.
- Imagens: prefira salvar em `assets/img/...` e colar o caminho; o envio direto funciona, mas
  ocupa o armazenamento do navegador (~5 MB) e aumenta o `conteudo.js`.
- O login é uma proteção simples (site estático): a segurança real é que só quem tem acesso
  à hospedagem consegue publicar.

## Publicação

- Domínio usado nas imagens de compartilhamento e no sitemap: `https://www.ipjc.org.br/`.
  Se mudar, troque em todos os `og:image`, `robots.txt` e `sitemap.xml`.
- Imagem de compartilhamento (WhatsApp/redes): `assets/img/og-ipjc.jpg` (1200×630).

## Ministérios: história e lema

Campos opcionais `historia` ("Um pouco de história") e `lema` ({ texto, ref }) — usados em UMP, UPA, UCP, Mulheres (SAF) e Homens (UPH).

## Pendências

- **Foto da cruz do templo** (Quem Somos → "A cruz vazia"): trocar `assets/img/quem-somos/templo-cruz-detalhe.jpg` por uma foto mais recente (mesmo nome de arquivo, proporção ~8:7)
- Fotos da Congregação Presbiteriana em Santa Maria de Jetibá (`congregacoes[].foto` e `galeria`)
- Novos marcos da linha do tempo (2016 em diante)
- ONG: texto oficial de apresentação (`social.sobre`), Instagram e e-mail (`social.instagram`, `social.email`)
- EBD: atualizar `classes` e `curriculo` em `js/dados.js` a cada ano
- (Confirmado) E-mail oficial: ipjc@hotmail.com · sem telefone fixo — o rodapé mostra só o WhatsApp

## Cores

- Logo: cromias do **manual original** — Azul #00ADEF, Verde #73BD2A, Cinza #6C6D70 e Verde escuro #00632E (sarça da IPB). Tokens `--logo-*`, usados só na marca.
- Site: **Paleta de Comunicações** do manual novo (Noite, Azul Petróleo, Verde Litúrgico, Borgonha, Mostarda, Creme…).

## Logos (`assets/img/logo/`)

| Arquivo | Uso |
|---|---|
| `ipjc-logo.svg/.png` | Colorida — fundos claros (header, hero) |
| `ipjc-bege.png`, `ipjc-logo-bege.svg` | Rodapé (fundo Noite) |
| `ipjc-logo-branca.svg/.png` | Fotos e fundos escuros |
| `ipjc-logo-azul/verde/verde-escuro/cinza/preta.svg` | Monocromáticas |
| `ipjc-simbolo.svg` | Só favicon (o manual pede não separar símbolo e nome) |

## Rodar localmente

```
python3 -m http.server 8000
```
e abrir http://localhost:8000
