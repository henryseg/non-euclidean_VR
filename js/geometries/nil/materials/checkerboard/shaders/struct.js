// language=GLSL
export default `//
/***********************************************************************************************************************
 * @struct
 * Checkerboard material
 **********************************************************************************************************************/
struct CheckerboardMaterial {
    vec4 dir1;
    vec4 dir2;
    vec3 color1;
    vec3 color2;
    float ambient;
    float diffuse;
    float specular;
    float shininess;
};

vec3 baseColor(CheckerboardMaterial material, RelVector v) {
    Point pos = applyIsometry(v.cellBoost, v.local.pos);
    float x1 = mod(dot(pos.coords, material.dir1), 2.);
    float x2 = mod(dot(pos.coords, material.dir2), 2.);
    if (x1 < 1. && x2 < 1.){
        return material.color1;
    } else if (x1 >= 1. && x2 >= 1.) {
        return material.color1;
    } else {
        return material.color2;
    }
}

/**
 * Compute the contribution of one direction to the illumination
 * @param[in] v incidence vector
 * @param[in] n normal vector to the object (pointing outside the solid)
 * @param[in] dir the direction from on the object to a light
 * @param[in] material material of the object
 * @param[in] lightColor the color of the light
 * @param[in] intensity the intensity of the light when it hits the solid
 * @return the contribution the this direction to the illumination.
 */
vec3 lightComputation(Vector v, Vector n, Vector dir, vec3 baseColor, CheckerboardMaterial material, vec3 lightColor, float intensity){
    Vector auxV = negate(v);
    Vector auxL = dir;
    Vector auxN = n;
    Vector auxR = geomReflect(negate(auxL), auxN);
    float NdotL = max(geomDot(auxN, auxL), 0.);
    float RdotV = max(geomDot(auxR, auxV), 0.);

    float coeff = material.diffuse * NdotL + material.specular * pow(RdotV, material.shininess);
    coeff = coeff * intensity;
    vec3 res = coeff * (material.ambient * baseColor + lightColor.rgb);
    return res;
}

`;

