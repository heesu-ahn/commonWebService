var ctrl_3 = new commonControl('test3');
/*
동적으로 페이지 로드하는 과정에서 사용한 페이지 컨트롤 객체를 복제 후 삭제 하는 로직
*/
ctrl_3.copyCommonPageControl(ctrl_3);
ctrl_3.loadExtentionScript(function(result){console.log(result);return result;},extModuleList.dev);