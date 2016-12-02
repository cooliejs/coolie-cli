/*coolie built*/
coolie.config({
    debug: false,
    mode: "AMD",
    asyncModulesMap: {"5":"da5c077803387aaca90d5c59c51bf5e5"},
    chunkModulesMap: {"0":"e0dde24a65ef134f1e0178cd3fbcbc32"},
    built: "coolie@2.0.7",
    mainModulesDir:"/1/2/3/static/js/main/",
    asyncModulesDir:"../async/",
    chunkModulesDir:"../chunk/",
    global:{"hehe":true,"CLASSICAL":false}
}).use().callback(function () {
    console.log(1);
}).callback(function () {
    console.log(2);
});