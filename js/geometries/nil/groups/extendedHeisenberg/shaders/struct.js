// language=GLSL
export default `//

/***********************************************************************************************************************
 * @struct
 * Group data for a finite extension of the integral Heisenberg group
 **********************************************************************************************************************/

struct Group {
    vec4 translationA;
    vec4 translationB;
    vec4 translationC;
    int root;
    mat4 dotMatrix;
};`;