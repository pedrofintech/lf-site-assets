console.log(
  "%c[lf-code] main.js a correr de:%c " + import.meta.url,
  "color:#FD8D2B;font-weight:600",
  "color:inherit"
)

// Tem de ser o primeiro import: os módulos importados correm antes do corpo
// deste ficheiro, por isso o polyfill tem de estar ativo antes dos globais.
import './globals/dom-ready.js'

// Globais — corre em todas as páginas
import './globals/document-load.js'
import './globals/copyright.js'
import './globals/cookies.js'
import './globals/categoria-link.js'
import './globals/menu.js'
// Desligado (13 out 2026): forçava o topo ao abrir e rebentava em `lenis`,
// que não é global. Os outros sites não o têm.
// import './globals/lock-scroll-load.js'
import './globals/marquee.js'
// Desligado (13 out 2026): precisa do SplitType, que não é carregado, por
// isso nunca animou e só dava erro. Os outros sites não o têm.
// import './globals/titles-animation.js'
// Fades de entrada desligados a pedido (13 out 2026), para ficar como os
// outros sites, que têm os mesmos atributos [opacity-*] mas sem animação.
// import './globals/gsap-opacity.js'

// Router — escolhe o módulo da página com base no pathname do Webflow
const path = (location.pathname.replace(/\/+$/, '') || '/').toLowerCase()

const routes = [
  { test: (p) => p === '/', load: () => import('./pages/home/index.js') },
  { test: (p) => p === '/calculadora-juros-compostos', load: () => import('./pages/calculadora-juros-compostos/index.js') },
  { test: (p) => p === '/calculadora-independencia-financeira', load: () => import('./pages/calculadora-independencia-financeira/index.js') },
  { test: (p) => p === '/calculadora-investimentos', load: () => import('./pages/calculadora-investimentos/index.js') },
  { test: (p) => p === '/simulador-financiamento-imobiliario', load: () => import('./pages/simulador-financiamento-imobiliario/index.js') },
  { test: (p) => p === '/simulador-emprestimo-pessoal', load: () => import('./pages/simulador-emprestimo-pessoal/index.js') },
  { test: (p) => p === '/parcerias', load: () => import('./pages/parcerias/index.js') },
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
