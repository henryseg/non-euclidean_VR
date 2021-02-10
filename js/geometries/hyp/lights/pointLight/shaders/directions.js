// language=Mustache + GLSL
export default `
bool {{name}}_directions(RelVector v, int i, out RelVector dir, out float intensity) {
    return directions({{name}}, v, i, dir, intensity);
}
`;