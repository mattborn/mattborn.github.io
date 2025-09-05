const fs = require('fs')
const path = require('path')

// Configuration
const config = {
  srcDir: './src',
  buildDir: './build',
  layoutFile: './src/layout.html',
  pagesFile: './src/pages.json',
  assetsDir: './assets'
}

// Read layout template
const layout = fs.readFileSync(config.layoutFile, 'utf8')

// Read page configurations
let pages = {}
if (fs.existsSync(config.pagesFile)) {
  pages = JSON.parse(fs.readFileSync(config.pagesFile, 'utf8'))
}

// Create build directory
if (!fs.existsSync(config.buildDir)) {
  fs.mkdirSync(config.buildDir, { recursive: true })
}

// Helper function to copy directory recursively
function copyDirectory(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true })
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true })
  
  for (let entry of entries) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)
    
    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath)
    } else {
      fs.copyFileSync(srcPath, destPath)
    }
  }
}

// Process source files
if (fs.existsSync(config.srcDir)) {
  fs.readdirSync(config.srcDir).forEach(file => {
    const srcPath = path.join(config.srcDir, file)
    const buildPath = path.join(config.buildDir, file)
    const stat = fs.statSync(srcPath)
    
    if (stat.isDirectory()) {
      // Copy directories as-is
      copyDirectory(srcPath, buildPath)
      console.log(`📁 Copied directory ${file}`)
    } else if (file.endsWith('.html') && file !== 'layout.html') {
      // Process HTML files with layout (skip layout.html itself)
      const content = fs.readFileSync(srcPath, 'utf8')
      const pageName = file.replace('.html', '')
      const pageConfig = pages[pageName] || {}
      
      // Use index config as defaults for all pages
      const indexDefaults = pages['index'] || {}
      
      // Merge: index defaults < page-specific config
      const replacements = { 
        ...indexDefaults, 
        ...pageConfig,
        content 
      }
      
      // Generate active states from filename
      const activePageName = pageName === 'index' ? 'home' : pageName
      const navPages = ['home']
      navPages.forEach(page => replacements[`${page}-active`] = page === activePageName ? 'active' : '')
      
      // Generate og-url from output path
      replacements['og-url'] = pageName === 'index' ? '/' : `/${pageName}/`
      
      // Generate current year
      replacements['year'] = new Date().getFullYear()
      
      // Replace all placeholders (including {content})
      let html = layout
      for (const [key, value] of Object.entries(replacements)) {
        const regex = new RegExp(`{${key}}`, 'g')
        html = html.replace(regex, value)
      }
      
      // Add page-specific styles and scripts if they exist
      const pageStylePath = path.join(config.srcDir, `${pageName}.css`)
      const pageScriptPath = path.join(config.srcDir, `${pageName}.js`)
      
      if (fs.existsSync(pageStylePath)) {
        html = html.replace(
          '<link rel="stylesheet" href="/styles.css" />',
          '<link rel="stylesheet" href="/styles.css" />\n    <link rel="stylesheet" href="/' + pageName + '.css" />'
        )
      }
      
      if (fs.existsSync(pageScriptPath)) {
        html = html.replace(
          '<script defer src="/scripts.js"></script>',
          '<script defer src="/scripts.js"></script>\n    <script defer src="/' + pageName + '.js"></script>'
        )
      }
      
      
      // Determine output path
      let outputPath = buildPath
      if (pageName !== 'index') {
        // Convert system.html → /system/index.html
        const folderName = pageName
        const folderPath = path.join(config.buildDir, folderName)
        if (!fs.existsSync(folderPath)) {
          fs.mkdirSync(folderPath, { recursive: true })
        }
        outputPath = path.join(folderPath, 'index.html')
      }
      
      fs.writeFileSync(outputPath, html)
      console.log(`✅ Built ${file} → ${outputPath.replace(config.buildDir, '')}`)
    } else if (file !== 'layout.html') {
      // Copy all other files as-is (except layout.html)
      fs.copyFileSync(srcPath, buildPath)
      console.log(`📄 Copied ${file}`)
    }
  })
}

// Copy assets directory if it exists
if (fs.existsSync(config.assetsDir)) {
  const buildAssetsPath = path.join(config.buildDir, 'assets')
  copyDirectory(config.assetsDir, buildAssetsPath)
  console.log('🎨 Copied assets')
}

// Copy root files (CNAME, favicon, etc.)
const rootFiles = ['CNAME', 'favicon.ico', 'favicon.svg', 'robots.txt']
rootFiles.forEach(file => {
  if (fs.existsSync(file)) {
    fs.copyFileSync(file, path.join(config.buildDir, file))
    console.log(`📋 Copied ${file}`)
  }
})

console.log('\n🎉 Build complete! Files are in', config.buildDir)