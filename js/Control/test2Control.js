var ctrl_2 = new commonControl('test2');
/*
동적으로 페이지 로드하는 과정에서 사용한 페이지 컨트롤 객체를 복제 후 삭제 하는 로직
*/
ctrl_2.copyCommonPageControl(ctrl_2);
pageControl.useExtentionScript = false;
ctrl_2.loadExtentionScript(function(result){console.log(result);return result;});