function loadResources(url){
    return new Promise((resolve, reject) =>{
        let request = new XMLHttpRequest();
        request.open("GET", url, true);
        request.onload = () =>{
            if (request.status >= 200 && request.status < 300){
                resolve(request.responseText);
            } else {
                reject("Invalid htttp status" + request.status);
            }
        }
        request.send();
    })
}

function initWebgl(){
    let vertexShaderSource;
    let fragmentShaderSource;
    loadResources("../shaders/vertexShader.glsl").then(result =>{
        vertexShaderSource = result;
        console.log(vertexShaderSource);
        return loadResources("../shaders/fragmentShader.glsl")
    }).then(result => {
        fragmentShaderSource = result;
        console.log(fragmentShaderSource);
        return main(vertexShaderSource, fragmentShaderSource);
    }).catch(error =>{
        return new Error("some error happened" + error);
    })
}

function createShader(gl, type, source){
    let shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);

    if(success){
        console.log(shader)
        return shader;
    }

    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return new Error("shader has been not created");
}

function createProgram(gl, vertexShader, fragmentShader){
    let program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.validateProgram(program);
    
    let success = gl.getProgramParameter(program, gl.VALIDATE_STATUS);

    if(success){
        console.log(program);
        return program;
    }

    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return new Error("program has been not created")
}

function main(vertexShaderS, fragmentShaderS){

    let canvas = document.getElementById("canvas");
    let gl = canvas.getContext("webgl2");

    if(!gl){
        return new Error("gl does not loaded");
    } else {
        console.log("gl has been loaded");
    }

    let vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderS);
    let fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderS);

    let program = createProgram(gl, vertexShader, fragmentShader);

    let positionLocation = gl.getAttribLocation(program, "a_position");
    let colorLocation = gl.getUniformLocation(program, "u_color");
    let resolutionLocation = gl.getUniformLocation(program, "u_resolution");

    let positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.enableVertexAttribArray(positionLocation);

    var translation = [0, 0];
    var width = 100;
    var height = 100;
    var color = [Math.random(), Math.random(), Math.random(), 0.7];

    drawScene();

    webglLessonsUI.setupSlider("#x", {slide: updatePosition(0), max: gl.canvas.width });
    webglLessonsUI.setupSlider("#y", {slide: updatePosition(1), max: gl.canvas.height});

    function updatePosition(index) {
        return function(event, ui) {
          translation[index] = ui.value;
          drawScene();
        };
      }

      function drawScene() {
        webglUtils.resizeCanvasToDisplaySize(gl.canvas);
   
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(program);
    
        setRectangle(gl, translation[0], translation[1], width, height);
       
        var size = 2;         
        var type = gl.FLOAT;  
        var normalize = false; 
        var stride = 0;        
        var offset = 0;        
        gl.vertexAttribPointer(positionLocation, size, type, normalize, stride, offset);
   
        gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);

        gl.uniform4fv(colorLocation, color);
        
        gl.drawArrays(gl.TRIANGLES, 0 , 6);
    }
}

function setRectangle(gl, x, y, width, height) {
    var x1 = x;
    var x2 = x + width;
    var y1 = y;
    var y2 = y + height;
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([
            x1, y1,
            x2, y1,
            x1, y2,
            x1, y2,
            x2, y1,
            x2, y2,
        ]),
        gl.STATIC_DRAW);
  }

document.addEventListener("DOMContentLoaded", () =>{
    initWebgl();
})

