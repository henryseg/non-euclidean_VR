// language=GLSL
export default `//

/***********************************************************************************************************************
 * @struct
 * Group data for a free abelian group
 **********************************************************************************************************************/

struct Group {
    vec4 halfTranslationA;
    vec4 halfTranslationB;
    vec4 halfTranslationC;
    float halfLengthSqA;
    float halfLengthSqB;
    float halfLengthSqC;
};`;