# Ficheiros vindos dos CodeSandbox

Cópia 1:1, sem alterações, dos ficheiros que o Rahatarkus e o BrokerMatch carregavam
de `<id>.csb.app` (13 out 2026). Cada pasta é um sandbox e mantém os mesmos caminhos,
por isso a migração nas páginas foi só trocar o início do endereço:

    https://<id>.csb.app/<ficheiro>
    https://cdn.jsdelivr.net/gh/pedrofintech/lf-site-assets@<commit>/codesandbox/<id>/<ficheiro>

| Pasta | Usado em |
|---|---|
| `5r22jh/` | Rahatarkus |
| `ywj946/` | Rahatarkus |
| `l8xsgx/` | BrokerMatch |
| `7ykmtc/` | Rahatarkus e BrokerMatch (`artigo-index.js`, CSS das tabelas) |

Ficheiros com o mesmo nome em pastas diferentes não são necessariamente iguais: cada
página continua a usar a versão do sandbox que já usava.

Não incluído: `post-small-text.css` (5r22jh e l8xsgx). O link devolvia a página de erro
do CodeSandbox, nunca aplicou CSS nenhum; as tags foram retiradas das páginas.

A EUPF não usa esta pasta: o Franklin tem os ficheiros dela em
`franklinsilvapt-arch/eupf-site-assets`.
