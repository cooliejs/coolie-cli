coolie.config({
    mode: 'CJS',
    mainModulesDir: '/static/js/main/',
    nodeModulesDir: '/node_modules/',
    nodeModuleMainPath: 'src/index.js',
    debug: true,
    global: {
        CLASSICAL: false
    }
}).use();