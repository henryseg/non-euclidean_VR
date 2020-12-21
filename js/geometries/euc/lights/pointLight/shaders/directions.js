// language=Mustache + GLSL
export default `
int {{name}}_directions(RelVector v, out RelVector[1] dirs, out float[1] intensities) {
    RelVector dir;
    float intensity;
    int res = directions({{name}}, v, dir, intensity);
    dirs[0] = dir;
    intensities[0] = intensity;
    return res;
}
`;