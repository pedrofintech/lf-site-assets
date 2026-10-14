# Comparador de contas bancárias (LiteraciaFinanceira.pt)

Lista de contas com filtros, com o aspeto do comparador de depósitos, e comparação lado a lado, com o aspeto do comparador de corretoras. Tem contas para particulares e para empresas.

Os ficheiros são servidos pelo jsDelivr a partir de um commit fixo deste repositório:
`https://cdn.jsdelivr.net/gh/pedrofintech/lf-site-assets@<commit>/comparador-contas/`

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
- `tipo`: `digital` ou `balcoes`. É o que usa o filtro "Tipo de banco". ActivoBank, Best e BiG estão em `digital` porque é assim que os artigos do site os classificam.
- `logo` (ficheiro em `logos/`), `logoPad` (`true` para margem normal dentro do quadrado, `"sm"` para margem pequena, usada nos logótipos horizontais como o do Novo Banco), `logoBg` (cor de fundo do quadrado quando o logótipo é claro, como o da Moey) e `ini` (iniciais de reserva).
- `cta`: botão "Ir para o/a X", como nos outros comparadores. `label` é o texto, `href` o link, `aff` o nome do parceiro (põe `rel="sponsored"` e `data-afiliado` para o `afiliados-tracking.js`) e `nota` a frase pequena por baixo do botão.
- `bonus` e `tags`: etiquetas por baixo do nome. Em `tags`, `w: 1` é um aviso (amarelo) e `w: 0` uma vantagem (verde).
- `review`: link para a análise completa no site.
- `src`: preçário ou página oficial (link "Ver preçário").
- `f`: valores usados nos filtros, na ordenação e nos destaques. `custoMes` é o custo por mês (comissão de manutenção mais a anuidade do cartão de débito a dividir por 12), `custoMesCond` o mesmo com as condições do banco (ordenado, TPA, etc.) e `custoAno` o total de um ano, que aparece nos detalhes. Os custos já incluem o Imposto do Selo quando se aplica. Os outros campos (`jurosMax`, `iban`, `mbway`, etc.) servem os filtros.
- `custoNota`: frase curta por baixo do custo quando não há preço com condições (por exemplo, uma isenção para novas empresas ou um custo de ativação).
- `t`: textos de cada linha da comparação. `v` é o valor curto e `s` a explicação.
- `c`: chaves de `t` que não foi possível confirmar numa fonte oficial. Mostram a etiqueta "A confirmar".

## Como publicar uma alteração

1. Edita os ficheiros e faz commit e push para o GitHub.
2. Copia o hash do commit (`git rev-parse HEAD`).
3. Na página do Webflow, troca o hash nos dois blocos de custom code (head e footer). Estão em `webflow-custom-code.html`.
4. Publica a página.

O commit fixo garante que o CSS, o JS e os dados mudam todos ao mesmo tempo e que a cache do jsDelivr não serve uma versão antiga.

## Regras dos dados

- Só fontes primárias: preçário do banco, documento de informação sobre comissões, ficha de informação normalizada, termos oficiais ou o Portal do Cliente Bancário. Nunca bankeronwheels.com, blogs ou outros comparadores.
- Os custos incluem o Imposto do Selo de 4% nas comissões cobradas em Portugal.
- Textos sem travessão, com valores no formato "4,99€" e "2,25% TANB".
