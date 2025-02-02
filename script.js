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

var model = true;

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
}

// Función de placeholder
function predictWebcam() {}

// Hace visible la sección de demostración
demosSection.classList.remove('invisible');
