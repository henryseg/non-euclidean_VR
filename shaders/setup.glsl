/***********************************************************************************************************************
 * @file
 * Main setup :
 * - Declare the parameters passed to the shader as uniforms
 * - Declare (as global variables) all the items in the scene
 * - Setup all the items
 **********************************************************************************************************************/


// Defining all the variables passed to the shader as uniforms.
{{#uniforms}}
uniform {{type}} {{name}};
{{/uniforms}}

// Declare all the items (solids and lights).
{{#solids}}
  {{{glsl.declare}}}
{{/solids}}

{{#lights}}
  {{{glsl.declare}}}
{{/lights}}

/**
 * Setup all the items in the scene
 */
void setup() {
    {{#solids}}
        {{{glsl.setup}}}
    {{/solids}}

    {{#lights}}
        {{{glsl.setup}}}
    {{/lights}}
}
