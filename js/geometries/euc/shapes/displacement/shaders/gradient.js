// language=Mustache + GLSL
export default `//
/**
* Gradient for the complement of a shape
*/
RelVector {{name}}_gradient(RelVector v){
    RelVector gradient = {{shape.name}}_gradient(v);
    vec4 dir = 
    Vector local = Vector(v.local.pos, n);
    RelVector disp = RelVector(local, v.cellBoost, v.invCellBoost)
    RelVector res = add(gradient, disp);
    return geomNormalize(res);
}
`;