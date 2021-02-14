// language=Mustache + GLSL
export default `//
/***********************************************************************************************************************
 ***********************************************************************************************************************
 * 
 * Defines the scene SDF and scene Material computations used during the ray-marching and lightening.
 *
 ***********************************************************************************************************************
 **********************************************************************************************************************/

/**
 * Distance along the geodesic directed by \`v\` to the closest object in the local scene
 * @param[in] v the direction to follows
 * @param[out] hit say if we hit an object (1), nothing (0) or if there is a bug (-1)
 * @param[out] objId the ID of the solid we hit.
 */
float _localSceneSDF(RelVector v, out int hit, out int objId){
    hit = HIT_NOTHING;
    float res = camera.maxDist;
    float dist;
    
    {{#scene.solids}}
        {{#isLocal}}
            if({{name}}.isRendered){
                dist = {{shape.name}}_sdf(v);
                if(abs(dist) < camera.threshold) {
                hit = HIT_SOLID;
                objId = {{id}};
                return dist;
                }
                res = min(res, dist);
            }
        {{/isLocal}}
    {{/scene.solids}}
    
    return res;
}

/**
* Distance along the geodesic directed by \`v\` to the closest object in the local scene
* When nearest neighbor is on, the representatiion of v can be updated 
* so that the local vector is in a neighbor of the fundamental domain.
* This is used to compute correctly the normal / uv map of a local object.
* @param[in] v the direction to follows
* @param[out] hit say if we hit an object (1), nothing (0) or if there is a bug (-1)
* @param[out] objId the ID of the solid we hit.
*/
float localSceneSDF(inout RelVector v, out int hit, out int objId){
    float res, dist;
    dist = _localSceneSDF(v, hit, objId);
    if(hit == HIT_SOLID) {
        return dist;
    }
    res = dist;
    
    {{#set.usesNearestNeighbors}}
        RelVector aux = v;
        
        {{#set.neighbors}}
                aux = rewrite(v, {{elt.name}}, {{inv.name}});
                dist = _localSceneSDF(aux, hit, objId);
                if(hit == HIT_SOLID) {
                    v = aux;
                    return dist;
                }
                res = min(res, dist);
                
        {{/set.neighbors}}
        
        return res;
    {{/set.usesNearestNeighbors}}

    {{^set.usesNearestNeighbors}}
        return res;
    {{/set.usesNearestNeighbors}}
}


/**
 * Distance along the geodesic directed by \`v\` to the closest object in the global scene
 * @param[in] v the direction to follows
 * @param[out] hit say if we hit an object (1), nothing (0) or if there is a bug (-1)
 * @param[out] objID the ID of the solid we hit.
 */
float globalSceneSDF(RelVector v, out int hit, out int objId){
    hit = HIT_NOTHING;
    float res = camera.maxDist;
    float dist;
    
    {{#scene.solids}}
        {{#isGlobal}}
            if({{name}}.isRendered){
                dist = {{shape.name}}_sdf(v);
                if(abs(dist) < camera.threshold) {
                hit = HIT_SOLID;
                objId = {{id}};
                return dist;
                }
                res = min(res, dist);
            }
        {{/isGlobal}}
    {{/scene.solids}}
    
    return res;
}

/**
 * Color Data of the hit solid.
 * If the solid is reflecting, reflect the vector v.
 * @param[in] v the vector at which we hit the object
 * @param[in] objId the id of the object that we hit
 */
ColorData getSolidColorData(inout ExtVector v, int objId) {
    RelVector normal;
    vec2 uv;
    vec3 color;
    bool isReflecting = false;
    vec3 reflectivity = vec3(0);

    switch(objId){
        {{#scene.solids}}
        
            case {{id}}:
                {{#material.isReflecting}}
                    isReflecting = true;
                    reflectivity = {{material.name}}.reflectivity;
                    normal = {{shape.name}}_gradient(v.vector);
                    
                    {{^material.usesNormal}}                    
                        {{^material.usesUVMap}}
                            color =  {{material.name}}_render(v.vector);               
                        {{/material.usesUVMap}}
                        {{#material.usesUVMap}}
                            uv = {{shape.name}}_uvMap(v.vector);
                            color = {{material.name}}_render(v.vector, uv);
                        {{/material.usesUVMap}}    
                    {{/material.usesNormal}}
                                
                    {{#material.usesNormal}}
                        {{^material.usesUVMap}}                    
                            color = {{material.name}}_render(v.vector, normal);
                        {{/material.usesUVMap}}
                        {{#material.usesUVMap}}
                            uv = {{shape.name}}_uvMap(v.vector);
                            color = {{material.name}}_render(v.vector, normal, uv);
                        {{/material.usesUVMap}}                    
                    {{/material.usesNormal}}
                    
                    v.vector = geomReflect(v.vector,normal);
                    v.travelledDist = 0.;
                    v = flow(v, 1.2 * camera.threshold);
                    
                {{/material.isReflecting}}     
                
                {{^material.isReflecting}}
                    {{^material.usesNormal}}                    
                        {{^material.usesUVMap}}
                            color =  {{material.name}}_render(v.vector);             
                        {{/material.usesUVMap}}
                        {{#material.usesUVMap}}
                            uv = {{shape.name}}_uvMap(v.vector);
                            color = {{material.name}}_render(v.vector, uv);
                        {{/material.usesUVMap}}    
                    {{/material.usesNormal}}
                                
                    {{#material.usesNormal}}
                        {{^material.usesUVMap}}                        
                            normal = {{shape.name}}_gradient(v.vector);
                            color = {{material.name}}_render(v.vector, normal);
                        {{/material.usesUVMap}}
                        {{#material.usesUVMap}}
                            normal = {{shape.name}}_gradient(v.vector);
                            uv = {{shape.name}}_uvMap(v.vector);
                            color = {{material.name}}_render(v.vector, normal, uv);
                        {{/material.usesUVMap}}                    
                    {{/material.usesNormal}}
                {{/material.isReflecting}}         
            
                break;
            
        {{/scene.solids}}
        
            default:
                // this line should never be achieved
                color = vec3(0,0,0);
    }

    {{#scene.fog}}
        color = applyFog(color, v.travelledDist);
    {{/scene.fog}}

    return ColorData(color, isReflecting, reflectivity);
}
`;