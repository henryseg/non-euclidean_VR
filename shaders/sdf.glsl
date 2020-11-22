// Declare all the signed distance functions (or distance underestimators).
{{#solids}}
    {{{glsl.sdf}}}
    {{{glsl.gradient}}}
{{/solids}}

{{#lights}}
    {{{glsl.sdf}}}
    {{{glsl.gradient}}}
{{/lights}}