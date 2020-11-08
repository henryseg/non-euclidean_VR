/***********************************************************************************************************************
 *
 * @struct Material
 * Material of an object in the scene
 * @todo enrich this structure to handle texture, formula based colors, etc
 *
 **********************************************************************************************************************/
struct Material {
    vec3 color; ///< base color
    float specular; ///< specular reflection constant
    float diffuse; ///< diffuse reflection constant
    float ambient; ///< ambient reflection constant
    float shininess; ///< shininess constant
};


/**
 * Compute the normal to the scene at the point `p`
 * @param[in] p the point at which we hit the scene
 * @param[in] id the specific object that has been hitted
 * @remark Since we know, which object has been hitted, we don't need to use the scenceSDF to estimate the normal.
 * We can directly use the SDF of that object.
 * It is probably faster.
 */
Vector sceneNormal(Point p, int id){}

/**
 * Intensity of the light after travelling a length `len` in the direction `dir`
 * @param[in] dir unit vector at the light position
 * @param[in] len distance from the light
 * @return intensity of the light
 */
float lightIntensity(Vector dir, float len){}

/**
 * Compute the contribution of one direction to the illumination
 * @param[in] v incidence vector
 * @param[in] n normal vector to the object (pointing outside the object)
 * @param[in] dir the direction from on the object to a light
 * @param[in] len the length of the geodesic from `p` directed by `v` to the light
 * @param[in] material material of the object
 * @param[in] lightColor the color of the light
 * @return the contribution the this direction to the illumination.

 * @todo Choose a convention for the incidence vector `v`.
 * Should it point toward the object, or the observer?
 */
vec3 lightComputation(Vector v, Vector n, Vector dir, float len, Material material, vec4 lightColor){}

/**
 * Phong lighting model.
 * Take into account all possible lights and directions
 * @param[in] v incidence vector
 * @param[in] material the material of the object
 * @todo Choose a convention for the incidence vector `v`.
 * Should it point toward the object, or the observer?
 */
vec3 phongModel(Vector v, Material material) {

}