struct AugmentedCubeMaterial {
    vec3 mainColor0;
    vec3 mainColor2;
    vec3 mainColor1;
    vec3 mainColor3;
    vec3 mainColor4;
    vec3 mainColor5;
    vec3 weight;
};

vec4 render(AugmentedCubeMaterial material, ExtVector v) {
    vec3 mainColor;
    int hash = hash(v.vector.cellBoost);
    switch (hash) {
        case 0:
            mainColor = material.mainColor0;
            break;
        case 1:
            mainColor = material.mainColor1;
            break;
        case 2:
            mainColor = material.mainColor2;
            break;
        case 3:
            mainColor = material.mainColor3;
            break;
        case 4:
            mainColor = material.mainColor4;
            break;
        case 5:
            mainColor = material.mainColor5;
            break;
    }
    vec3 color = mainColor + material.weight * v.vector.local.pos.coords.xyw;
    return vec4(color, 1);
}