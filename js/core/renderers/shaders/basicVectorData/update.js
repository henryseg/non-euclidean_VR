// language=Mustache + GLSL
export default `//

void updateVectorDataFromObj(inout ExtVector v, int objId){
    RelVector normal;
    vec2 uv;
    vec3 color;
    
    switch(objId){
    {{#scene.solids}}
    
        case {{id}}:
        {{#material.isReflecting}}
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
                color = applyFog(color, v.data.travelledDist);
            {{/scene.fog}}

            if(length({{material.name}}.reflectivity) == 0.) {
                v.data.stop = true;
            }
            else{
                v.data.stop = false;
            }
            v.data.accColor = v.data.accColor + v.data.leftToComputeColor * (vec3(1) - {{material.name}}.reflectivity) * color;
            v.data.leftToComputeColor = v.data.leftToComputeColor *  {{material.name}}.reflectivity;
            v.vector = geomReflect(v.vector,normal);
            v.data.travelledDist = 0.;
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
                color = applyFog(color, v.data.travelledDist);
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
        updateVectorDataFromObj(v, objId);
        return;
    }
}

`;