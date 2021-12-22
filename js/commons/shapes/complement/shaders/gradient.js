// language=Mustache + GLSL
export default `//
/**
 * Gradient for the complement of a shape
 */
RelVector {{name}}_gradient(RelVector v){
    return negate({{shape.name}}_gradient(v));
}

`;