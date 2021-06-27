// language=Mustache + GLSL
export default `//
VectorData initVectorData(){
    return VectorData(0., 0., 0., false, 0, 0, false, vec3(0), vec3(1), {{scene.ptBackground.name}}.absorb, {{scene.ptBackground.name}}.volumeEmission, {{scene.ptBackground.name}}.opticalDepth, false);
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
    float hackCoeff = 1.;
    float r; /** ratio of IOR */
    float nextIOR; /** IOR of the neighbor solid */
    vec3 nextAbsorb; /** absorb of the neighbor solid */
    vec3 nextEmission;/** volumetric emission of the neighbor solid */
    float nextOpticalDepth;/** optical depth of the neighbor solid */
    bool nextIsInside = true;

    RelVector diffuseDir;
    RelVector reflectDir;
    RelVector refractDir;

    // get a uniformly distributed vector on the sphere
    RelVector random = randomVector(v.vector);





    //get volumetric coloring:
    //portion of light is absorbed.
    vec3 volAbsorb = exp((-v.data.currentAbsorb) * v.data.lastBounceDist);
    
    //light is emitted along the journey (linear or expoenential pickup)
    vec3 volEmit = v.data.currentEmission * v.data.lastBounceDist;
    //vec3 volEmit = exp(v.data.currentEmission * v.data.lastBounceDist)-vec3(1);

    //use these quantities to update pixel and light:
    v.data.light = v.data.light * volAbsorb;
    v.data.pixel = v.data.pixel + v.data.light*volEmit;
    v.data.light = v.data.light + volEmit;//the absorbtion doesn't distort the light output
    






switch(objId){
    {{#scene.solids}}
    
        case {{id}}:
            normal = {{shape.name}}_gradient(v.vector);
            normal = geomNormalize(normal);

            
            // get info and reset normal based on which side we are on.
            // starting assumption: in the "air"
            r = {{scene.ptBackground.name}}.ior / {{ptMaterial.name}}.ior;
            nextAbsorb = {{ptMaterial.name}}.absorb;
            nextEmission = {{ptMaterial.name}}.volumeEmission;
            nextOpticalDepth = {{ptMaterial.name}}.opticalDepth;
        
            if(v.data.isInside){
                //things to change if we are inside a material instead:
                nextObjectProperties(normal, nextIOR, nextAbsorb,nextEmission, nextOpticalDepth,nextIsInside);
                r = {{ptMaterial.name}}.ior / nextIOR;
                normal = negate(normal);
            }
        
            rayType = {{ptMaterial.name}}_setRayType(v, normal,r);
        
            {{^ptMaterial.usesUVMap}}
                color =  {{ptMaterial.name}}_render(v, normal, rayType);
            {{/ptMaterial.usesUVMap}}
            {{#ptMaterial.usesUVMap}}
                uv = {{shape.name}}_uvMap(v.vector);
                color = {{ptMaterial.name}}_render(v, normal, uv, rayType);
            {{/ptMaterial.usesUVMap}}
        
        
        // hack to make sure that lights are not too bright
            if(v.data.iBounce == 0){
                hackCoeff = 0.2;
            }
        
            //apply surface effects
            v.data.pixel = v.data.pixel + hackCoeff * v.data.light * {{ptMaterial.name}}.emission;
            if(!rayType.refract){
                v.data.light = v.data.light * color / max(rayType.chance, 0.0001);
             }
        
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
               // reflectDir = geomNormalize(geomMix(reflectDir, diffuseDir, {{ptMaterial.name}}.roughness * {{ptMaterial.name}}.roughness));
                v.vector = reflectDir;
            }
        
            if(rayType.refract){
                    refractDir = geomRefract(v.vector,normal, r);
                    // rough (glossy) specular lerps from the smooth specular to the rough diffuse by the material roughness squared
                    refractDir = geomNormalize(geomMix(refractDir, diffuseDir, {{ptMaterial.name}}.roughness * {{ptMaterial.name}}.roughness));
                    v.data.isInside = nextIsInside;
                    v.data.currentAbsorb = nextAbsorb;
                    v.data.currentEmission = nextEmission;
                    v.data.currentOpticalDepth = nextOpticalDepth;
                    v.vector = refractDir;
            }
            break;
    
    {{/scene.solids}}
    }

    v.data.lastBounceDist = 0.;
    v.data.iBounce = v.data.iBounce + 1;
    // be carefull, v is not normal to the surface
    // if the time we flow is too small, we are still below the camera threshold
    float t = 20. * camera.threshold / abs(geomDot(v.vector, normal));
    v = flow(v, t);
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