var ctrl_1 = new commonControl('test1');
/*
동적으로 페이지 로드하는 과정에서 사용한 페이지 컨트롤 객체를 복제 후 삭제 하는 로직
*/
ctrl_1.copyCommonPageControl(ctrl_1);
ctrl_1.loadExtentionScript(function(result){
    Promise.resolve(createElement(result)).then(function(backbone){
        if(backbone != undefined) console.debug(backbone);
    });
},extModuleList.prod);

function createElement(_result){
    var regExp = /backbone/gi;
    if(_result.src.match(regExp)){
        var backboneSync = Backbone.sync;
        
        var post = Backbone.Model.extend(); 
        var collection = Backbone.Collection.extend({ 
            model: post, 
            type : 'POST',
            //url: 'https://jsonplaceholder.typicode.com/users', 
            url: 'https://chroniclingamerica.loc.gov/search/titles/results/?terms=oakland&format=json&page=5',
            xhrFields: {
                withCredentials: true
            },
            sync: function (method, model, options) {
                options || (options = {});
                
                // Lets notify backbone to use our URLs and do follow default course
                return Backbone.sync.apply(this, arguments);
            }
        }); 

        // Backbone.sync = _.wrap(Backbone.sync, function(sync, method, model, options) {
        //     if (!options.xhrFields) {
        //         options.xhrFields = {withCredentials:true};
        //     }
        //     options.headers = options.headers || {};
        //     options.headers['method'] = 'POST';
        //     options.headers['mode'] = 'cors';
        //     options.headers['cache'] = 'no-cache';
        //     options.headers['credentials'] = 'same-origin';
        //     options.headers['method'] = 'POST';
        //     options.headers['Accept'] = 'application/json';
        //     options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        //     options.headers['redirect'] = 'follow';
        //     options.headers['referrerPolicy'] = 'no-referrer';
        
        //     sync(method, model, options);
        // });
        var posts = new collection(); 
        posts.fetch(); 
        console.log(posts) 
    };
};