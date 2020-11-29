/***********************************************************************************************************************
 * @file
 * This file defines the scene SDF and scene Gradient used during the raymarching and lightening.
 **********************************************************************************************************************/



/**
 * Distance along the geodesic directed by `v` to the closest object in the local scene
 * @param[in] v the direction to follows
 * @param[out] hit say if we hit an object (1), nothing (0) or if there is a bug (-1)
 * @param[out] obj the object that we hit.
 * There are two void object for background and debug
 */
float localSceneSDF(RelVector v, out int hit, out Solid solid){
    hit = 0;
    float res = maxDist;
    float dist;

    {{#solids}}
        {{#local}}
            dist = {{name}}SDF(v);
            if(abs(dist) < marchingThreshold) {
                hit = 1;
                solid = {{name}};
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
 * @param[out] obj the object that we hit.
 * There are two void object for background and debug
 */
float globalSceneSDF(RelVector v, out int hit, out Solid solid){
  hit = 0;
  float res = maxDist;
  float dist;

  {{#solids}}
    {{#global}}
        dist = {{name}}SDF(v);
        if(abs(dist) < marchingThreshold) {
          hit = 1;
          solid = {{name}};
          return dist;
        }
        res = min(res, dist);

    {{/global}}
  {{/solids}}

  return res;
}


/**
 * Compute the normal to the scene at the vector `v`
 * @param[in] v the vector when we hit the scene
 * @param[in] obj the specific object that has been hit
 * @remark Since we know, which object has been hit, we don't need to use the scenceSDF to estimate the normal.
 * We can directly use the SDF of that object.
 * It is probably faster.
 */
RelVector sceneNormal(RelVector v, Solid solid){
  switch(solid.item.id){
  {{#solids}}
    case {{id}}:
      return {{name}}Grad(v);
  {{/solids}}
  }
}