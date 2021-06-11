// language=Mustache + GLSL
export default `//

/**
 * We assume that we are inside a solid
 */
void nextObjectProperties(RelVector normal, out float ior, out vec3 absorb, out bool isInside){
    float dist;
    ior = {{scene.ptBackground.name}}.ior; // index of the "air"
    absorb = {{scene.ptBackground.name}}.absorb; // absorb of the "air"
    isInside = false;
    
    RelVector v = flow(normal, 2. * camera.threshold);
    {{#scene.solids}}
        if({{name}}.isRendered){
            dist = {{shape.name}}_sdf(v);
            if(dist < camera.threshold) {
                ior = {{ptMaterial.name}}.ior;
                absorb = {{ptMaterial.name}}.absorb;
                isInside = true;
                return;
            }
        }
    {{/scene.solids}}
}

`;