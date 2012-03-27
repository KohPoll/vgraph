({
    appDir: ".",
    baseUrl: "js/",
    dir: "../app-build",
    optimize: "none",
    paths: {
        "jquery": "require-jquery"
    },
    modules: [
        { name: "require-jquery" },
        { name: "main", exclude: ["jquery"] }
    ]
})
