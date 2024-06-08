import { ComponentModel } from './core/Component.js';

const Router = class {
    constructor(pageName) {
        this.comp = new ComponentModel(pageName);
        this.loadPage = function(){
            let comp = this.comp;
            variableObject.set(pageName);
            variableObject.getOnChange = function() {
                if(this.value) {
                    pageName = this.value;
                    document.title = pageName;
                    if(pageControl.hasOwnProperty('useExtentionScript')){
                        router.releaseGlobalObject(); // 동적 모듈 제거 및 등록된 전역 변수 제거  
                    }
                    comp.setPageName(pageName);

                    if(__valueObject && __valueObject.hasOwnProperty(pageName)) injectObject(pageName,__valueObject[pageName]);
                    else injectObject(pageName);
                }
            }
        }
        // 전역 객체 내역에서 스크립트 이름과 관련된 메인 모듈을 찾아서 담아주는 함수
        this.getAllVariables = function(){
            var valueList = [];
            var extScripts = [];
            __valueObject.router.comp.getExtentionScript().filter(function name(params) {
                extScripts.push(params.src);
                valueList.push('');
            });
            for (var _name in window){
                var obj;
                if(window[_name] != null && window[_name].hasOwnProperty('document')) obj = window[_name];
                if(obj != undefined && obj.document.location != undefined){
                    var setObject = {};
                    setObject[_name] = obj;
                    var index = extScripts.findIndex(function(item){return item.toLocaleLowerCase().includes(_name.toLocaleLowerCase())});
                    if(index > -1) valueList[index] = setObject;
                }
            }
            return valueList;
        }
        // 전역 변수로 등록되어 있는 메인 모듈을 찾아서 제거 하는 함수
        this.releaseGlobalObject = function(){
            var exlucdeVariables = router.getAllVariables();
            if(pageControl.hasOwnProperty('extentionScript')){
                var extentionScript = pageControl.extentionScript;
                if(extentionScript != undefined && extentionScript.length > 0){
                    extentionScript.forEach(function(ext){
                        var matchScript = Array.from(document.head.childNodes).find(function(item){if(item.src != undefined && item.src.toLocaleLowerCase().includes(ext.toLocaleLowerCase())) return item;});
                        if(matchScript != undefined){
                            // 스크립트 모듈 이름을 정규식으로 찾아서 조건에 해당하는 전역변수를 찾아서 삭제
                            var regEx = new RegExp(exlucdeVariables.map(function(i){return Object.keys(i)[0]}).join("|"), 'gi')
                            if(ext.match(regEx)) {
                                var index = exlucdeVariables.map(function(i){return Object.keys(i)[0]}).findIndex(function(item){
                                    if(item != undefined){
                                        return ext.toLocaleLowerCase().includes(item.toLocaleLowerCase());
                                    }
                                });
                                if(index > -1){
                                    var name = Object.keys(exlucdeVariables[index])[0];
                                    if(window.hasOwnProperty(name)) {
                                        window[name] = undefined;
                                    } 
                                }
                            }
                            document.head.removeChild(matchScript);
                        } 
                    });
                }
            }
        }
    }
}

var router = new Router(pageName);
router.loadPage();
var valueControlObject;
// 전역 상태 관리 변수
function injectObject(target,changeValue){
    function variableModule() {
        this.valueMember = {
        };
        variableModule.prototype.setValue = function(target,changeValue){
            if(!target){
                this.valueMember[pageName] = {};
            }
            else {
                if(!changeValue) this.valueMember[target] = {};
                else this.valueMember[target] = changeValue;
            }
            return this.valueMember;
        };
    }
    if(!__valueObject){
        valueControlObject = new variableModule();
    }
    valueControlObject.setValue(target,changeValue);
    __valueObject = valueControlObject.valueMember;
}
injectObject();
__valueObject.router = router;