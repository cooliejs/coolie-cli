/*coolie built*/
coolie.config({
    debug: false,
    mode: "AMD",
    asyncModulesMap: {"5":"e10b5265875b870c598d21aeee6433c9"},
    chunkModulesMap: {"0":"9d7022cd173f9e24d42a11e645ab2343"},
    built: "coolie@2.0.1",
    mainModulesDir:"/1/2/3/static/js/main/",
    asyncModulesDir:"../async/",
    chunkModulesDir:"../chunk/",
    global:{"hehe":true,"CLASSICAL":false}
}).use().callback(function () {
    console.log(1);
}).callback(function () {
    console.log(2);
});