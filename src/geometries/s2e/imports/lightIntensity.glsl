/**
* Intensity of the light after travelling a length \`len\` in the direction \`dir\`
* @param[in] dir unit vector at the light position
* @param[in] len distance from the light
* @return intensity of the light
*/
float lightIntensity(float len){
    //return 1./(len * len);
    return 1./ len;
}