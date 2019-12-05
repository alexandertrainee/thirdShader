attribute vec2 a_position;

uniform vec2 u_resolution;

void main(){
    
    vec2 zeroToOne = a_position / u_resolution;

    vec2 zeroToTwo = zeroToOne * 2.0;

    vec2 clipspace = zeroToTwo - 1.0;

    gl_Position = vec4(clipspace * vec2(1, -1), 0, 1);
}
