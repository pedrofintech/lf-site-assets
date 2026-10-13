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
