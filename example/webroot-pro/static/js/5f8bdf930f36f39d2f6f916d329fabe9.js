/*coolie built*/
coolie.config({
    debug: false,
    mode: "AMD",
    asyncModulesMap: {"5":"15ef421c8f01ef1823cfd99c60815f49"},
    chunkModulesMap: {"0":"bc75e988cf2b182d93f1394e3a2aa5ff"},
    built: "coolie@2.0.0-alpha3",
    mainModulesDir:"/static/js/main/",
    asyncModulesDir:"../async/",
    chunkModulesDir:"../chunk/",
    global:{"hehe":true,"CLASSICAL":false}
}).use().callback(function () {
    console.log(1);
}).callback(function () {
    console.log(2);
});