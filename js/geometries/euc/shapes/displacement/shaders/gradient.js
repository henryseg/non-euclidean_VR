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
    vec4 dir = 0.05 * 30. * vec4(
    cos(30. * x) * sin(30. * y) * sin(30. * z),
    sin(30. * x) * cos(30. * y) * sin(30. * z),
    sin(30. * x) * sin(30. * y) * cos(30. * z),
    0
    );
    Vector local = Vector(v.local.pos, dir);
    RelVector disp = RelVector(local, v.cellBoost, v.invCellBoost);
    RelVector res = add(gradient, disp);
    return geomNormalize(res);
}
`;