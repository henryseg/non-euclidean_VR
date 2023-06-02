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
    vec3 color = material.mainColor;
    color += material.accent1 * dir.x;
    color += material.accent2 * dir.y;
    color += material.accent3 * dir.z;

    float x = v.vector.local.pos.coords.x;
    float y = v.vector.local.pos.coords.y;
    float z = v.vector.local.pos.coords.z;

    if(material.grid){
        float test = sin(70.*x)*sin(70.*y)*sin(70.*z);
        float sgn = sign(test);
        if (sgn<0.){
            color *=0.9;
        }
    }

    return vec4(color, 1);
}