// Load and render projects
fetch('/projects.json')
  .then(res => res.json())
  .then(projects => {
    const grid = document.querySelector('.project-grid')
    if (grid) {
      grid.innerHTML = projects.map(p => {
        const isLocal = p.link.startsWith('/')
        const url = isLocal ? new URL(p.link, window.location.origin) : new URL(p.link)
        const displayUrl = url.hostname + (url.pathname !== '/' ? url.pathname : '')
        return `
        <a href="${p.link}" class="project-card"${isLocal ? '' : ' target="_blank"'}>
          <div class="project-image">
            <img src="${p.image.replace('/upload/', '/upload/q_auto/')}" alt="${p.title}">
            <p class="project-about">${p.description}</p>
          </div>
          <div class="project-title">
            <h3>${p.title}</h3>
            <span class="project-url">${displayUrl}</span>
          </div>
        </a>
      `}).join('')
      
      // ScrollReveal for dynamically loaded project cards
      ScrollReveal().reveal('.project-card', {
        cleanup: true,
        distance: '10%',
        interval: 100,
        origin: 'bottom',
        viewOffset: { bottom: 300 },
      })
      ScrollReveal().sync()
    }
  })