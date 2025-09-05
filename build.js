const fs = require('fs')
const path = require('path')

const config = {
  buildDir: './build',
  layoutFile: './src/layout.html',
  pagesFile: './src/pages.json',
  srcDir: './src',
}

const build = () => {
  const layout = fs.readFileSync(config.layoutFile, 'utf8')
  const pages = fs.existsSync(config.pagesFile)
    ? JSON.parse(fs.readFileSync(config.pagesFile, 'utf8'))
    : {}

  if (!fs.existsSync(config.buildDir))
    fs.mkdirSync(config.buildDir, { recursive: true })

  // Process source files
  if (fs.existsSync(config.srcDir)) {
    fs.readdirSync(config.srcDir).forEach(file => {
      const srcPath = path.join(config.srcDir, file)
      const buildPath = path.join(config.buildDir, file)
      const stat = fs.statSync(srcPath)

      if (stat.isDirectory()) {
        fs.cpSync(srcPath, buildPath, { recursive: true })
        console.log(`📁 ${file}`)
      } else if (file.endsWith('.html') && file !== 'layout.html') {
        const content = fs.readFileSync(srcPath, 'utf8')
        const pageName = file.replace('.html', '')
        const pageConfig = pages[pageName] || {}
        const indexDefaults = pages['index'] || {}

        const replacements = {
          ...indexDefaults,
          ...pageConfig,
          content,
          'og-url': pageName === 'index' ? '/' : `/${pageName}/`,
          year: new Date().getFullYear(),
          moreStyles: fs.existsSync(path.join(config.srcDir, `${pageName}.css`))
            ? `<link rel="stylesheet" href="/${pageName}.css" />`
            : '',
          moreScripts: fs.existsSync(path.join(config.srcDir, `${pageName}.js`))
            ? `<script defer src="/${pageName}.js"></script>`
            : '',
        }

        // Generate active states
        const activePageName = pageName === 'index' ? 'home' : pageName
        ;['home'].forEach(
          page =>
            (replacements[`${page}-active`] =
              page === activePageName ? 'active' : ''),
        )

        // Replace placeholders
        let html = layout
        Object.entries(replacements).forEach(([key, value]) => {
          html = html.replace(new RegExp(`{${key}}`, 'g'), value)
        })

        // Determine output path
        let outputPath = buildPath
        if (pageName !== 'index') {
          const folderPath = path.join(config.buildDir, pageName)
          if (!fs.existsSync(folderPath))
            fs.mkdirSync(folderPath, { recursive: true })
          outputPath = path.join(folderPath, 'index.html')
        }

        fs.writeFileSync(outputPath, html)
        console.log(`✅ ${file} → ${outputPath.replace(config.buildDir, '')}`)
      } else if (file !== 'layout.html') {
        fs.copyFileSync(srcPath, buildPath)
        console.log(`📄 ${file}`)
      }
    })
  }

  // Copy root files
  ;['CNAME', 'favicon.ico', 'favicon.svg', 'robots.txt'].forEach(file => {
    if (fs.existsSync(file)) {
      fs.copyFileSync(file, path.join(config.buildDir, file))
      console.log(`📋 ${file}`)
    }
  })

  console.log('\n🎉 Build complete!')
}

build()

if (process.argv[2] === '--watch') {
  fs.watch(config.srcDir, () => build())
  console.log('Watching for changes')
}
