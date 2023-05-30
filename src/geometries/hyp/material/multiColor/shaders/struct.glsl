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

    vec3 dir = normalize(v.vector.local.pos.coords.xyz);
    float height = acosh(v.vector.local.pos.coords.w);

    float cosphi = dir.z;
    float sinphi = length(dir.xy);
    float phi = atan(sinphi,cosphi);
    float theta = atan(dir.y,dir.x);

    vec3 color = material.mainColor;
    color += material.accent1 * dir.x;
    color += material.accent2 * dir.y;
    color += material.accent3 * dir.z;

    if(material.grid){
        float test = sin(70.*phi)*sin(70.*theta)*sin(70.*height);
        float sgn = sign(test);
        if (sgn<0.){
            color *=0.9;
        }
    }

    return vec4(color, 1);
}