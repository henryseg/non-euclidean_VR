/***********************************************************************************************************************
 * @struct
 * Local potato shape
 **********************************************************************************************************************/

struct StraightGeoShape {
    Point pos;
    vec4 normal;
    vec4 trans;
    float radius;
};

/**
 * Distance function for a global euclidean ball
 */
float sdf(StraightGeoShape geo, RelVector v) {
    Isometry isom = toIsometry(v.invCellBoost);
    Point m = applyIsometry(isom, geo.pos);
    vec4 n = isom.matrix * geo.normal;
    mat4 aux = transpose(inverse(isom.matrix));
    vec4 t = aux * geo.trans;

    vec2 projV = v.local.pos.coords.xy;
    vec2 projM = m.coords.xy;
    float dist = abs(dot(projV - projM, n.xy)) - geo.radius;

    if (dist > 2. * camera.threshold){
        return dist;
    }
    else {
        return abs(dot(t, v.local.pos.coords)) - geo.radius;
    }
}

