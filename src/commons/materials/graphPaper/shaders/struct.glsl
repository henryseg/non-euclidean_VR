/***********************************************************************************************************************
 * @struct
 * Checkerboard material
 **********************************************************************************************************************/
struct GraphPaperMaterial {
    vec2 dir1;
    vec2 dir2;
    vec3 color1;
    vec3 color2;
};


float gridLines(vec2 uv, float size){
    float brightness = 1./(2.*sqrt(size));
    float gridPattern = abs(sin(3.14*size*uv.x)*sin(1.*3.14*size*uv.y));
    //invert and increase contrast:
    gridPattern = 1.-clamp(pow(gridPattern,0.05),0.,1.);
    return gridPattern*brightness;
}

float grid(vec2 uv){
    float grid1 = gridLines(uv,1.);
    float grid2 = gridLines(uv,5.);
    float grid3 = gridLines(uv,10.);
    float grid4 = gridLines(uv,50.);
    float gridTotal = grid1+grid2+grid3+grid4;
    gridTotal *=5.;
   return gridTotal;
}

vec4 render(GraphPaperMaterial material, ExtVector v, vec2 uv) {
    float x1 = mod(dot(uv, material.dir1), 2.);
    float x2 = mod(dot(uv, material.dir2), 2.);
    float gridPattern = grid(vec2(x1,x2));

    vec3 col1 = material.color1*(1.-gridPattern);
    vec3 col2 = material.color2*gridPattern;
    return vec4(col1+col2,1.);

}

