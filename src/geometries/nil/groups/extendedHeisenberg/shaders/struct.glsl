/***********************************************************************************************************************
 * @struct
 * Group data for a finite extension of the integral Heisenberg group
 **********************************************************************************************************************/

struct Group {
    vec4 translationA;
    vec4 translationB;
    vec4 translationC;
    vec4 testTranslationA;
    vec4 testTranslationB;
    vec4 testTranslationC;
    int root;
};