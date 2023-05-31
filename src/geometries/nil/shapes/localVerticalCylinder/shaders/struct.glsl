/***********************************************************************************************************************
 * @struct
 * Vertical cylinder going through the given point
 **********************************************************************************************************************/

struct LocalVerticalCylinderShape {
    float radius;
    Point pos;
};

float sdf(LocalVerticalCylinderShape cyl, RelVector v) {
    vec2 diff = v.local.pos.coords.xy - cyl.pos.coords.xy;
    return length(diff) - cyl.radius;
}

RelVector gradient(LocalVerticalCylinderShape cyl, RelVector v) {
    vec2 diff = v.local.pos.coords.xy - cyl.pos.coords.xy;
    vec4 dir = vec4(diff, 0, 0);
    Vector local = Vector(v.local.pos, dir);
    return RelVector(local, v.cellBoost, v.invCellBoost);

}

vec2 uvMap(LocalVerticalCylinderShape cyl, RelVector v) {
    vec2 dir = v.local.pos.coords.xy - cyl.pos.coords.xy;
    float height = v.local.pos.coords.z;
    return vec2(atan(dir.y,dir.x),height);
}