// language=GLSL
export default `//
/***********************************************************************************************************************
 ***********************************************************************************************************************
 *
 * Definition of the scene : sdf, gradients, materials, etc
 *
 ***********************************************************************************************************************
 **********************************************************************************************************************/




/***********************************************************************************************************************
 *
 * @struct
 * Structure used to package color data on materials
 *
 **********************************************************************************************************************/

struct ColorData {
    vec3 color;/**< the computed color of a point on a solid (inclucing fog) */
    bool isReflecting; /**< true if the material is reflecting */
    vec3 reflectivity;/**< the reflectivity (for each color chanel) at this point */
};

`;
