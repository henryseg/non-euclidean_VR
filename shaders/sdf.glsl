/***********************************************************************************************************************
 * @file
 * This file collects all the SDF and gradient functions of individual items.
 * Those functions are generated from the item XML files.
 **********************************************************************************************************************/


// Declare all the signed distance functions (or distance underestimators).
{{#solids}}
    {{{glsl.sdf}}}
    {{{glsl.gradient}}}
{{/solids}}
