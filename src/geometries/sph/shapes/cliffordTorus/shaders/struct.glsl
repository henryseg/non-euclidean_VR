/***********************************************************************************************************************
 * @struct
 * Shape of a Clifford torus
 **********************************************************************************************************************/

struct CliffordTorusShape {
    int id;
    Isometry absoluteIsomInv;
    Isometry absoluteIsom;
};

/**
 * Distance function
 */
float sdf(CliffordTorusShape torus, RelVector v) {
    Point point = applyGroupElement(v.cellBoost, v.local.pos);
    point = applyIsometry(torus.absoluteIsomInv, point);
    vec4 p = point.coords;
    float aux = length(p.xy) + length(p.zw);
    float sign = sign(p.z * p.z + p.w * p.w - 0.5);
    return sign * acos(aux / sqrt(2.));
}

/**
 * Gradient field
 */
RelVector gradient(CliffordTorusShape torus, RelVector v){
    Point point = applyGroupElement(v.cellBoost, v.local.pos);
    point = applyIsometry(torus.absoluteIsomInv, point);
    vec4 p = point.coords;
    float lenXY = length(p.xy);
    float lenZW = length(p.zw);
    vec4 aux = vec4(p.xy / lenXY, p.zw / lenZW) / sqrt(2.);
    vec4 dir = aux - dot(aux, p) * p;
    Vector local = Vector(point, dir);
    local = applyIsometry(torus.absoluteIsom, local);
    local = applyGroupElement(v.invCellBoost, local);
    local = geomNormalize(local);
    return RelVector(local, v.cellBoost, v.invCellBoost);
}

/**
 * UV coordinates
 */
vec2 uvMap(CliffordTorusShape torus, RelVector v){
    Point point = applyGroupElement(v.cellBoost, v.local.pos);
    point = applyIsometry(torus.absoluteIsomInv, point);
    vec4 p = point.coords;
    float uCoord = atan(p.y, p.x);
    float vCoord = atan(p.w, p.z);
    return vec2(uCoord, vCoord);
}
