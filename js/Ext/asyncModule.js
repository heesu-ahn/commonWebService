console.log('asyncModule.js');


function nonAsyncFunc (_func){
    this.asyncFunc = _func;
}

nonAsyncFunc.prototype.changeAsyncFunc = async function(_callback){
    return await this.asyncFunc(_callback);
}

class callAsyncModule{
    #nonAsyncFunc
    #asyncResultCallback
    constructor(_func,_callback){
        this.#nonAsyncFunc = new nonAsyncFunc(_func);
        this.#asyncResultCallback = _callback;
    }
    callAsync(){
        var _nonAsync = this.#nonAsyncFunc;
        return _nonAsync.changeAsyncFunc(_nonAsync);
    }
    getAsyncCallback(_result){
        if(_result != undefined){
            return this.#asyncResultCallback(_result);
        }
    }
}

var asynAjsxModule = (function(){
    var getResquestData = function(_paramerter,_completeFn) {
        var callbackFn = _completeFn;
        promiseModule(_paramerter,function(cb){
            callbackFn(cb);
        });
    }
    var promiseModule = function(_parameters,_callback) {
        return ajaxCall(_parameters,function(cb){
            if (cb != undefined) {
                nonAsync2 = function(_callback){
                    return cb;
                }
                asyncCallback2 = function(_result){
                    _result.then(function(data){
                        // 결과값을 문자열에서 json 변환해서 리턴해 줌 (json 결과값이 아닌 경우 일반 문자열로 리턴)
                        var json = convertJsonData(data); 
                        return _callback(json);
                    });
                }
                var asyncModule2 = new callAsyncModule(nonAsync2,asyncCallback2);
                var asyncFunc2 = asyncModule2.callAsync();
                asyncModule2.getAsyncCallback(asyncFunc2);
            }
        });
    }
    var ajaxCall = function(_paramData,_ajaxCallback){	
        
        if(_paramData.type == undefined) _paramData.type = 'POST';
        
        _ajaxCallback(
            
            Backbone.ajax({
                type : _paramData.type,
                async : true,
                url : _paramData.url,
                data : _paramData.param,
                dataType : _paramData.dataType,
                beforeSend : function() {

                },
                success : function(data) {
                    return data;
                },
                error : function(data, status, err) {
                    alert('오류가 발생하였습니다.\n' + err);
                },
                complete : function() {    
                    
                }
            })
        );
    }

    function convertJsonData(_strVal){ // ajax 결과값을 jsonString 에서 jsonObject로 자동 변환시켜주는 기능
        var jsonObj; // output
        if(typeof(_strVal) == 'string'){
            if(_strVal.includes('%5B')){ // get jsonArray encoding
                _strVal = decodeURIComponent(_strVal);
                if(_strVal.includes('%7B')){ 
                    return convertJsonData(_strVal);
                }
                else jsonObj = JSON.parse(_strVal);
            }
            else if(_strVal.includes('%7B')){ // get jsonObject encoding
                _strVal = decodeURIComponent(_strVal);
                jsonObj = JSON.parse(_strVal);
            }
            else if(_strVal.includes('&quot;')){ // get html escape
                _strVal = _strVal.replaceAll('&quot;','"');
                return convertJsonData(_strVal);
            }
            else {
                try { // get jsonStr
                    jsonObj = JSON.parse(_strVal);
                } catch (error) { // plainText
                    return _strVal;
                }
                return jsonObj;
            } 
        }
        else{
            try {
                JSON.stringify(_strVal);
            } catch (error) {
                return undefined;
            }
            return _strVal;
        }
    }

    return{
        getResquestData : getResquestData,
        promiseModule : promiseModule,
        ajaxCall : ajaxCall
    }
})();
