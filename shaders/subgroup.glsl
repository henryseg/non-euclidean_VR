// Declare all teleportation tests
{{#teleports}}
 {{{glsl}}}
{{/teleports}}

GenVector teleport(GenVector v, out bool hasTeleported){
    {{#teleports}}
        if(test_{{name}}(v.vec.pos)){
            v.vec = applyIsometry({{name}}Isom, v.vec);
            v.cellBoost = multiply(v.cellBoost,{{name}}Inv);
            v.invCellBoost = multiply({{name}}Isom, v.invCellBoost);
            hasTeleported = true;
            return v;
        }
    {{/teleports}}
    hasTeleported = false;
  return v;
}

