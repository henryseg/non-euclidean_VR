/***********************************************************************************************************************
 * @file
 * Discrete subgroups.
 * This file define all the tests used for teleportations
 * (isometries have been passed as uniforms in setup.glsl)
 * It also implements the (global) teleportation function
 **********************************************************************************************************************/


// Declare all teleportation tests
{{#teleports}}
    {{{glsl}}}
{{/teleports}}


/**
 * Teleportation.
 * Check if the local vector is still in the fundamental domain define by the teleportation tests.
 * If not, teleport the local vector, update the cellBoost and its inverse accordingly and set teleported to true
 * Otherwie, do nothing and set teleported to false
 * @param[in] v the relative vector to teleport.
 * @param[out] teleported a flag to know if a teleportation has been done.
 * @return true if the vector has been teleported and false otherwise
 */
bool teleport(inout RelVector v){
    {{#teleports}}
        if(test_{{name}}(v.local.pos)){
            v.local = applyIsometry({{name}}Isom, v.local);
            v.cellBoost = multiply(v.cellBoost,{{name}}Inv);
            v.invCellBoost = multiply({{name}}Isom, v.invCellBoost);
            return true;
        }
    {{/teleports}}
    return false;
}

