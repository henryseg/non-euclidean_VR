/***********************************************************************************************************************
 * Normal Material
 * No need of a structure for this material.
 * However there is a function, to factorize the code
 **********************************************************************************************************************/

vec3 normalMaterialRender(ExtVector v, RelVector normal) {
    Vector[3] f;
    Point pos = applyGroupElement(v.vector.cellBoost, v.vector.local.pos);
    frame(pos, f);

    f[0] = applyGroupElement(v.vector.invCellBoost, f[0]);
    f[1] = applyGroupElement(v.vector.invCellBoost, f[1]);
    f[2] = applyGroupElement(v.vector.invCellBoost, f[2]);
    
//    Vector[3] f;
//    frame(v.local.pos, f);
    float r =  geomDot(normal.local, f[0]);
    float g =  geomDot(normal.local, f[1]);
    float b =  geomDot(normal.local, f[2]);
    return abs(vec3(r, g, b));
}