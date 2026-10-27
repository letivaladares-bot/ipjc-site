# Como publicar o site da IPJC (Locaweb)

Site **estático**: só HTML, CSS, JavaScript e imagens. Não usa PHP, banco de dados,
Node, build nem instalação de dependências.

## Publicação
1. Faça backup do site atual (se for substituí-lo).
2. Envie **todo o conteúdo desta pasta** (não a pasta em si) para a raiz pública do domínio
   na Locaweb (normalmente `public_html/`), por FTP/SFTP ou pelo Gerenciador de Arquivos.
   Inclua os arquivos ocultos: `.htaccess`.
3. Confirme que o SSL (https) está ativo para `www.ipjc.org.br` no painel da Locaweb.
   O `.htaccess` redireciona tudo para `https://www.ipjc.org.br`.
4. Abra o site e teste: menu, páginas, mapa, vídeo, `contato.html`, `admin.html`.

## Depois de publicar (uma vez)
- **Formulários de contato:** usam o FormSubmit (formsubmit.co). Envie um formulário de teste
  pela página Contato; chegará um e-mail de ativação em **ipjc@hotmail.com**. Clique em
  "Activate Form". Só depois disso as mensagens passam a chegar.
- **Senha do painel** (`admin.html`): a senha inicial é provisória. Gere outra em
  Publicar → Trocar senha e substitua `js/admin-config.js` no servidor.

## Atualizações do dia a dia (feitas pela igreja)
Programações, boletins e blog são editados no painel `admin.html`. Para publicar:
painel → **Publicar** → "Baixar conteudo.js" → substituir **apenas** `js/conteudo.js` no servidor.

Outros dados fixos (contatos, ministérios, congregações, textos) ficam em `js/dados.js`.

## Observações
- Se o domínio final não for `www.ipjc.org.br`, ajuste: `.htaccess`, `robots.txt`,
  `sitemap.xml` e as tags `og:image` dos arquivos `.html`.
- O site não depende de nenhum serviço da Locaweb além da hospedagem de arquivos.
- Estrutura e detalhes: ver `README.md`.
