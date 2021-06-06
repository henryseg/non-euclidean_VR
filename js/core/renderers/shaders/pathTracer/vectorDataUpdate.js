// language=Mustache + GLSL
export default `//
VectorData initVectorData(){
    return VectorData(0., 0., 0., false, 0, 0, false, vec3(0), vec3(1), {{scene.ptBackground.name}}.absorb);
}



void roulette(inout ExtVector v){
    // as the light left gets smaller, the ray is more likely to get terminated early.
    // survivors have their value boosted to make up for fewer samples being in the average.
    float p = max(v.data.light.r, max(v.data.light.g, v.data.light.b));
    if (randomFloat() > p){
        v.data.stop = true;
    }
    // add the energy we 'lose' by randomly terminating paths
    v.data.light = v.data.light / p;
    
}

void updateVectorDataFromSolid(inout ExtVector v, int objId){
    RelVector normal;
    RayType rayType;
    vec2 uv;
    vec3 color;
    vec3 reflectivity;

    RelVector diffuseDir;
    RelVector reflectDir;
    RelVector refractDir;

    // get a uniformly distributed vector on the sphere
    RelVector random = randomVector(v.vector);
    
    switch(objId){
    {{#scene.solids}}
    
        case {{id}}:
            normal = {{shape.name}}_gradient(v.vector);
            rayType = {{ptMaterial.name}}_setRayType(v, normal);
        
            {{^ptMaterial.usesUVMap}}
                color =  {{ptMaterial.name}}_render(v, rayType);
            {{/ptMaterial.usesUVMap}}
            {{#ptMaterial.usesUVMap}}
                uv = {{shape.name}}_uvMap(v.vector);
                color = {{ptMaterial.name}}_render(v, uv, rayType);
            {{/ptMaterial.usesUVMap}}
        
            v.data.pixel = v.data.pixel + v.data.light * {{ptMaterial.name}}.emission;
            v.data.light = v.data.light * color / max(rayType.chance, 0.0001);
            // apply fog
            v.data.light = v.data.light * exp( -v.data.absorb * v.data.lastBounceDist);
        
            // update the ray direction
            // diffuse uses a normal oriented cosine weighted hemisphere sample.
            diffuseDir = geomNormalize(add(normal, random));
        
            if(rayType.diffuse){
                v.vector = diffuseDir;
            }
        
            if(rayType.reflect){
                // perfectly smooth specular uses the reflection ray.
                reflectDir = geomReflect(v.vector, normal);
        
                // rough (glossy) specular lerps from the smooth specular to the rough diffuse by the material roughness squared
                reflectDir = geomNormalize(geomMix(reflectDir, diffuseDir, {{ptMaterial.name}}.roughness * {{ptMaterial.name}}.roughness));
                v.vector = reflectDir;
            }
        
            if(rayType.refract){
                // perfectly smooth specular uses the reflection ray.
                // todo : compute correctly the ratio of IOR
                refractDir = geomRefract(v.vector, normal, 1.);
        
                // rough (glossy) specular lerps from the smooth specular to the rough diffuse by the material roughness squared
                // refractDir = geomNormalize(geomMix(refractDir, diffuseDir, {{ptMaterial.name}}.roughness * {{ptMaterial.name}}.roughness));
                v.vector = refractDir;
                // TODO update the following data for v : IOR, inside/outside flag,  absorb 
            }
        
            // normally we never reach this point
            break;
    
    {{/scene.solids}}
    }

    v.data.lastBounceDist = 0.;
    v.data.iBounce = v.data.iBounce + 1;
    // be carefull, v is not normal to the surface
    // if the time we flow is too small, we are still below the camera threshold
    v = flow(v, 10. * camera.threshold);
   
    
}

void updateVectorData(inout ExtVector v, int hit, int objId){
    if (hit == HIT_DEBUG) {
        v.data.pixel = debugColor;
        v.data.stop = true;
        return;
    }
    if (hit == HIT_NOTHING) {
        vec3 bgColor = {{scene.ptBackground.name}}.diffuse;
        v.data.pixel = v.data.pixel + v.data.light * bgColor;
        v.data.stop = true;
        return;
    }
    if(hit == HIT_SOLID) {
        updateVectorDataFromSolid(v, objId);
        roulette(v);
        return;
    }
}

`;