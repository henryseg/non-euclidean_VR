// language=Mustache + GLSL
export default `//
/**
 * SDF for a wrapping
 */
float {{name}}_sdf(RelVector v){
    float wrap = {{wrap.name}}_sdf(v);
    if(wrap > camera.threshold){
        return wrap;
    } else {
        return {{shape.name}}_sdf(v);
    }
}`;