// language=Mustache + GLSL
export default `//

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
    float travelledSoFar = v.data.travelledDist;
    
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
        {{/material.isReflecting}}
    
        break;
    
    {{/scene.solids}}
    
        default:
        // this line should never be achieved
        color = vec3(0,0,0);
}

{{#scene.fog}}
    color = applyFog(color, travelledSoFar);
{{/scene.fog}}

return ColorData(color, isReflecting, reflectivity);
}

void updateVectorData(inout ExtVector v, int objId){
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
        {{/material.isReflecting}}
    
        break;
    
    {{/scene.solids}}
    
    default:
    // this line should never be achieved
    color = vec3(0,0,0);
}

`;