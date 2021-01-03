//language=Mustache + GLSL
export default `//
/**
* Teleportation.
* Check if the local vector is still in the fundamental domain define by the teleportation tests.
* If not, teleport the local vector, update the cellBoost and its inverse accordingly and set teleported to true
* Otherwise, do nothing and set teleported to false
* @param[inout] v the relative vector to teleport.
* @return true if the vector has been teleported and false otherwise
*/
bool teleport(inout RelVector v){
{{#teleports}}
    if({{glslTestName}}(v.local.pos)){
        v.local = applyIsometry({{name}}Isom, v.local);
        v.cellBoost = multiply(v.cellBoost,{{name}}Inv);
        v.invCellBoost = multiply({{name}}Isom, v.invCellBoost);
        return true;
    }
{{/teleports}}
return false;
}`;