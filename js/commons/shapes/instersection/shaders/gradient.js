// language=Mustache + GLSL
export default `//
/**
 * Gradient for the intersection of two shapes
 */
ExtVector {{name}}_gradient(ExtVector v){
    float dist1 = {{shape1.name}}_sdf(v);
    float dist2 = {{shape2.name}}_sdf(v);
    if(dist1 > dist2){
        return {{shape1.name}}_gradient(v);
    } else{
        return {{shape2.name}}_gradient(v);
    }
}`;