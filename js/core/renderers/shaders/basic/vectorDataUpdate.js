// language=Mustache + GLSL
export default `//

VectorData initVectorData(){
    return VectorData(0., 0., 0., false, 0, 0, false, vec3(0), vec3(1));
}


void updateVectorDataFromSolid(inout ExtVector v, int objId){
    RelVector normal;
    vec2 uv;
    vec3 color;
    vec3 reflectivity;
    
    switch(objId){
    {{#scene.solids}}
    
        case {{id}}:
        {{#material.isReflecting}}
            
            if(v.data.iBounce == maxBounces){
                reflectivity = vec3(0);
            } 
            else {
                reflectivity = {{material.name}}.reflectivity;
            }
            
            normal = {{shape.name}}_gradient(v.vector);
            // in general the gradient is not necessarily a unit vector
            normal = geomNormalize(normal);
    
            {{^material.usesNormal}}
                {{^material.usesUVMap}}
                    color =  {{material.name}}_render(v);
                {{/material.usesUVMap}}
                {{#material.usesUVMap}}
                    uv = {{shape.name}}_uvMap(v.vector);
                    color = {{material.name}}_render(v, uv);
                {{/material.usesUVMap}}
            {{/material.usesNormal}}
    
            {{#material.usesNormal}}
                {{^material.usesUVMap}}
                    color = {{material.name}}_render(v, normal);
                {{/material.usesUVMap}}
                {{#material.usesUVMap}}
                    uv = {{shape.name}}_uvMap(v.vector);
                    color = {{material.name}}_render(v, normal, uv);
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
            v.data.pixel = v.data.pixel + v.data.leftToComputeColor * (vec3(1) - reflectivity) * color;
            v.data.leftToComputeColor = v.data.leftToComputeColor *  reflectivity;
            v.vector = geomReflect(v.vector,normal);
            v.data.lastBounceDist = 0.;
            v.data.iBounce = v.data.iBounce + 1;
            v = flow(v, 1.2 * camera.threshold);
    
        {{/material.isReflecting}}
    
        {{^material.isReflecting}}
            {{^material.usesNormal}}
                {{^material.usesUVMap}}
                    color =  {{material.name}}_render(v);
                {{/material.usesUVMap}}
                {{#material.usesUVMap}}
                    uv = {{shape.name}}_uvMap(v.vector);
                    color = {{material.name}}_render(v, uv);
                {{/material.usesUVMap}}
            {{/material.usesNormal}}
    
            {{#material.usesNormal}}
                {{^material.usesUVMap}}
                    normal = {{shape.name}}_gradient(v.vector);
                    color = {{material.name}}_render(v, normal);
                {{/material.usesUVMap}}
                {{#material.usesUVMap}}
                    normal = {{shape.name}}_gradient(v.vector);
                    uv = {{shape.name}}_uvMap(v.vector);
                    color = {{material.name}}_render(v, normal, uv);
                {{/material.usesUVMap}}
            {{/material.usesNormal}}

            {{#scene.fog}}
                color = applyFog(color, v.data.lastBounceDist);
            {{/scene.fog}}
            v.data.pixel = v.data.pixel + v.data.leftToComputeColor * color;
            v.data.leftToComputeColor = vec3(0);
            v.data.stop = true;
        {{/material.isReflecting}}
    
        break;
    
    {{/scene.solids}}
    }
}

void updateVectorData(inout ExtVector v, int hit, int objId){
    if (hit == HIT_DEBUG) {
        v.data.pixel = debugColor;
        v.data.leftToComputeColor = vec3(0);
        v.data.stop = true;
        return;
    }
    if (hit == HIT_NOTHING) {
        vec3 color = {{scene.background.name}}_render(v);
        v.data.pixel = v.data.pixel + v.data.leftToComputeColor * color;
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