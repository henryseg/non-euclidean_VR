// language=Mustache + GLSL
export default `//
/**
 * Gradient for the complement of a shape
 */
ExtVector {{name}}_gradient(ExtVector v){
    return negate({{shape.name}}_gradient(v));
}`;