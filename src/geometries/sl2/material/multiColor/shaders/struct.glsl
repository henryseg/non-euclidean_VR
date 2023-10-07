/***********************************************************************************************************************
 * Multi-Color Material
 **********************************************************************************************************************/

struct MultiColorMaterial {
    vec3 mainColor;
    vec3 accent1;
    vec3 accent2;
    vec3 accent3;
    bool grid;
};

vec4 render(MultiColorMaterial material, ExtVector v) {
    vec4 coords = toVec4(v.vector.local.pos);
    vec3 dir = normalize(coords.xyw);
    vec3 color = material.mainColor;
    color += material.accent1 * dir.x;
    color += material.accent2 * dir.y;
    color += material.accent3 * dir.z;

    float rDist = acosh(hypLength(v.vector.local.pos.coords));
    float theta = atan(dir.y,dir.x);
    float height = coords.w;

    if(material.grid){
        float test = sin(70.*rDist)*sin(70.*theta)*sin(70.*height);
        float sgn = sign(test);
        if (sgn<0.){
            color *=0.9;
        }
    }

    return vec4(color, 1);
}