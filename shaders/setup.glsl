Isometry boost; /**< Current boost */
Isometry leftBoost; /**< Left eye boost */
Isometry rightBoost; /**< Right eye boost */
Isometry cellBoost; /**< Cell boost */
Isometry invCellBoost; /**< Inverse of the cell boot */
Isometry objectBoost; /**< objetBoost (model for the template) */


// Declare all the items (solids and lights).
{{#solids}}
  {{{glsl.declare}}}
{{/solids}}

{{#lights}}
  {{{glsl.declare}}}
{{/lights}}

/**
 * Setup all the boost from the raw data passed to the shader
 */
void setup() {
    boost = unserializeIsom(boostRawA, boostRawB);
    leftBoost = unserializeIsom(leftBoostRawA, leftBoostRawB);
    rightBoost = unserializeIsom(rightBoostRawA, rightBoostRawB);
    cellBoost = unserializeIsom(cellBoostRawA, cellBoostRawB);
    invCellBoost = unserializeIsom(invCellBoostRawA, invCellBoostRawB);

    {{#solids}}
        {{{glsl.setup}}}
    {{/solids}}

    {{#lights}}
        {{{glsl.setup}}}
    {{/lights}}
}
