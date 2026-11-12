# Comparador de contas bancárias (LiteraciaFinanceira.pt)

Lista de contas com filtros, com o aspeto do comparador de depósitos, e comparação lado a lado, com o aspeto do comparador de corretoras. Tem contas para particulares e para empresas.

Os ficheiros são servidos pelo jsDelivr a partir do branch `comparador-contas-bancarias` deste repositório:
`https://cdn.jsdelivr.net/gh/pedrofintech/lf-site-assets@comparador-contas-bancarias/comparador-contas/`

Desde 12 de novembro de 2026 a página já não está presa a um commit: um merge neste branch chega ao site sem mexer no Webflow.

## Ficheiros

- `dados/contas.json`: tudo o que aparece no comparador. É o único ficheiro a editar quando muda um preço, um link ou a ordem.
- `dados/fontes.json`: a fonte oficial de cada valor, por conta e por campo. Não é carregado pela página.
- `verificacao/`: notas de cada verificação. A de 14 de outubro de 2026 (`2026-10-14.md`) é a mais recente: foi feita de raiz e passou o custo para valores por mês.
- `logos/`: logótipos dos bancos, todos em SVG (os que só havia em PNG estão embutidos num SVG). Se um logótipo não carregar, aparecem as iniciais (campo `ini`).
- `comparador-contas.js` e `comparador-contas.css`: lógica e estilos (namespace `#lf-cb`, tokens iguais aos do comparador de corretoras).
- `webflow-custom-code.html`: código a colar na página do Webflow.

## Campos de `dados/contas.json`

No topo:

- `verificado`: data mostrada em "Última verificação" e nas notas.
- `comparar`: contas sugeridas para a vista "Lado a lado" quando o leitor ainda não escolheu nenhuma, por tipo de conta.
- `pares`: artigos "X vs Y". A chave são os dois IDs por ordem alfabética, separados por `|`. Aparecem por baixo da tabela quando as duas contas estão a ser comparadas.

Em cada conta:

- `id`, `seg` (`particular` ou `empresa`), `ordem` (posição em "Recomendados").
- `name`, `produto`, `tipoTxt`, `entidade`.
- `tipo`: `digital` ou `balcoes`. É o que usa o filtro "100% digital". ActivoBank, Best e BiG estão em `digital` porque é assim que os artigos do site os classificam.
- `logo` (ficheiro em `logos/`), `logoPad` (`true` para margem normal dentro do quadrado, `"sm"` para margem pequena, usada nos logótipos horizontais como o do Novo Banco), `logoBg` (cor de fundo do quadrado quando o logótipo é claro, como o da Moey) e `ini` (iniciais de reserva).
- `cta`: botão "Ir para o/a X", como nos outros comparadores. `label` é o texto, `href` o link, `aff` o nome do parceiro (põe `rel="sponsored"` e `data-afiliado` para o `afiliados-tracking.js`) e `nota` a frase pequena por baixo do botão.
- `bonus` e `tags`: etiquetas por baixo do nome, sempre com ícone. O bónus fica verde, com o ícone de presente. Em `tags`, `t` é o texto (até 28 carateres, para caber numa linha), `w: 1` um aviso (amarelo) e `w: 0` uma vantagem (verde), `i` o ícone (`cal` campanhas de meses grátis, `cash` levantamentos, `shx` sem garantia de depósitos, `usr` quem pode abrir, `bld` empresas, `card` cartão; sem `i` usa um aviso ou um visto), `s` a explicação que aparece ao passar o rato e `ate` (AAAA-MM-DD) o último dia da campanha: a partir do dia seguinte a etiqueta deixa de aparecer.
- `promo`: meses sem custos de uma campanha (`m`) e, se houver, o último dia para aderir (`ate`). Com 6 meses ou mais, a conta entra nos filtros "Sem custos fixos" e "Sem mensalidade". O custo por mês continua a ser o valor normal.
- `premio`: campanha para quem domicilia o ordenado (as do artigo "Melhores campanhas para domiciliar o ordenado", confirmadas no site do banco). `t` é o prémio em poucas palavras, `s` as condições, `url` a página da campanha e `ate` o último dia (sem `ate`, é uma oferta sem fim anunciado). Dá a etiqueta "Prémio por domiciliar", que abre o artigo, e a linha "Prémio por domiciliar o ordenado" nos detalhes.
- `perfis`: o que muda no seletor "Para quem" das contas pessoais. `jovem` e `menor` trocam a conta pela do perfil: `produto`, `idade` (aparece numa etiqueta e no destaque "Idades"), `custoMes`, `custoMesCond`, `custoNota`, `cartao` (destaque do cartão), `ab` (destaque da abertura), `promo`, `tags`, `nota` (explicação na linha do perfil), `src` (fonte), `conf: true` para "A confirmar" e `premio: true` se a campanha de ordenado também vale para essa conta. `conjunta` não troca a conta: `v` (quantos titulares), `s` (como se abre), `cartao2` (custo do cartão dos outros titulares), `nota` e `src`. Sem `jovem`, o perfil jovem mostra a conta normal; sem `menor` ou `conjunta`, a conta sai da lista nesse perfil.
- `ab`: destaque "Abertura" das contas pessoais. `v` é o mínimo para abrir ("Sem mínimo", "Mín. 250€") e `s` o canal ("Online", "Online ou balcão").
- `review`: link para a análise completa no site.
- `src`: preçário ou página oficial (link "Ver preçário").
- `f`: valores usados nos filtros, na ordenação e nos destaques. `custoMes` é o custo por mês (comissão de manutenção mais a anuidade do cartão de débito a dividir por 12), `custoMesCond` o mesmo com as condições do banco (ordenado, TPA, etc.) e `custoAno` o total de um ano, que aparece nos detalhes. Os custos já incluem o Imposto do Selo quando se aplica. Os outros campos (`jurosMax`, `iban`, `mbway`, etc.) servem os filtros.
- `custoNota`: frase curta por baixo do custo quando não há preço com condições (por exemplo, uma isenção para novas empresas ou um custo de ativação).
- `t`: textos de cada linha da comparação. `v` é o valor curto e `s` a explicação.
- `c`: chaves de `t` que não foi possível confirmar numa fonte oficial. Mostram a etiqueta "A confirmar".

## Como publicar uma alteração

1. Abre um PR para o branch `comparador-contas-bancarias` e faz merge.
2. O jsDelivr guarda os ficheiros de um branch em cache até 12 horas. Para a alteração aparecer logo, abre estes links depois do merge:
   - `https://purge.jsdelivr.net/gh/pedrofintech/lf-site-assets@comparador-contas-bancarias/comparador-contas/dados/contas.json`
   - `https://purge.jsdelivr.net/gh/pedrofintech/lf-site-assets@comparador-contas-bancarias/comparador-contas/comparador-contas.js`
   - `https://purge.jsdelivr.net/gh/pedrofintech/lf-site-assets@comparador-contas-bancarias/comparador-contas/comparador-contas.css`
3. Não é preciso publicar o Webflow.

## Verificação quinzenal

Uma tarefa agendada do Claude verifica todas as contas nos dias 1 e 15 de cada mês, nas fontes oficiais de `dados/fontes.json`, e abre um PR com as correções para o Franklin fazer merge. Não altera os dados sem merge, não acrescenta nem remove bancos e deixa a nota da verificação em `verificacao/`.

O seletor "Para quem" também funciona por link: `?perfil=jovem`, `?perfil=menor`, `?perfil=conjunta`, ou `?conta=empresa&perfil=eni` e `?conta=empresa&perfil=sociedade`. Serve para ligar de artigos (por exemplo, um artigo sobre contas para jovens).

## Regras dos dados

- Só fontes primárias: preçário do banco, documento de informação sobre comissões, ficha de informação normalizada, termos oficiais ou o Portal do Cliente Bancário. Nunca bankeronwheels.com, blogs ou outros comparadores.
- Os custos incluem o Imposto do Selo de 4% nas comissões cobradas em Portugal.
- Textos sem travessão, com valores no formato "4,99€" e "2,25% TANB".
