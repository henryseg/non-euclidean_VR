// language=Mustache + GLSL
export default `//
/**
 * UV Map for the intersection of two shapes
 */
vec2 {{name}}_uvMap(ExtVector v){
    float dist1 = {{shape1.name}}_sdf(v);
    float dist2 = {{shape2.name}}_sdf(v);
    if(dist1 < dist2){
        return {{shape1.name}}_uvMap(v);
    } else{
        return {{shape2.name}}_uvMap(v);
    }
}`;