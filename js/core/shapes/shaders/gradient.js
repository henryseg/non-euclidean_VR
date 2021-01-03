// language=Mustache + GLSL
export default `//
RelVector {{name}}_gradient(RelVector v){
    float newEp = 0.001;
    
    RelVector shiftPX = smallShift(v, vec3(newEp, 0, 0));
    RelVector shiftPY = smallShift(v, vec3(0, newEp, 0));
    RelVector shiftPZ = smallShift(v, vec3(0, 0, newEp));
    RelVector shiftMX = smallShift(v, vec3(-newEp, 0, 0));
    RelVector shiftMY = smallShift(v, vec3(0, -newEp, 0));
    RelVector shiftMZ = smallShift(v, vec3(0, 0, -newEp));
    
    float vgx = {{name}}_sdf(shiftPX) - {{name}}_sdf(shiftMX);
    float vgy = {{name}}_sdf(shiftPY) - {{name}}_sdf(shiftMY);
    float vgz = {{name}}_sdf(shiftPZ) - {{name}}_sdf(shiftMZ);
    RelVector n = createVector(v, vec3(vgx, vgy, vgz));
    
    n = geomNormalize(n);
    return n;
}
`;