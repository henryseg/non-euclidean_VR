// language=Mustache + GLSL
export default `//
/**
* Gradient for the complement of a shape
*/
RelVector {{name}}_gradient(RelVector v){
    RelVector gradient = {{shape.name}}_gradient(v);

    float x = v.local.pos.coords.x;
    float y = v.local.pos.coords.y;
    float z = v.local.pos.coords.z;
    vec4 dir = 20. * vec4(
    cos(20. * x) * sin(20. * y) * sin(20. * z),
    sin(20. * x) * cos(20. * y) * sin(20. * z),
    sin(20. * x) * sin(20. * y) * cos(20. * z),
    0
    );
    Vector local = Vector(v.local.pos, n);
    RelVector disp = RelVector(local, v.cellBoost, v.invCellBoost)
    RelVector res = add(gradient, disp);
    return geomNormalize(res);
}
`;