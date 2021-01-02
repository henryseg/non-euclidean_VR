// language=Mustache + GLSL
export default `//
/**
 * Gradient for a wrapping
 */
ExtVector {{name}}_gradient(ExtVector v){
    return {{shape.name}}_gradient(v);
}`;