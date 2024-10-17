var ctrl_1 = new commonControl('test1');
/*
동적으로 페이지 로드하는 과정에서 사용한 페이지 컨트롤 객체를 복제 후 삭제 하는 로직
*/
ctrl_1.copyCommonPageControl(ctrl_1);
ctrl_1.loadExtentionScript(function(result){
    Promise.resolve(createElement(result)).then(function(backbone){
        if(backbone != undefined) console.debug(backbone);
    });
},extModuleList.prod);

var asyncModule;
function createElement(_result){
    var regExp = /backbone/gi;
    if(_result.src.match(regExp)){
        var param = new Object();
        var paramData = new Object();
        paramData.type = 'GET';
        url = 'https://chroniclingamerica.loc.gov/search/titles/results/?terms=oakland&format=json&page=5';
        paramData.param = param;
        paramData.url = url;
        try {
            var existsModuleCheck = asynAjsxModule;
            if(existsModuleCheck != undefined){
                asynAjsxModule.getResquestData(paramData,function(resp){
                    console.log(resp);
                });
            }
        } catch (error) {
            console.log('시스템 준비중입니다.');
            setTimeout(() => {                
                asynAjsxModule.getResquestData(paramData,function(resp){
                    console.log(resp);
                });
            }, 10);
        }
    }
};