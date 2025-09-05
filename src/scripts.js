//clarity.microsoft.com
;(function (c, l, a, r, i, t, y) {
  c[a] =
    c[a] ||
    function () {
      ;(c[a].q = c[a].q || []).push(arguments)
    }
  t = l.createElement(r)
  t.async = 1
  t.src = 'https://www.clarity.ms/tag/' + i
  y = l.getElementsByTagName(r)[0]
  y.parentNode.insertBefore(t, y)
})(window, document, 'clarity', 'script', 'kgt38bqmrh')

// Smooth scroll for anchor links
document.querySelectorAll('[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault()
    document.querySelector(link.getAttribute('href')).scrollIntoView({
      behavior: 'smooth',
    })
  })
})

// ScrollReveal animations
const scrollConfig = {
  cleanup: true,
  distance: '20%',
  interval: 100,
  origin: 'bottom',
}
ScrollReveal().reveal('.brand,nav a,#hero p,.lower img', scrollConfig)
ScrollReveal().reveal('h2,#about a,#about p', {
  ...scrollConfig,
  viewOffset: { top: -500 },
})
