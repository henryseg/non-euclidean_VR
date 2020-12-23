// language=Mustache + GLSL
export default `//
/**
 * SDF for the union of two shapes
 */
RelVector {{name}}_gradient(RelVector v){
    return negate({{shape.name}}_gradient(v));
}`;