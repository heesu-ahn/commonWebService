var ctrl_1 = new commonControl('test1');
/*
동적으로 페이지 로드하는 과정에서 사용한 페이지 컨트롤 객체를 복제 후 삭제 하는 로직
*/
ctrl_1.copyCommonPageControl(ctrl_1);
ctrl_1.loadExtentionScript(function(resp){
    form = asynAjsxModule.createSubmitForm();
    iframe = true;
    form.el.target = 'indexPage';
    document.body.appendChild(form.el);
    getDataSet(resp,form,function(result){
        if(result != undefined) {
            if(iframe == true) {
                form = result;
                window.chrome.webview != undefined && window.chrome.webview.postMessage('getData');
                window.chrome.webview != undefined && asynAjsxModule.addWebViewEventListener();
            }
            else console.log(result);
        }
    });
},extModuleList.prod);

var iframe;
var form;
var asyncModule;
var paramData = new Object();

function getDataSet(_result,_form,_callback){
    var regExp = /backbone/gi;
    var callbackFn = _callback;
    if(_result.src.match(regExp)){
        paramData.type = 'POST';
        paramData.param = new Object();
        paramData.param = {
            "FILE_TYPE":"exec",
            "CALL":"VIEWER5",
            "METHOD_NAME":"getProjectList",
            "ENCODE_KEYSIZE":"256",
            "IS_UBPARAMS_ENCODED":"YES",
            "UBPARAMS":"Vcnf6ZZPeLDryCk5kNg96g==",
            "LOAD_TYPE":"div",
        };
        paramData.url = 'http://127.0.0.1:8081/UBIServerWeb2/TestPage/index.html?varaiable=test';
        if(iframe != undefined) paramData.iframe = iframe;
        tryCallAjaxModlue(paramData,function(_result){
            return callbackFn(_result);
        })
    }
};

function tryCallAjaxModlue(_paramData,_callback){ 
    // asynAjsxModule 동적 로딩에 실패할 경우 로딩이 성공할 때까지 재시도 하는 함수
    try {
        getResult(function(cb){return _callback(cb);});
    } catch (error) {
        console.log('시스템 준비중입니다.');
        var tryCount = 0;
        var timer = setInterval(function(){                
            try {
                getResult(function(cb){return _callback(cb);},tryCount,timer);
            } catch (error) {
                if(tryCount == 10) { // 최대 시도 횟수 10
                    clearInterval(timer);
                    console.log('재시도 횟수 : ' + tryCount);
                    console.log('요청 실패');
                }
                else{console.log('재시도 횟수 : ' + tryCount);}
            }
        }, 1);
    }
    function getResult(_cb,_tryCount,_timer){
        tryCount +=1; // 재시도 횟수 + 1
        asynAjsxModule.getResquestData(_paramData,function(resp){return _cb(resp);});
        
        if(_timer != undefined) clearInterval(timer); // 요청이 성공하였으면 타이머 해제
    }
}