const ControlModule = class {
    constructor(_controlName) {
        this.controlName = _controlName;
        this.createControl =function(){
            var control = function(_controlName){
                var controlName = _controlName;
                var scriptName = '';
                var ctrlVariables = {};
                try {
                    var src = document.currentScript.src.split('/');
                    src = src.slice(src.length-1,src.length).join('');
                    scriptName = src.includes(`${controlName}Control`) ? src : '';
                } catch (error) {
                    log.error(error);
                }
                var getName = function(){
                    ctrlVariables = __valueObject[controlName];
                    return controlName;
                }
                var getCtrl = function(_ctrlName){
                    ctrlVariables.scriptName = scriptName;
                    ctrlVariables.pageName = _ctrlName;
                    ctrlVariables.extentionScript = [];
                    var router = __valueObject.router;
                    ctrlVariables.router = router;

                    var extentionScript = router.comp.getExtentionScript();
                    if(extentionScript != undefined && extentionScript.length > 0){
                        extentionScript.forEach(function(item){
                            var src = "/";
                            if (item.src.includes(window.location.href)){
                                src += item.src.replace(window.location.href,'');
                            }
                            else src = item.src;
                            ctrlVariables.extentionScript.push(src);
                        });
                    }
                    if(ctrlVariables.extentionScript.length == 0){
                        delete __valueObject['extentionScript'];
                    } 

                    return ctrlVariables;
                }
                return{
                    getName : getName,
                    getCtrl : getCtrl
                }
            };
            var loadControl = function(_controlName){
                var createControl = control(_controlName);
                var scriptName = createControl.getName();
                var ctrlVariables = createControl.getCtrl(scriptName);
                pageName = ctrlVariables.pageName;
                return ctrlVariables;
            }
            return loadControl(this.controlName);
        };
        this.copyCommonPageControl = function(_ctrl){
            pageControl = Object.assign({},_ctrl.createControl()); // 전역 컨트롤 생성객체에서 객체 복사해서 사용
            delete __valueObject[pageControl['pageName']]; // 복사 후 원본 객체 삭제
        }
        this.loadExtentionScript = function(_callback,_extModules){
            var useExtentionScript = true;
            useExtentionScript = pageControl.hasOwnProperty('useExtentionScript') ? pageControl.useExtentionScript : useExtentionScript;
            pageControl.useExtentionScript = useExtentionScript;
            if (!useExtentionScript){
                // 확장 스크립트 사용을 하지 않는 경우 라우터 객체 필요가 없어서 삭제
                delete pageControl['extentionScript'];
                delete pageControl['router'];
                return _callback;
            }
            else{
                var extentionScript = pageControl.extentionScript;
                if(_extModules != undefined){
                    extentionScript = pageControl.extentionScript.filter(function (_module) {
                        return _extModules.includes(_module);
                    });
                    pageControl.extentionScript = extentionScript;
                }
                var router =  pageControl.router == undefined ? __valueObject.router : pageControl.router;
                if(extentionScript != undefined && extentionScript.length > 0){
                    extentionScript.forEach(function(item){
                        router.comp.getCompView().loadDynamicSrc('js','script','text/javascript','', item, _callback);
                        return _callback;
                    });
                }
            }
        }
    }
}
commonControl = ControlModule;