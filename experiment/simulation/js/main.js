window.Module = {
onRuntimeInitialized() {
document.getElementById("statusText").textContent="Ready";
document.getElementById("statusDot").style.background="#22c55e";
initApp();
}
};

function initApp(){

const mainCanvas=document.getElementById("mainCanvas");
const templateCanvas=document.getElementById("templateCanvas");
const resultCanvas=document.getElementById("resultCanvas");
const corrCanvas=document.getElementById("corrCanvas");

const mainInput=document.getElementById("mainInput");
const templateInput=document.getElementById("templateInput");
const methodSelect=document.getElementById("methodSelect");

let mainGray=null;
let templateGray=null;

function setProcessing(){
document.getElementById("statusText").textContent="Processing...";
document.getElementById("statusDot").style.background="#ef4444";
}
function setReady(){
document.getElementById("statusText").textContent="Ready";
document.getElementById("statusDot").style.background="#22c55e";
}

function loadImage(input, canvas, callback){
let img=new Image();
img.onload=()=>{
canvas.width=img.width;
canvas.height=img.height;
canvas.getContext("2d").drawImage(img,0,0);
canvas.style.width="100%";
canvas.style.height="auto";
let mat=cv.imread(canvas);
let gray=new cv.Mat();
cv.cvtColor(mat,gray,cv.COLOR_RGBA2GRAY);
mat.delete();
callback(gray);
};
img.src=URL.createObjectURL(input.files[0]);
}

mainInput.addEventListener("change",()=>{
loadImage(mainInput, mainCanvas, g=>{mainGray=g;});
});

templateInput.addEventListener("change",()=>{
loadImage(templateInput, templateCanvas, g=>{templateGray=g;});
});

document.getElementById("runBtn").onclick=()=>{

document.getElementById("infoMsg").textContent="";
if(!mainGray || !templateGray) return;

// Auto-resize template if too large
if(templateGray.rows >= mainGray.rows || templateGray.cols >= mainGray.cols){

let scale = Math.min(
(mainGray.rows - 1) / templateGray.rows,
(mainGray.cols - 1) / templateGray.cols
);

let newSize = new cv.Size(
Math.floor(templateGray.cols * scale),
Math.floor(templateGray.rows * scale)
);

let resized = new cv.Mat();
cv.resize(templateGray, resized, newSize, 0, 0, cv.INTER_AREA);
templateGray.delete();
templateGray = resized;

templateCanvas.width = newSize.width;
templateCanvas.height = newSize.height;
templateCanvas.style.width="100%";
templateCanvas.style.height="auto";

let rgba = new cv.Mat();
cv.cvtColor(templateGray, rgba, cv.COLOR_GRAY2RGBA);
cv.imshow(templateCanvas, rgba);
rgba.delete();

document.getElementById("infoMsg").textContent="Template auto-resized to fit main image.";
}

setProcessing();

let result=new cv.Mat();
let method=parseInt(methodSelect.value);

cv.matchTemplate(mainGray,templateGray,result,method);
let minMax=cv.minMaxLoc(result);

let matchLoc;
if(method===0 || method===1){
matchLoc=minMax.minLoc;
document.getElementById("scoreVal").textContent=minMax.minVal.toFixed(4);
}else{
matchLoc=minMax.maxLoc;
document.getElementById("scoreVal").textContent=minMax.maxVal.toFixed(4);
}

document.getElementById("locVal").textContent=`(${matchLoc.x}, ${matchLoc.y})`;

// Resize result canvas
resultCanvas.width=mainCanvas.width;
resultCanvas.height=mainCanvas.height;
resultCanvas.style.width="100%";
resultCanvas.style.height="auto";

// Resize correlation canvas
corrCanvas.width=result.cols;
corrCanvas.height=result.rows;
corrCanvas.style.width="100%";
corrCanvas.style.height="auto";

// Draw bounding box (FIXED VERSION)
let display=new cv.Mat();
cv.cvtColor(mainGray,display,cv.COLOR_GRAY2RGBA);

let pt1 = new cv.Point(matchLoc.x, matchLoc.y);
let pt2 = new cv.Point(
    matchLoc.x + templateGray.cols,
    matchLoc.y + templateGray.rows
);

cv.rectangle(display, pt1, pt2, new cv.Scalar(255,0,0,255), 2);
cv.imshow(resultCanvas,display);

// Correlation heatmap
let normResult=new cv.Mat();
cv.normalize(result,normResult,0,255,cv.NORM_MINMAX);
normResult.convertTo(normResult,cv.CV_8U);

let heat=new cv.Mat();
cv.applyColorMap(normResult,heat,cv.COLORMAP_JET);
cv.imshow(corrCanvas,heat);

display.delete();
result.delete();
normResult.delete();
heat.delete();

setReady();
};

}
