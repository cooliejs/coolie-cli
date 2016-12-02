/*coolie built*/
coolie.config({
    debug: false,
    mode: "AMD",
    asyncModulesMap: {"5":"07a1c9e2049b339c758c871bf8eba32b"},
    chunkModulesMap: {"0":"7bf49ba13df5607d9bbc18cb3d1bf0fe"},
    built: "coolie@2.0.9",
    mainModulesDir:"/1/2/3/static/js/main/",
    asyncModulesDir:"../async/",
    chunkModulesDir:"../chunk/",
    global:{"hehe":true,"CLASSICAL":false}
}).use().callback(function () {
    console.log(1);
}).callback(function () {
    console.log(2);
});