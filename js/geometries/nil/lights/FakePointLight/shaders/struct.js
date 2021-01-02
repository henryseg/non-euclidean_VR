// language=GLSL
export default `//
/***********************************************************************************************************************
 * @struct
 * Nil fake point light
 **********************************************************************************************************************/

struct FakePointLight {
    int id;
    Point position;
    vec3 color;
    int maxDirs;
};

bool directions(FakePointLight light, ExtVector v, int i, out ExtVector dir, out float intensity) {
    if(i!=0){
        return false;
    }
    Point position = applyIsometry(v.invCellBoost, light.position);
    
    float fakeDistance = fakeDistance(position, v.local.pos);
    intensity = 1. / fakeDistance;
    
    Isometry pull = makeInvTranslation(v.local.pos);
    vec4 aux = position.coords - v.local.pos.coords;
    aux = pull.matrix * aux;
    Vector local = Vector(v.local.pos, aux);
    local = geomNormalize(local);
    dir = ExtVector(local, v.cellBoost, v.invCellBoost);
    return true;
}
`;