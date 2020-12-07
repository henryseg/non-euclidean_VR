/***********************************************************************************************************************
 * @file
 * This file defines the scene SDF and scene Gradient used during the raymarching and lightening.
 **********************************************************************************************************************/



/**
 * Distance along the geodesic directed by `v` to the closest object in the local scene
 * @param[in] v the direction to follows
 * @param[out] hit say if we hit an object (1), nothing (0) or if there is a bug (-1)
 * @param[out] solid the solid that we hit.
 * @param[out] normal the normal to the solid at the point we hit it
 * There are two void object for background and debug
 */
float localSceneSDF(RelVector v, out int hit, out Solid solid, out RelVector normal){
    hit = HIT_NOTHING;
    float res = maxDist;
    float dist;

    {{#solids}}
        {{#local}}
            dist = {{name}}SDF(v);
            if(abs(dist) < marchingThreshold) {
                hit = HIT_SOLID;
                solid = {{name}};
                normal = {{name}}Grad(v);
                return dist;
            }
            res = min(res, dist);
        {{/local}}
    {{/solids}}

    return res;
}


/**
 * Distance along the geodesic directed by `v` to the closest object in the global scene
 * @param[in] v the direction to follows
 * @param[out] hit say if we hit an object (1), nothing (0) or if there is a bug (-1)
 * @param[out] solid the solid that we hit.
 * @param[out] normal the normal to the solid at the point we hit it
 * There are two void object for background and debug
 */
float globalSceneSDF(RelVector v, out int hit, out Solid solid, out RelVector normal){
    hit = HIT_NOTHING;
    float res = maxDist;
    float dist;

    {{#solids}}
        {{#global}}
            dist = {{name}}SDF(v);
            if(abs(dist) < marchingThreshold) {
                hit = HIT_SOLID;
                solid = {{name}};
                normal = {{name}}Grad(v);
                return dist;
            }
            res = min(res, dist);
        {{/global}}
    {{/solids}}

  return res;
}