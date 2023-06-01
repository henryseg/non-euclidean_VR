/***********************************************************************************************************************
 * @struct
 * Vertical cylinder going through the given point
 **********************************************************************************************************************/

struct VerticalCylinderShape {
    float radius;
    Point pos;
};

float sdf(VerticalCylinderShape cyl, RelVector v) {
    Isometry invCellBoost = toIsometry(v.invCellBoost);
    Point pos = applyGroupElement(v.invCellBoost, cyl.pos);
    vec2 diff = v.local.pos.coords.xy - pos.coords.xy;
    return length(diff) - cyl.radius;
}

RelVector gradient(VerticalCylinderShape cyl, RelVector v) {
    Isometry invCellBoost = toIsometry(v.invCellBoost);
    Point pos = applyGroupElement(v.invCellBoost, cyl.pos);
    vec2 diff = v.local.pos.coords.xy - pos.coords.xy;
    vec4 dir = vec4(diff, 0, 0);
    Vector local = Vector(v.local.pos, dir);
    return RelVector(local, v.cellBoost, v.invCellBoost);

}

vec2 uvMap(VerticalCylinderShape cyl, RelVector v) {
    Point p = applyGroupElement(v.cellBoost, v.local.pos);
    vec2 dir = p.coords.xy - cyl.pos.coords.xy;
    float height = p.coords.z;
    return vec2(atan(dir.y,dir.x),height);
}