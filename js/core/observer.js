export class Observer {
  constructor() {
    this._observers = new Set();
    // 감지 옵션 (감지할 변경)
    this.config = { attributes: true, childList: true, subtree: true };
  }
  subscribe(observer) {
    this._observers.add(observer);
  }
  notify() {
    this._observers.forEach((observer) => observer());
  }
  getChange(){
    // 변경 감지 시 실행할 콜백 함수
    return (mutationList, observer) => {
      for (const mutation of mutationList) {
        if (mutation.type === "childList") {
          if(mutation.addedNodes.length > 0){
            const nodes = mutation.addedNodes;
            nodes.forEach((node,index,nodes)=>{
              console.log(node);
              // if(node.outerHTML && node.id) {
              //   const elementId = node.id;
              //   const map = {'&': '&amp;','<': '&lt;','>': '&gt;','"': '&quot;',"'": '&#039;'};
              //   if(__valueObject && __valueObject.hasOwnProperty(pageName)) __valueObject[pageName][elementId] = node.outerHTML.replace(/[&<>"']/g, function(m) { return map[m]; });
              // }
            });
          }
        } else if (mutation.type === "attributes") {
          console.log(`${mutation.attributeName} 특성이 변경됐습니다.`);
        }
      }
    };
  }
}