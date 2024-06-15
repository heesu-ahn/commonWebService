var ctrl_3 = new commonControl('test3');
/*
동적으로 페이지 로드하는 과정에서 사용한 페이지 컨트롤 객체를 복제 후 삭제 하는 로직
*/
ctrl_3.copyCommonPageControl(ctrl_3);
ctrl_3.loadExtentionScript(function(result){
    Promise.resolve(createElement(result));
    return result;
},extModuleList.dev);

function createElement(_result){
    if(_result.src.toLowerCase().includes('backbone')){
        var ElementDef = Backbone.View.extend({
            tagName: 'button',
            className: 'pageMove',
            id: 'test',
        });
        var elementList = ['test1','test3'];
        createElement(elementList);
        function createElement(_list){
            _list.forEach(function(id){
                var elementDef = new ElementDef();
                var element = elementDef.el;
                element.id = id;
                element.innerText = id;
                element.addEventListener('click',function(el) {
                    movePage(el.target);
                })
                document.body.appendChild(element);
            });
        }
        function movePage(el){
            variableObject.set(el.id);
        }
    }
    return;
};