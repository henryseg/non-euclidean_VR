// language=Mustache + GLSL
export default `//
vec2 {{name}}_uvMap(ExtVector v){
    return {{shape.name}}_uvMap(v);
}
`;