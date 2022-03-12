/***********************************************************************************************************************
 * @struct
 * Shape of a cylinder in spherical geometry
 **********************************************************************************************************************/

struct CircleShape {
    int id;
    float radius;
    vec4 c;
    Isometry absoluteIsomInv;
    Isometry absoluteIsom;
};

/**
 * Signed distance function
 */
float sdf(CircleShape circle, RelVector v) {
    Point point = applyGroupElement(v.cellBoost, v.local.pos);
    point = applyIsometry(circle.absoluteIsomInv, point);
    vec4 p = point.coords;
    float aux = circle.c.x * length(p.xy) + dot(circle.c.zw, p.zw);
    return acos(aux) - circle.radius;
}

/**
 * Gradient field
 */
RelVector gradient(CircleShape circle, RelVector v){
    Point point = applyGroupElement(v.cellBoost, v.local.pos);
    point = applyIsometry(circle.absoluteIsomInv, point);
    vec4 p = point.coords;
    float lenXY = length(p.xy);
    vec4 aux = vec4(circle.c.x * p. x / lenXY, circle.c.y * p.y / lenXY, circle.c.z, circle.c.w);
    vec4 dir = aux - dot(aux, p) * p;
    Vector local = Vector(point, dir);
    local = applyIsometry(circle.absoluteIsom, local);
    local = applyGroupElement(v.invCellBoost, local);
    local = geomNormalize(local);
    return RelVector(local, v.cellBoost, v.invCellBoost);
}

/**
 * UV coordinates
 * Not exactly clear for the v-coordinates, but is sould give somenthing
 */
vec2 uvMap(CircleShape circle, RelVector v){
    Point point = applyGroupElement(v.cellBoost, v.local.pos);
    point = applyIsometry(circle.absoluteIsomInv, point);
    vec4 p = point.coords;
    float lenXY = length(p.xy);
    vec4 proj = vec4(circle.c.x * p.x / lenXY, circle.c.y * p.y / lenXY, circle.c.z, circle.c.w);
    float uCoord = atan(proj.y, proj.x);
    vec4 dir2p = p - proj - dot(p-proj, proj) * proj;
    dir2p = normalize(dir2p);
    float vCoord = atan(dir2p.w, dir2p.z);

    return vec2(uCoord, vCoord);
}
