
const camObj = new WebCamControObject();

// 모달
const modal = document.querySelector('.modal');
// 캔버스 (마스킹)
const masking = document.getElementById("masking");
const maskingCtx = masking.getContext('2d');

// 캔버스 (웹캠 미러링)
const mirrored = document.getElementById("mirrored");
const mirroredCtx = mirrored.getContext('2d',{ willReadFrequently: true });
// 비디오 (웹캠)
const video = document.querySelector("#videoElement");
video.poster = camObj.videoPoster;
video.width = 300;
video.height = 200;
// 비디오 상태
const videoStatus = document.getElementById('videoStatus');
videoStatus.innerHTML = `VIDEO STATUS [${camObj.statusArr[camObj.statusIndex]}]`;
// 전방/후방 카메라
const frontCam = false; 
// 모바일 기종 정규식
let constraints = {'video': true};
const detectMobileDevice = (function(agent) {
    let mobileRegex = [/Android/i,/iPhone/i,/iPad/i,/iPod/i,/BlackBerry/i,/Windows Phone/i];
    if (mobileRegex.some(mobile => agent.match(mobile))) {
        console.log('current device is mobile');
        constraints = frontCam ? {video: { facingMode: "user" }} : {video: { facingMode: "environment" }};        
    } else {
        console.log('current device is not mobile')
    }
    navigator.mediaDevices.getUserMedia(constraints)
    .then((track)=>{
        let {width, height} = track.getTracks()[0].getSettings();
        scale = masking.width / width;
        console.log(scale);
        console.log(`${width}x${height}`);
        track.getVideoTracks()[0].stop();
    });
})(window.navigator.userAgent);

const screenCapture = document.getElementById('screenCapture');
const adjust = document.getElementById('adjust');
let setImage = null;
adjust.addEventListener("click", () => {
    if(setImage != null) {
        $('#onDilaog').remove();
        $('#setImage')[0].src = setImage;
        $('#setImage').attr('class','');
        $("#miniView").dialog('close');
    }
});

let camApp = null;
let drawImage = false;
let image = new Image();
let posterImg = video.poster;
let localstream;
let area;
let blurArea = [];

// mirrored.addEventListener("click", () => {openCamera(mirrored);});
// modal.addEventListener("click", () => {openCamera(modal);});

screenCapture.addEventListener("click",()=>{
    if(camObj.useTimeOutOption && camObj.useTimeOutOption.timeOut){
        new Promise(checkCapture).then((result)=>{
            phantomClick = true;
            screenCapture.click();
        });
    }
    else{
        sendData();
    }
});

let scale = 0;

function openCamera(canvas) {
    
    if(canvas.id != 'maskingModal'){
        if(camApp == null){
            camApp = new App();
        } 
        else{
            drawImage = !drawImage;
            if(!drawImage) camApp = new App();
        }
    }
}

const draw = function (t) {
    image.onload = function () {
        //mirroredCtx.drawImage(image, 0, 0, mirrored.width, mirrored.height);
        masking.width =300;
        masking.height = 200;
        drawMaskingArea(camObj.items);
    };
    image.src = posterImg;
}
function drawMaskingArea(items){ 
    
    // 마스킹 캔버스 초기화
    maskingCtx.clearRect(0, 0, masking.width, masking.height);
    maskingCtx.beginPath();

    if(items){
        // 마스킹 캔버스 다시 그리기
        items.map((item)=>{
            for (const [key, value] of Object.entries(item)) {
                if(key == "area"){
                    area = item[key];
                    area.x = area.x * scale;
                    area.y = area.y * scale;
                    area.width = area.width * scale;
                    area.height = area.height * scale;
                    maskingCtx.fillStyle = area.fillStyle;
                    maskingCtx.strokeStyle = area.strokeStyle;
                    maskingCtx.lineWidth = area.strokeLineWidth;
                    maskingCtx.strokeRect(area.x, area.y, area.width, area.height);
                }
                else{
                    const regex = [/dataset_/i];
                    // key 값이 dataset_ 으로 시작하는 정규식 검사
                    if (regex.some(isDataset => key.match(isDataset))){
                        var dataset = item[key];
                        dataset.x = dataset.x * scale;
                        dataset.y = dataset.y * scale;
                        dataset.width = dataset.width * scale;
                        dataset.height = dataset.height * scale;
                        maskingCtx.fillRect(dataset.x, dataset.y, dataset.width, dataset.height);
                        blurArea.push({x:dataset.x,y:dataset.y,w:dataset.width,h:dataset.height});
                    }
                }
            }
        });
        openCamera(mirrored);
    }
    // 모달 창 숨기기
    camObj.statusIndex = 0;
    modal.style.display = camObj.modalHide();
}

const sendData = function(result){
    if(camObj.statusIndex == 0){
        resetVideo = false;
        drawImage = false;
        video.width = 300;
        video.height = 200;
        mirrored.width = video.width;
        mirrored.height = video.height;
        mirroredCtx.clearRect(0, 0, mirrored.width, mirrored.height);
        mirroredCtx.beginPath();
        maskingCtx.clearRect(0, 0, masking.width, masking.height);
        maskingCtx.beginPath();
        $('#screenCapture span').html('촬영');
        camApp = new App();
        scale = 1;
    }
    else {
        captureImage();
        $('#screenCapture span').html('다시찍기');
        //
    }

}

const mosaic = function(imageData){	
	let mosaicXY = {x:5, y:5};
	for(var x = 0, w = imageData.width; x < w; x=x+mosaicXY.x) {
		for(var y = 0, h =  imageData.height; y < h; y=y+mosaicXY.y) {
			let pixIndex = (y * w + x) * 4;
			let r = imageData.data[pixIndex];
			let g = imageData.data[pixIndex + 1];
			let b = imageData.data[pixIndex + 2];
			let a = imageData.data[pixIndex + 3];
			
			for(xx = x; xx < x+mosaicXY.x && xx < w;++xx){
				for( yy = y; yy < y+mosaicXY.y && yy < h; ++yy){
					let pixIndex2 = (yy * w + xx) * 4;
					imageData.data[pixIndex2] = r;
					imageData.data[pixIndex2 + 1] = g;
					imageData.data[pixIndex2 + 2] = b;
					imageData.data[pixIndex2 + 3] = a;
				}
			}
		}
	}
	return imageData;
};

const checkCapture = function(resolve){
    if(camObj.useTimeOutOption && camObj.useTimeOutOption.timeOut){
        let count = camObj.useTimeOutOption.interval;
        if(count == camObj.useTimeOutOption.interval){
            const itv = setInterval(() => {
                if(count > 0){
                    count --;
                    if(count == 28){
                        console.log(`제한시간 내 촬영 ${count}`);
                        clearInterval(itv);
                        return resolve();
                    }
                }
                else{
                    alert('시간 초과');
                    drawImage = !drawImage;
                    if(!drawImage) camApp = new App();
                    drawMaskingArea(camObj.items);
                    clearInterval(itv);
                }
            }, 1000);
        }
    }
}
let resetVideo = false;
const captureImage = function(){
    let pos_x = (mirrored.width - masking.width)/2;
    let pos_y = (mirrored.height - masking.height)/2;
    let drawWidth = masking.width;
    let drawHeighth = masking.height;

    if(blurArea.length > 0){
        let tempArea;
        for(var msk of blurArea){
            tempArea = mirroredCtx.getImageData(pos_x + msk.x,pos_y + msk.y, msk.w, msk.h);
            maskingCtx.clearRect(0, 0, masking.width, masking.height);
            maskingCtx.beginPath();
            mirroredCtx.putImageData(mosaic(tempArea), pos_x + msk.x , pos_y + msk.y);
        }
    }
    let cropCanvas = document.createElement('canvas');
    cropCanvas.setAttribute("id", "cropCanvas");
    let cropCtx = cropCanvas.getContext('2d');
    let cropImg = mirroredCtx.getImageData(pos_x, pos_y,drawWidth,drawHeighth);
    
    cropCanvas.width = cropImg.width;
    cropCanvas.height = cropImg.height;
    cropCtx.putImageData(cropImg, 0, 0);

    drawImage = !drawImage;
    var img = new Image;
    img.onload = function(){
        maskingCtx.drawImage(img,0,0);
        mirroredCtx.fillStyle = "white";
        mirroredCtx.fillRect(0, 0, mirrored.width, mirrored.height);
        masking.style.opacity = 1;
        resetVideo = true;
        videoStatus.innerHTML = "";
    };
    img.src = cropCanvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    setImage = img.src;    
    cropCanvas.remove();
}

class App {
    constructor() {
        
        if(!drawImage){
            navigator.mediaDevices.getUserMedia(constraints)
            .then( (stream) => { // function 의 this와 화살표 함수의 this 가 다름
                video.srcObject = stream;
                localstream = stream;
                
                // 자동 포커스
                var track = stream.getVideoTracks()[0];
                if(track != null){
                    track.getSettings();
                    const capabilities = track.getCapabilities();
                    if (capabilities.focusMode){
                        track.applyConstraints({advanced : [{focusMode: "continuous"}]});
                    }
                    video.width = capabilities.width.max;
                    video.height = capabilities.height.max;
                }

                if(camObj.statusIndex == 0) camObj.statusIndex = 1;
                var status = camObj.statusArr[camObj.statusIndex];
                modal.style.display= camObj.modalHide();
                videoStatus.innerHTML = `VIDEO STATUS [${status}]`;
             })
            .catch(function (error) {
                console.log("Something went wrong!");
                alert(error);
                return;
            });
        }
        video.addEventListener( "loadedmetadata", () => {
            if(!resetVideo){
                window.requestAnimationFrame(this.draw.bind(this));
                video.play();
            }
        });
    }
    draw(t) {
        if(!drawImage){
            window.requestAnimationFrame(this.draw.bind(this));
            mirroredCtx.scale(1,1);
            mirroredCtx.drawImage(video, 0, 0, mirrored.width, mirrored.height); 
        }else{
            video.pause();
            video.src = "";
            localstream.getTracks()[0].stop();
            mirroredCtx.drawImage(image, 0, 0, mirrored.width, mirrored.height);
            if(camObj.statusIndex !=0) camObj.statusIndex =0;
            var status = camObj.statusArr[camObj.statusIndex];
            videoStatus.innerHTML = `VIDEO STATUS [${status}]`;
            
        }
    }
}