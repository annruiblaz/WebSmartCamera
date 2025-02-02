const video = document.getElementById('webcam');
const liveView = document.getElementById('liveView');
const demoSection = document.getElementById('demos');
const enableWebcamButton = document.getElementById('webcamButton');

//  Comprueba si el navegador permite el acceso a la camara
function getUserMediaSupported() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

//  En el caso de que si soporte el acceso a camara, añade un event listener 
//  al btn para cuando el user quiere activar la camara
if (getUserMediaSupported()) {
    enableWebcamButton.addEventListener('click', enableCam);
} else {
    console.warn('getUserMedia no es compatible con el navegador');
}

//  Activa la webcam y comienza a buscar objetos(?)
function enableCam(event) {
    //  Sale de la función si no está cargado COCO-SSD
    if(!model) return;

    //  Oculta el btn una vez hace click
    event.target.classList.add('removed');

    //  Creamos obj con los parametos q queremos d getUserMedia para traer el video (pero no el audio, q si no lo recoge xdefecto)
    const constrainsts = {
        video: true
    };

    //  Activa la vista de la webcam
    navigator.mediaDevices.getUserMedia(constrainsts).
        then( function(stream) {    //  Usamos .then xq es asincrono
            video.srcObject = stream;
            video.addEventListener('loadeddata', predictWebcam);//  Necesario para evitar "bugs" xq el asignar el stream tarda un tiempo
        });

    function predictWebcam() {

    }


    // Store the resulting model in the global scope of our app.
    var model = undefined;

    // Before we can use COCO-SSD class we must wait for it to finish
    // loading. Machine Learning models can be large and take a moment 
    // to get everything needed to run.
    // Note: cocoSsd is an external object loaded from our index.html
    // script tag import so ignore any warning in Glitch.
    cocoSsd.load().then(function (loadedModel) {
    model = loadedModel;
    // Show demo section now model is ready to use.
    demosSection.classList.remove('invisible');
    });

    var children = [];

    function predictWebcam() {
    // Now let's start classifying a frame in the stream.
    model.detect(video).then(function (predictions) {
        // Remove any highlighting we did previous frame.
        for (let i = 0; i < children.length; i++) {
        liveView.removeChild(children[i]);
        }
        children.splice(0);
        
        // Now lets loop through predictions and draw them to the live view if
        // they have a high confidence score.
        for (let n = 0; n < predictions.length; n++) {
        // If we are over 66% sure we are sure we classified it right, draw it!
        if (predictions[n].score > 0.66) {
            const p = document.createElement('p');
            p.innerText = predictions[n].class  + ' - with ' 
                + Math.round(parseFloat(predictions[n].score) * 100) 
                + '% confidence.';
            p.style = 'margin-left: ' + predictions[n].bbox[0] + 'px; margin-top: '
                + (predictions[n].bbox[1] - 10) + 'px; width: ' 
                + (predictions[n].bbox[2] - 10) + 'px; top: 0; left: 0;';

            const highlighter = document.createElement('div');
            highlighter.setAttribute('class', 'highlighter');
            highlighter.style = 'left: ' + predictions[n].bbox[0] + 'px; top: '
                + predictions[n].bbox[1] + 'px; width: ' 
                + predictions[n].bbox[2] + 'px; height: '
                + predictions[n].bbox[3] + 'px;';

            liveView.appendChild(highlighter);
            liveView.appendChild(p);
            children.push(highlighter);
            children.push(p);
        }
        }
        
        // Call this function again to keep predicting when the browser is ready.
        window.requestAnimationFrame(predictWebcam);
    });
    }

}