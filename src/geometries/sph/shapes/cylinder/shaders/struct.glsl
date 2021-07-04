/***********************************************************************************************************************
 * @struct
 * Shape of a cylinder in spherical geometry
 **********************************************************************************************************************/

struct CylinderShape {
    int id;
    Vector direction;
    float radius;
    vec4 uvTestX;
    vec4 uvTestY;
};

/**
 * Signed distance function
 */
float sdf(CylinderShape cyl, RelVector v) {
    Vector dir = applyGroupElement(v.invCellBoost, cyl.direction);
    float aux1 = dot(v.local.pos.coords, dir.pos.coords);
    float aux2 = dot(v.local.pos.coords, dir.dir);
    return acos(sqrt(aux1 * aux1 + aux2 * aux2)) - cyl.radius;
}

/**
 * Gradient field for a global hyperbolic ball
 */
RelVector gradient(CylinderShape cyl, RelVector v){
    vec4 m = v.local.pos.coords;
    Vector dir = applyGroupElement(v.invCellBoost, cyl.direction);
    float aux1 = dot(m, dir.pos.coords);
    float aux2 = dot(m, dir.dir);
    vec4 coords = aux1 * dir.pos.coords + aux2 * dir.dir;
    Point proj = Point(coords);
    Vector local = direction(v.local.pos, proj);
    local = negate(local);
    return RelVector(local, v.cellBoost, v.invCellBoost);
}

vec2 uvMap(CylinderShape cyl, RelVector v){
    vec4 m = v.local.pos.coords;
    Vector dir = applyGroupElement(v.invCellBoost, cyl.direction);
    float aux1 = dot(m, dir.pos.coords);
    float aux2 = dot(m, dir.dir);
    vec4 proj = aux1 * dir.pos.coords + aux2 * dir.dir;
    float uCoord = acos(dot(normalize(proj), dir.pos.coords));

    // rotate the point m, so that its orthogonal projection onto the geodisic (carrying the cylinder) is direction.pos
    vec4 aux = m - proj + length(proj) * dir.pos.coords;
    float vCoord = atan(dot(aux, cyl.uvTestY), dot(aux, cyl.uvTestX));

    return vec2(uCoord, vCoord);
}
