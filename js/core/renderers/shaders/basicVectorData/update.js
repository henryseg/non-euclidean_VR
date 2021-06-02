// language=Mustache + GLSL
export default `//

void updateVectorDataFromSolid(inout ExtVector v, int objId){
    RelVector normal;
    vec2 uv;
    vec3 color;
    vec3 reflectivity;
    
    switch(objId){
    {{#scene.solids}}
    
        case {{id}}:
        {{#material.isReflecting}}
            
            if(v.data.iBounce == scene.maxBounces){
                reflectivity = vec3(0);
            } 
            else {
                reflectivity = {{material.name}}.reflectivity;
            }
            
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

            {{#scene.fog}}
                color = applyFog(color, v.data.lastBounceDist);
            {{/scene.fog}}

            if(length(reflectivity) == 0.) {
                v.data.stop = true;
            }
            else{
                v.data.stop = false;
            }
            v.data.accColor = v.data.accColor + v.data.leftToComputeColor * (vec3(1) - reflectivity) * color;
            v.data.leftToComputeColor = v.data.leftToComputeColor *  reflectivity;
            v.vector = geomReflect(v.vector,normal);
            v.data.lastBounceDist = 0.;
            v.data.iBounce = v.data.iBounce + 1;
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

            {{#scene.fog}}
                color = applyFog(color, v.data.lastBounceDist);
            {{/scene.fog}}
            v.data.accColor = v.data.accColor + v.data.leftToComputeColor * color;
            v.data.leftToComputeColor = vec3(0);
            v.data.stop = true;
        {{/material.isReflecting}}
    
        break;
    
    {{/scene.solids}}
    }
}

void updateVectorData(inout ExtVector v, int hit, int objId){
    if (hit == HIT_DEBUG) {
        v.data.accColor = debugColor;
        v.data.leftToComputeColor = vec3(0);
        v.data.stop = true;
        return;
    }
    if (hit == HIT_NOTHING) {
        v.data.accColor = v.data.accColor + v.data.leftToComputeColor * scene.background;
        v.data.leftToComputeColor = vec3(0);
        v.data.stop = true;
        return;
    }
    if(hit == HIT_SOLID) {
        updateVectorDataFromSolid(v, objId);
        return;
    }
}

`;