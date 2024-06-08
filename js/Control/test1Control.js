var ctrl_1 = new commonControl('test1');
/*
동적으로 페이지 로드하는 과정에서 사용한 페이지 컨트롤 객체를 복제 후 삭제 하는 로직
*/
ctrl_1.copyCommonPageControl(ctrl_1);
ctrl_1.loadExtentionScript(function(result){
    console.log(result);
    Promise.resolve(createElement(result));
    return result;
},extModuleList.prod);

function createElement(_result){
    if(_result.src.toLowerCase().includes('backbone')){
        console.log(_result);
        var ElementDef = Backbone.View.extend({
            tagName: 'button',
            className: 'pageMove',
            id: 'test',
        });
        var elementList = ['test1','test3'];
        createElement(elementList);
        function createElement(_list){
            _list.forEach(function(id){
                console.log(element);
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
            console.log(el.id);
            variableObject.set(el.id);
        }
    }
    return;
};