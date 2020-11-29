/***********************************************************************************************************************
 * @file
 * Discrete subgroup.
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
 * @return the teleported relative vector.
 */
RelVector teleport(RelVector v, out bool teleported){
    {{#teleports}}
        if(test_{{name}}(v.local.pos)){
            v.local = applyIsometry({{name}}Isom, v.local);
            v.cellBoost = multiply(v.cellBoost,{{name}}Inv);
            v.invCellBoost = multiply({{name}}Isom, v.invCellBoost);
            teleported = true;
            return v;
        }
    {{/teleports}}
    teleported = false;
  return v;
}

