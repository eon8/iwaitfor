({
    mainConfigFile: 'bootstrap.js',
    baseUrl: 'app',
    paths: {
        bootstrap: '../bootstrap',
        requireLib: '../lib/require'
    },
    name: 'bootstrap',
    include: 'requireLib',
    out: 'built.js'
})

// nodejs r.js -o build.js
// nodejs js/r.js -o cssIn=style.css out=built.css