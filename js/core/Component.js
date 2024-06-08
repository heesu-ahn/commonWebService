import { Observer } from './observer.js';

const extentionScript = [];

export class ComponentModel extends Observer  {
  #pageName
  #compView
  #extentionScript = [];
  constructor(pageName) {
    super();
    this.#pageName = pageName;
    if(this.#pageName) this.setPageName(this.#pageName);
  }
  getPageName() {
    return this.#pageName;
  }
  setPageName(pageName) {
    this.#pageName = pageName; //상태 변경
    this.notify(); //등록된 렌더링 함수들 호출
  }
  getCompView(){
    return this.#compView;
  }
  getExtentionScript(){
    return this.#extentionScript;
  }
  notify(){
    const compView = new ComponentView(this);
    compView.render();
    if(__valueObject && __valueObject.hasOwnProperty(this.#pageName)){
      compView.loadScript(this.#pageName,__valueObject[this.#pageName].addScript);
    } else {
      compView.loadScript(this.#pageName);
    }
    this.#extentionScript = extentionScript;
    this.#compView = compView;
  }
  callback(){
    // 콜백 함수에 연결된 감지기 인스턴스 생성
    const observer = new MutationObserver(this.getChange());
    const config = this.config;
    const targetElement = document.createElement("div");
    targetElement.id = 'valueObject';
    targetElement.style.display ="none";
    targetElement.hidden = true;
    document.body.appendChild(targetElement);
    observer.observe(targetElement, config);
    window.elementWatcher = document.getElementById('valueObject'); 
  }
}
export class ComponentView {
  #target
  constructor(model) {
    this.#target = document.getElementById("BODY");
    this.compModel = model;
    this.render();
    this.srcType = { // 지정된 네이밍룰에 맞춰서 동적으로 자원을 가져올 수 있게 해주는 변수
      //style:  { name : "Style", pattern:"css", element: "link", type: "text/css", rel: "stylesheet" },
      script: { name : "Control", pattern:"js", element: "script", type: "text/javascript", rel: "" }
    }
    // 템플릿 페이지에서 동적으로 현재 페이지의 HTML 텍스트를 받아오는 함수
    this.loadHtml = async function (pageName) {
      const response = await fetch(`/template/template.html`)
      const text = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/html');
      if(extentionScript.length > 0) extentionScript.splice(0,extentionScript.length);
      Array.from(doc.head.children).forEach(function(item,index){
        extentionScript.push(item);
      });
      if(doc.body.getElementsByClassName(`${pageName}`)[0] != undefined) document.body.innerHTML = doc.body.getElementsByClassName(`${pageName}`)[0].innerHTML;
      else document.body.innerHTML = '';
      return document.body.innerHTML;
    }
    // 동적으로 자바스크립트와 스타일 시트를 받아오는 함수
    this.loadScript = function (pageName,addScript) {
      const target = this.srcType;
      const loadDynamicSrc = this.loadDynamicSrc;
      const convertArrayItemData = this.convertArrayItemData;
      const model = this.compModel;
      let firstLoad = 0;
      this.removeSrc(convertArrayItemData);
      this.loadHtml(pageName).then((html) => {if (html) {
      // 신규 스크립트 및 스타일 시트 동적 로드
      convertArrayItemData(Object.entries(target),function(undefined,idx,script){
        const source = target[script[idx][0]];
        const srcList = [`/${source.pattern}/${source.name}/${pageName}`.concat(source.name,'.',source.pattern)]; // 기본 스크립트를 제외하고 추가로 로드하는 경우를 대비해서 배열로 관리
        let params = [source.pattern,source.element,source.type,source.rel];
        convertArrayItemData(srcList,function(style,idx,undefined){srcList[idx] = Promise.resolve(loadDynamicSrc(params[0],params[1],params[2],params[3],style,((result) => {
          if(result) {
            if(firstLoad == 0){
              firstLoad +=1;
              model.callback();
            } 
            console.log(result);}})));});});}});
    }
    this.loadDynamicSrc = function (pattern, element, type, rel, file, callback) {
        var addNewScript;
        var script;
        if(typeof(file) != 'string') script = file;
        else {
          script = document.createElement(element);
          script.src = pattern == 'js' ? file : undefined;
        }
        script.type = type;
        if (pattern == 'css') { // 스타일시트
            script.rel = rel;
            script.href = file;
            addNewScript = document.getElementsByTagName('script')[0];
            addNewScript.parentNode.insertBefore(script, addNewScript);
        } else { // 스크립트
          script.defer = true;
          addNewScript = document.getElementsByTagName('script')[0];
          addNewScript.parentNode.insertBefore(script, addNewScript);
        }
        script.onload = function () {
            document.head.appendChild(this);
            callback(this);
        };
    }
    this.removeSrc = function(convertArrayItemData){
      // 기존의 스크립트 파일 제거
      convertArrayItemData(document.head.childNodes,
        function(item){
          if(item.localName && item.localName == 'script' 
          && (!item.src.includes('commonModule') && !item.src.includes('commonControl'))){
            document.head.removeChild(item);
          }
      });
      // 기존의 스타일시트 제거
      convertArrayItemData(document.head.childNodes,
        function(item){
          if(item.localName && item.localName == 'link'){
            document.head.removeChild(item);
          }
      });
    }
    this.convertArrayItemData = function(origin, method){ // 반복문 처리 관련 공통 함수
      origin.forEach(function(item,index,array){
        method(item,index,array);
      }); 
    }
  }
  render() {
    this.compModel.getPageName(); //Model의 상태를 가져와서 렌더링
  }
}