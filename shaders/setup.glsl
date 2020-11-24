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
 * Setup all the boost from the raw data passed to the shader
 */
void setup() {
    {{#solids}}
        {{{glsl.setup}}}
    {{/solids}}

    {{#lights}}
        {{{glsl.setup}}}
    {{/lights}}
}
