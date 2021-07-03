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
    Vector direction = applyGroupElement(v.invCellBoost, cyl.direction);
    float aux1 = dot(v.local.pos.coords, direction.pos.coords);
    float aux2 = dot(v.local.pos.coords, direction.dir);
    return acos(sqrt(aux1 * aux1 + aux2 * aux2)) - cyl.radius;
}

/**
 * Gradient field for a global hyperbolic ball
 */
RelVector gradient(CylinderShape cyl, RelVector v){
    vec4 m = v.local.pos.coords;
    Vector direction = applyGroupElement(v.invCellBoost, cyl.direction);
    float aux1 = dot(m, direction.pos.coords);
    float aux2 = dot(m, direction.dir);
    vec4 proj = aux1 * direction.pos.coords + aux2 * direction.dir;
    vec4 dir = m - proj;
    dir = dir - dot(m, dir) * m;
    Vector local = Vector(v.local.pos, normalize(dir));
    return RelVector(local, v.cellBoost, v.invCellBoost);
}

vec2 uvMap(CylinderShape cyl, RelVector v){
    vec4 m = v.local.pos.coords;
    Vector direction = applyGroupElement(v.invCellBoost, cyl.direction);
    float aux1 = dot(m, direction.pos.coords);
    float aux2 = dot(m, direction.dir);
    vec4 proj = aux1 * direction.pos.coords + aux2 * direction.dir;
    float uCoord = acos(dot(normalize(proj), direction.pos.coords));

    // rotate the point m, so that its orthogonal projection onto the geodisic (carrying the cylinder) is direction.pos
    vec4 aux = m - proj + length(proj) * direction.pos.coords;
    float vCoord = atan(dot(aux, cyl.uvTestY), dot(aux, cyl.uvTestX));

    return vec2(uCoord, vCoord);
}
