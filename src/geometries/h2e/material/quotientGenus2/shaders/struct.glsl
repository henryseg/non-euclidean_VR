/***********************************************************************************************************************
 * Varying Color Material
 **********************************************************************************************************************/

struct QuotientGenus2Material {
    vec3 mainColor0;
    vec3 mainColor2;
    vec3 mainColor1;
    vec3 mainColor3;
    vec3 mainColor4;
    vec3 mainColor5;
    vec3 weight;
};

//vec4 render(QuotientGenus2Material material, ExtVector v) {
//
//    ivec2 fp = v.vector.cellBoost.finitePart;
//    int index = fp.x + 3 * (fp.y + 1) / 2;
//    vec3 mainColor = vec3(0.9 * float(index)) / 6.;
//    vec3 color = mainColor + 0.2 * abs(vec3(v.vector.local.pos.coords.xy, 0));
//    return vec4(color, 1);
//}
vec4 render(QuotientGenus2Material material, ExtVector v) {
    vec3 mainColor = material.mainColor0;
    ivec2 fp = v.vector.cellBoost.finitePart;
    int index = fp.x + 3 * (fp.y + 1) / 2;
    if (index == 1) {
        mainColor = material.mainColor1;
    }
    if (index == 2) {
        mainColor = material.mainColor2;
    }
    if (index == 3) {
        mainColor = material.mainColor3;
    }
    if (index == 4) {
        mainColor = material.mainColor4;
    }
    if (index == 5) {
        mainColor = material.mainColor5;
    }
    vec3 color = mainColor + material.weight * v.vector.local.pos.coords.xyw;
    return vec4(color, 1);
}