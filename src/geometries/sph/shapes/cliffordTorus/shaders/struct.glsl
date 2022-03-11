/***********************************************************************************************************************
 * @struct
 * Shape of a Clifford torus
 **********************************************************************************************************************/

struct CliffordTorusShape {
    int id;
};

/**
 * Distance function
 */
float sdf(CliffordTorusShape torus, RelVector v) {
    Vector vec = applyGroupElement(v.cellBoost, v.local);
    vec4 p = vec.pos.coords;
    float aux = length(p.xy) + length(p.zw);
    float sign = sign(p.z * p.z + p.w * p.w - 0.5);
    return sign * acos(aux / sqrt(2.));
}

/**
 * Gradient field
 */
RelVector gradient(CliffordTorusShape torus, RelVector v){
    Vector vec = applyGroupElement(v.cellBoost, v.local);
    vec4 p = vec.pos.coords;
    float denXY = length(p.xy);
    float denZW = length(p.zw);
    vec4 aux = vec4(p.xy / denXY, p.zw / denZW) / sqrt(2.);
    vec4 dir = aux - dot(aux,p) * p;
    Vector local = Vector(vec.pos, dir);
    local = applyGroupElement(v.invCellBoost, local);
    local = negate(local);
    local = geomNormalize(local);
    return RelVector(local, v.cellBoost, v.invCellBoost);
}
//
//vec2 uvMap(CliffordTorusShape torus, RelVector v){
//    Point pos = applyGroupElement(v.cellBoost, v.local.pos);
//    Vector direction = direction(ball.center, pos);
//    direction = applyIsometry(ball.absoluteIsomInv, direction);
//    vec4 dir = normalize(direction.dir);
//    float sinPhi = length(dir.xy);
//    float cosPhi = dir.z;
//    float uCoord = -atan(dir.y, dir.x);
//    float vCoord = atan(sinPhi, cosPhi);
//    return vec2(uCoord, vCoord);
//}
