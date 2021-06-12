// language=Mustache + GLSL
export default `//

/**
 * We assume that we are inside a solid
 */
void nextObjectProperties(RelVector normal, out float ior, out vec3 absorb,out vec3 emission, out bool isInside){
    float dist;
    ior = {{scene.ptBackground.name}}.ior; // index of the "air"
    absorb = {{scene.ptBackground.name}}.absorb; // absorb of the "air"
    emission=vec3(0,0,0);//no emission from 'air'
    isInside = false;
    
    RelVector v = flow(normal, 2. * camera.threshold);
    {{#scene.solids}}
        if({{name}}.isRendered){
            dist = {{shape.name}}_sdf(v);
            if(dist < camera.threshold) {
                ior = {{ptMaterial.name}}.ior;
                absorb = {{ptMaterial.name}}.absorb;
                emission = {{ptMaterial.name}}.volumeEmission;
                isInside = true;
                return;
            }
        }
    {{/scene.solids}}
}

`;