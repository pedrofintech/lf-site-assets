console.log(
  "%c[lf-code] main.js a correr de:%c " + import.meta.url,
  "color:#FD8D2B;font-weight:600",
  "color:inherit"
)

// Polyfill: o nosso bundle carrega depois do DOMContentLoaded, por isso scripts
// que fazem `document.addEventListener("DOMContentLoaded", fn)` nunca disparariam.
// Aqui interceptamos e corremos `fn` imediatamente se o DOM já estiver pronto.
const _origAdd = document.addEventListener.bind(document)
document.addEventListener = function (type, listener, options) {
  if (
    type === "DOMContentLoaded" &&
    document.readyState !== "loading" &&
    typeof listener === "function"
  ) {
    Promise.resolve().then(() =>
      listener.call(document, new Event("DOMContentLoaded"))
    )
    return
  }
  return _origAdd(type, listener, options)
}

// Globais — corre em todas as páginas
import './globals/document-load.js'
import './globals/copyright.js'
import './globals/cookies.js'
import './globals/categoria-link.js'
import './globals/menu.js'
import './globals/lock-scroll-load.js'
import './globals/marquee.js'
import './globals/titles-animation.js'
import './globals/gsap-opacity.js'

// Router — escolhe o módulo da página com base no pathname do Webflow
const path = (location.pathname.replace(/\/+$/, '') || '/').toLowerCase()

const routes = [
  { test: (p) => p === '/', load: () => import('./pages/home/index.js') },
  { test: (p) => p === '/calculadora-juros-compostos', load: () => import('./pages/calculadora-juros-compostos/index.js') },
  { test: (p) => p === '/calculadora-independencia-financeira', load: () => import('./pages/calculadora-independencia-financeira/index.js') },
  { test: (p) => p === '/calculadora-investimentos', load: () => import('./pages/calculadora-investimentos/index.js') },
  { test: (p) => p === '/simulador-financiamento-imobiliario', load: () => import('./pages/simulador-financiamento-imobiliario/index.js') },
  { test: (p) => p === '/simulador-emprestimo-pessoal', load: () => import('./pages/simulador-emprestimo-pessoal/index.js') },
  { test: (p) => p === '/contatos', load: () => import('./pages/contatos/index.js') },
  { test: (p) => p.startsWith('/artigos'), load: () => import('./pages/artigos/index.js') },
  { test: (p) => p === '/portfolio', load: () => import('./pages/portfolio/index.js') },
]

const route = routes.find((r) => r.test(path))
if (route) {
  console.log(`[lf-code] rota detectada: ${path} — a carregar chunk…`)
  route.load()
    .then(() => console.log(`[lf-code] chunk carregado para ${path}`))
    .catch((err) => console.error(`[lf-code] falhou a carregar módulo para ${path}:`, err))
} else {
  console.log(`[lf-code] sem chunk específico para ${path} (só globais)`)
}
