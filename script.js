const video = document.getElementById('webcam');
const liveView = document.getElementById('liveView');
const demoSection = document.getElementById('demos');
const enableWebcamButton = document.getElementById('webcamButton');
const listObj = document.getElementById("list-detected-objects");


//  Creamos la variable que almacenará el modelo
var model = undefined;
var objDetected = [];

//  CocoSSD es un ojeto que importamos en un script en el .html
cocoSsd.load()
    .then( function (loadedModel) { //  Usamos .then ya q es asincrona (al esperar hasta que cocoSSD esté cargado)
        model = loadedModel;
        demoSection.classList.remove('invisible');
        document.getElementById('detected-objects').classList.add('visible');
    });

//  Comprueba si el navegador permite el acceso a la camara
function getUserMediaSupported() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

//  Array para almacenar los HTMLElement q utilizaremos para hacer un recuadro alrededor de los objetos detectados en 1 frame del video
var children = [];

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
    if(!model) {
        console.log('Espera hasta que el modelo esté cargado antes de hacer click!!');
        return;
    }

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

// Una vez llamada, se ejecuta automaticamente para predecir el siguiente frame del video (es recursiva)
function predictWebcam() {
    //Comenzamos a utilizar el modelo para clasificar los obj de un frame del video
    model.detect(video) //  le pasamos el video
    .then( function (predictions) { //  Usamos .then ya que es asincrono y tarda unos ms hasta q realiza las predicciones
        //  Eliminamos todos los elementos ya detectados antes de buscar los nuevos
        for (let i = 0; i < children.length; i++) {
            liveView.removeChild(children[i]); //   Elimina todos los hijos del liveView
        }
        children.splice(0); //  Elimina todos los children del array

        // Obtener tamaño y posición reales del video en la pantalla
        const videoRect = video.getBoundingClientRect();

        //  Con el bucle recorremos las predicciones y pintamos el recuadro
        //  para señalar en el liveView los objetos encontrados x el modelo
        for (let n = 0; n < predictions.length; n++) {
            //  Para asegurarnos la veracidad de q si es un objeto, 
            // solo utilizaremos los q tengan un 66% o + de probabilidad de ser objeto
            if (predictions[n].score > 0.66) {

                //Comprobamos si ese obj no está ya en la lista para añadirlo
                if (!objDetected.includes(predictions[n].class)) {
                    //Lo añadimos al array
                    objDetected.push(predictions[n].class);

                    //Pintamos el elemento en la lista
                    const li = document.createElement('li');
                    li.textContent = `${predictions[n].class} - ${Math.round(predictions[n].score * 100)} % de probabilidad`;
                    listObj.appendChild(li);
                }

                //  Creamos una etiqueta p y el % de probabilidad de q sea X objeto segun el modelo
                const p = document.createElement('p');
                p.innerText = predictions[n].class + ' - ' +
                    Math.round(predictions[n].score * 100) + '% de probabilidad';

                // Ajustar posición relativa al video
                p.style = `
                    position: absolute;
                    left: ${videoRect.left + predictions[n].bbox[0]}px;
                    top: ${predictions[n].bbox[1] - 40}px; 
                    width: ${predictions[n].bbox[2]}px;
                `;

                //  Creamos un div para pintar el recuadro con la info y posición q ya tenemos
                const highlighter = document.createElement('div');
                highlighter.classList.add('highlighter');
                highlighter.style = `
                    position: absolute;
                    left: ${videoRect.left + predictions[n].bbox[0]}px;
                    top: ${predictions[n].bbox[1] - 30}px;
                    width: ${predictions[n].bbox[2] + 8}px;
                    height: ${predictions[n].bbox[3]}px;
                `;

                //  los añadimos a la vista
                liveView.appendChild(highlighter);
                liveView.appendChild(p);

                //  y en el array de hijos
                children.push(highlighter);
                children.push(p);
            }
        }

        //  Llamamos otra vez a la propia funcion para q sea recursiva
        window.requestAnimationFrame(predictWebcam);
    });
}