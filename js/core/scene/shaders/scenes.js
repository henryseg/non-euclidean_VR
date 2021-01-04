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
float localSceneSDF(RelVector v, out int hit, out int objId){
    hit = HIT_NOTHING;
    float res = camera.maxDist;
    float dist;
    
    {{#solids}}
        {{#isLocal}}
            dist = {{shape.name}}_sdf(v);
            if(abs(dist) < camera.threshold) {
            hit = HIT_SOLID;
            objId = {{id}};
            return dist;
            }
            res = min(res, dist);
        {{/isLocal}}
    {{/solids}}
    
    return res;
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
    
    {{#solids}}
        {{#isGlobal}}
            dist = {{shape.name}}_sdf(v);
            if(abs(dist) < camera.threshold) {
            hit = HIT_SOLID;
            objId = {{id}};
            return dist;
            }
            res = min(res, dist);
        {{/isGlobal}}
    {{/solids}}
    
    return res;
}

/**
 * Color Data of the hit solid.
 * If the solid is reflecting, reflect the vector v.
 * @param[in] v the vector at which we hit the object
 * @param[in] objId the id of the object that we hit
 */
ColorData getSolidColorData(inout RelVector v, float travelledDist, int objId) {
    RelVector normal;
    vec2 uv;
    vec3 color;
    bool isReflecting = false;
    vec3 reflectivity = vec3(0);

    switch(objId){
        {{#solids}}
            
            case {{id}}:
                {{#material.isReflecting}}
                    isReflecting = true;
                    reflectivity = {{material.name}}.reflectivity;
                    normal = {{shape.name}}_gradient(v);
                    
                    {{^material.usesNormal}}                    
                        {{^material.usesUVMap}}
                            color =  {{material.name}}_render(v);               
                        {{/material.usesUVMap}}
                        {{#material.usesUVMap}}
                            uv = {{shape.name}}_uvMap(v);
                            color = {{material.name}}_render(v, uv);
                        {{/material.usesUVMap}}    
                    {{/material.usesNormal}}
                                
                    {{#material.usesNormal}}
                        {{^material.usesUVMap}}                    
                            color = {{material.name}}_render(v, normal);
                        {{/material.usesUVMap}}
                        {{#material.usesUVMap}}
                            uv = {{shape.name}}_uvMap(v);
                            color = {{material.name}}_render(v, normal, uv);
                        {{/material.usesUVMap}}                    
                    {{/material.usesNormal}}
                    
                    v = geomReflect(v,normal);
                    v = flow(v, 1.2 * camera.threshold);
                    
                {{/material.isReflecting}}     
                
                {{^material.isReflecting}}
                    {{^material.usesNormal}}                    
                        {{^material.usesUVMap}}
                            color =  {{material.name}}_render(v);             
                        {{/material.usesUVMap}}
                        {{#material.usesUVMap}}
                            uv = {{shape.name}}_uvMap(v);
                            color = {{material.name}}_render(v, uv);
                        {{/material.usesUVMap}}    
                    {{/material.usesNormal}}
                                
                    {{#material.usesNormal}}
                        {{^material.usesUVMap}}                        
                            normal = {{shape.name}}_gradient(v);
                            color = {{material.name}}_render(v, normal);
                        {{/material.usesUVMap}}
                        {{#material.usesUVMap}}
                            normal = {{shape.name}}_gradient(v);
                            uv = {{shape.name}}_uvMap(v);
                            color = {{material.name}}_render(v, normal, uv);
                        {{/material.usesUVMap}}                    
                    {{/material.usesNormal}}
                {{/material.isReflecting}}         
            
                break;
            
        {{/solids}}
        
            default:
                // this line should never be achieved
                color = vec3(0,0,0);
    }

    {{#fog}}
        color = applyFog(color, travelledDist);
    {{/fog}}

    return ColorData(color, isReflecting, reflectivity);
}
`;