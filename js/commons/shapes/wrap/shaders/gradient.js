// language=Mustache + GLSL
export default `//
/**
 * Gradient for a wrapping
 */
RelVector {{name}}_gradient(RelVector v){
    return {{shape.name}}_gradient(v);
}`;