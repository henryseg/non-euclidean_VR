// language=Mustache + GLSL
export default `        
float {{name}}_sdf(ExtVector v) {
    return sdf({{name}},v);
}
`;
