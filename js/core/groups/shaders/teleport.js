//language=Mustache + GLSL
export default `//
/**
* Teleportation.
* Check if the local vector is still in the fundamental domain define by the teleportation tests.
* If not, teleport the local vector, update the cellBoost and its inverse accordingly and set teleported to true
* Otherwise, do nothing and set teleported to false
* @param[in] v the relative vector to teleport.
*/
ExtVector teleport(ExtVector v){
    v.data.isTeleported = false;
    {{#teleportations}}
        if({{glslTestName}}(v.vector.local.pos)){
            v.vector = rewrite(v.vector, {{elt.name}}, {{inv.name}});
            v.data.isTeleported = true;
            return v;
        }
    {{/teleportations}}
    return v;
}


/**
 * Does one of the two following transformation: 
 * flow the vector by the given time, if the vector escape the fundamental domain, 
 * then flow during a smaller time to reach the boundary (creeping).
 * @param[inout] v the relative vector to flow / teleport / creep.
 * @param[in] t the (maximal) time to flow
 * @param[in] offset the amount we march passed the boundary
 */
ExtVector creepingFlow(ExtVector v, float t, float offset){
    ExtVector try = flow(v, t);
    {{#teleportations}}

        {{#usesCreepingCustom}}
        if({{glslTestName}}(try.vector.local.pos)){
            try = {{glslCreepName}}(v, offset);
        }
        {{/usesCreepingCustom}}

        {{#usesCreepingBinary}}
        if({{glslTestName}}(try.vector.local.pos)){
            try = {{glslCreepName}}(v, try, offset);
        }
        {{/usesCreepingBinary}}
        
    {{/teleportations}}
    return try;
}



`;

