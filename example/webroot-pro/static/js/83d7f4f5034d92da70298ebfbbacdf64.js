/*coolie built*/
coolie.config({
    debug: false,
    mode: "AMD",
    asyncModulesMap: {"5":"5f5757dde370ae5f2f56acf141ba8501"},
    chunkModulesMap: {"0":"dad773564d728316d1c868e85aa6f088"},
    built: "coolie@2.0.0-beta3",
    mainModulesDir:"/static/js/main/",
    asyncModulesDir:"../async/",
    chunkModulesDir:"../chunk/",
    global:{"hehe":true,"CLASSICAL":false}
}).use().callback(function () {
    console.log(1);
}).callback(function () {
    console.log(2);
});