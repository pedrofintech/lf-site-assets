# Educação Financeira — código custom para Webflow

JS/CSS para `educacaofinanceirabrasil.com.br`. O build fica em `dist/`, dentro deste repo,
e é servido pelo jsDelivr a partir de um commit fixo. É carregado em todas as páginas com
**uma só tag** no Site Settings → Custom Code → Footer.

## Como funciona

- `src/main.js` carrega os globais (menu, cookies, gsap-opacity, etc.) e usa um router
  por `location.pathname` para fazer `import()` dinâmico do módulo da página certa.
- Vite faz code-splitting: cada página vira um chunk lazy-loaded, utilities partilhadas
  (save-table, calculadora-inputs, etc.) são extraídas em chunks comuns.
- Build final em `dist/` com entry fixo `main.js` + chunks hashed. Os caminhos dos chunks
  são relativos ao `main.js`, por isso o mesmo build funciona em qualquer commit.
- `dist/` **está no git** de propósito: é o que o jsDelivr serve.

## Setup local (uma vez)

```bash
# 1. Trust mkcert root CA (requer sudo, abre prompt do macOS)
mkcert -install

# 2. Instalar dependências
npm install
```

Os certificados HTTPS já estão em `.cert/` (gerados com `mkcert localhost 127.0.0.1 ::1`,
válidos até 2028). Estão no `.gitignore`, cada máquina gera os seus.

## Workflow diário

```bash
npm run dev      # Vite dev server em https://localhost:3000 (HMR)
npm run build    # Build de produção para dist/
npm run preview  # Servir o build local para sanity check
```

## Loader para Webflow (uma única tag, todas as páginas)

Cola isto em **Site Settings → Custom Code → Footer Code**:

```html
<script>
(function () {
  var PROD = "https://cdn.jsdelivr.net/gh/pedrofintech/lf-site-assets@COMMIT/educacao-financeira/dist/main.js";
  var DEV = "https://localhost:3000/src/main.js";
  var s = document.createElement("script");
  s.type = "module";

  function load(src, label) {
    console.log("%c[lf-code] " + label + " → " + src, "color:#FD8D2B;font-weight:600");
    s.src = src;
    document.body.appendChild(s);
  }

  // No staging do Webflow (*.webflow.io) tenta dev server primeiro, cai para prod
  if (window.location.hostname.indexOf(".webflow.io") !== -1) {
    console.log("[lf-code] staging detectado, a tentar dev server…");
    fetch(DEV, { mode: "no-cors" })
      .then(function () { load(DEV, "DEV (localhost)"); })
      .catch(function () { load(PROD, "PROD (jsDelivr) — dev server offline"); });
  } else {
    load(PROD, "PROD (jsDelivr)");
  }
})();
</script>
```

`COMMIT` é o hash completo do commit do `lf-site-assets` que tem o build que queres pôr online.

- **Domínio publicado** (`educacaofinanceirabrasil.com.br`) → carrega sempre o `main.js` do jsDelivr.
- **Webflow staging** (`educacaofinanceira.webflow.io`) → tenta `https://localhost:3000/src/main.js`; se o `npm run dev` não estiver a correr, faz fallback para o jsDelivr.

Sem isto, terias de trocar a URL à mão sempre que mudasses entre dev e prod.

## Estrutura

```
src/
  main.js                           # entry: globais + router
  globals/                          # corre em todas as páginas
    menu.js, cookies.js, copyright.js, gsap-opacity.js,
    titles-animation.js, lock-scroll-load.js, marquee.js, document-load.js
  shared/                           # utilities reutilizadas (lazy-loaded por chunk)
    calculadora-inputs.js, save-chart.js, save-table.js, nota.js,
    dropdown-scroll.js, reload-button.js, calcular-scroll-results.js,
    copy-results-button-click.js, graphic-table-buttons.js,
    table-style-remove-margin.js, swiper-base.js, number-count.js,
    calculadora-salario-disable-inputs.js
    styles/
      table-style.css, table-style-calculadora.css,
      table-style-calculadora-salario.css, table-style-calculadora-habitacao.css,
      vantagens-desvantagens.css
  pages/                            # uma pasta por rota Webflow
    calculadora-juros-compostos/
    calculadora-independencia-financeira/
    calculadora-investimentos/
    simulador-financiamento-imobiliario/
    simulador-emprestimo-pessoal/
    contatos/
    artigos/                        # também usado em /artigos/<slug> (collection detail)
    categorias-artigos/             # /categorias-artigos/<slug>
    portfolio/

legacy/                             # mantido mas NÃO carregado
  calculadora-salario.js, calculadora-salario-liquido-2025.js,
  share-salario-liquido.js, credito-habitacao-dev.js,
  calculadoras-backup/
```

## Mapping rota → módulos

Definido em [src/main.js](src/main.js). Pathname normalizado (sem trailing slash, lowercase):

| Pathname Webflow | Módulo carregado |
|---|---|
| `/calculadora-juros-compostos` | `pages/calculadora-juros-compostos/` |
| `/calculadora-independencia-financeira` | `pages/calculadora-independencia-financeira/` |
| `/calculadora-investimentos` | `pages/calculadora-investimentos/` |
| `/simulador-financiamento-imobiliario` | `pages/simulador-financiamento-imobiliario/` |
| `/simulador-emprestimo-pessoal` | `pages/simulador-emprestimo-pessoal/` |
| `/contatos` | `pages/contatos/` |
| `/artigos`, `/artigos/*` | `pages/artigos/` |
| `/categorias-artigos/*` | `pages/categorias-artigos/` |
| `/portfolio` | `pages/portfolio/` |
| qualquer outro (`/`, `/sobre`, `/parcerias`, `/recursos/*`, etc.) | só globais |

Para adicionar uma página nova: cria `src/pages/<slug>/index.js` com os imports
necessários e adiciona uma linha em `routes` no `src/main.js`.

## Globais e dependências externas

Os scripts assumem disponíveis no global scope (Webflow já carrega):

- `jQuery` (`$`)
- `GSAP` + `ScrollTrigger`
- `Chart.js` (calculadoras com gráficos)

Se mudares para uma página sem esses globais, partem com `ReferenceError`.

## Deploy

Não há deploy automático. Para pôr uma alteração online:

1. Alterar o código em `src/`.
2. `npm run build`, nesta pasta.
3. Commit de `src/` **e** de `dist/` juntos, e push para `main`.
4. No Webflow, trocar o `COMMIT` do loader pelo hash completo desse commit e publicar.

O commit fica fixo no URL, por isso o jsDelivr nunca serve uma versão misturada nem
desatualizada. O mesmo padrão das calculadoras da Literacia.

Se esquecer o passo 2, o site continua com o build antigo: o `dist/` é o que vai online,
não o `src/`.
