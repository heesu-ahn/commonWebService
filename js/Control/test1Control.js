var ctrl_1 = new commonControl('test1');
/*
동적으로 페이지 로드하는 과정에서 사용한 페이지 컨트롤 객체를 복제 후 삭제 하는 로직
*/
ctrl_1.copyCommonPageControl(ctrl_1);
ctrl_1.loadExtentionScript(function(result){console.log(result);return result;},extModuleList.prod);