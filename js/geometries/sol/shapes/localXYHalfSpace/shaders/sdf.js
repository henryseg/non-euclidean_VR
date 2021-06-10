// language=Mustache + GLSL
export default `        
float {{name}}_sdf(RelVector v) {
    return sdf({{name}},v);
}
`;