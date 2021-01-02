// language=Mustache + GLSL
export default `
bool {{name}}_directions(ExtVector v, int i, out ExtVector dir, out float intensity) {
    return directions({{name}}, v, i, dir, intensity);
}
`;