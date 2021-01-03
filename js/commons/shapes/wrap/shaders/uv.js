// language=Mustache + GLSL
export default `//
vec2 {{name}}_uvMap(RelVector v){
    return {{shape.name}}_uvMap(v);
}
`;