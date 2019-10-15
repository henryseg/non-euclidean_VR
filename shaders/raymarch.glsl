/// Edit this file, then run the python 3 script "shaderToPPScript.py" to convert it into a javascript file, "ray.js". 

BEGIN VERTEX
  void main()
  {
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position.xyz, 1.0);
  }
END VERTEX

BEGIN FRAGMENT

  //--------------------------------------------
  //Global Constants
  //--------------------------------------------
  const int MAX_MARCHING_STEPS = 48;
  const float MIN_DIST = 0.0;
  const float MAX_DIST = 100.0;
  const float EPSILON = 0.0001;
  const float fov = 90.0;
  const float horosphereSize = -0.951621;
  const float sphereRad = 0.996216;
  const float halfCubeWidthKlein = 0.5773502692;
  const float globalObjectRadius = 0.2;
  const vec4 ORIGIN = vec4(0,0,0,1);

  //generated in JS using translateByVector(new THREE.Vector3(-c_ipDist,0,0));
  const mat4 leftBoost = mat4(1.0005120437408037, 0, 0, -0.032005463133657125,
                              0, 1, 0, 0,
                              0, 0, 1, 0,
                              -0.032005463133657125, 0, 0, 1.0005120437408037);
                              
  //generated in JS using translateByVector(new THREE.Vector3(c_ipDist,0,0));
  const mat4 rightBoost = mat4(1.0005120437408037, 0, 0, 0.032005463133657125,
                               0, 1, 0, 0,
                               0, 0, 1, 0,
                               0.032005463133657125, 0, 0, 1.0005120437408037);
  //--------------------------------------------
  //Generated Constants
  //--------------------------------------------
  const float halfIdealCubeWidthKlein = 0.5773502692;
  const vec4 idealCubeCornerKlein = vec4(halfIdealCubeWidthKlein, halfIdealCubeWidthKlein, halfIdealCubeWidthKlein, 1.0);
  //--------------------------------------------
  //Global Variables
  //--------------------------------------------
  vec4 N = ORIGIN; //normal vector
  vec4 sampleEndPoint = vec4(1, 1, 1, 1);
  vec4 sampleTangentVector = vec4(1, 1, 1, 1);
  vec4 globalLightColor = ORIGIN;
  int hitWhich = 0;
  //-------------------------------------------
  //Translation & Utility Variables
  //--------------------------------------------
  uniform int isStereo;
  uniform vec2 screenResolution;
  uniform mat4 invGenerators[6];
  uniform mat4 currentBoost;
  uniform mat4 cellBoost; 
  uniform mat4 invCellBoost;
  //--------------------------------------------
  //Lighting Variables & Global Object Variables
  //--------------------------------------------
  uniform vec4 lightPositions[4];
  uniform vec4 lightIntensities[4];
  uniform mat4 globalObjectBoost;

  //--------------------------------------------------------------------
  // Hyperbolic Functions
  //--------------------------------------------------------------------
  float cosh(float x){
    float eX = exp(x);
    return (0.5 * (eX + 1.0/eX));
  }
  
  float acosh(float x){ //must be more than 1
    return log(x + sqrt(x*x-1.0));
  }
  
  float sinh(float x){
    float eX = exp(x);
    return (0.5 * (eX - 1.0/eX));
  }
  
  float hypDot(vec4 u, vec4 v){
    return u.x*v.x + u.y*v.y + u.z*v.z - u.w*v.w; // Lorentz Dot
  }
  
  float hypNorm(vec4 v){
    return sqrt(abs(hypDot(v,v)));
  }
  
  vec4 hypNormalize(vec4 u){
    return u/hypNorm(u);
  }
  
  float hypDistance(vec4 u, vec4 v){
    float bUV = -hypDot(u,v);
    return acosh(bUV);
  }
  
  vec4 hypDirection(vec4 u, vec4 v){
    vec4 w = v + hypDot(u,v)*u;
    return hypNormalize(w);
  }
  
  //-------------------------------------------------------
  //Hyperboloid Functions
  //-------------------------------------------------------
  // Get point at distance dist on the geodesic from u in the direction vPrime
  vec4 pointOnGeodesic(vec4 u, vec4 vPrime, float dist){
    return u*cosh(dist) + vPrime*sinh(dist);
  }
  
  vec4 tangentVectorOnGeodesic(vec4 u, vec4 vPrime, float dist){
    // note that this point has hypDot with itself of -1, so it is on other hyperboloid
    return u*sinh(dist) + vPrime*cosh(dist);
  }
  
  //---------------------------------------------------------------------
  //Raymarch Primitives
  //---------------------------------------------------------------------
  // A horosphere can be constructed by offseting from a standard horosphere.
  // Our standard horosphere will have a center in the direction of lightPoint
  // and go through the origin. Negative offsets will shrink it.
  float horosphereHSDF(vec4 samplePoint, vec4 lightPoint, float offset){
    return log(-hypDot(samplePoint, lightPoint)) - offset;
  }
  
  float sphereSDF(vec4 samplePoint, vec4 center, float radius){
    return hypDistance(samplePoint, center) - radius;
  }
  
  //---------------------------------------------------------------------
  //Scene Definitions
  //---------------------------------------------------------------------
  float localSceneSDF(vec4 samplePoint){
    float sphere = sphereSDF(samplePoint, ORIGIN, sphereRad);
    float vertexSphere = 0.0;
    vertexSphere = horosphereHSDF(abs(samplePoint), idealCubeCornerKlein, horosphereSize);
    float final = -min(vertexSphere,sphere); //unionSDF
    return final;
  }
  
  //GLOBAL OBJECTS SCENE ++++++++++++++++++++++++++++++++++++++++++++++++
  float globalSceneSDF(vec4 samplePoint){
    vec4 absoluteSamplePoint = cellBoost * samplePoint; // correct for the fact that we have been moving
    float distance = MAX_DIST;
    //Light Objects
    for(int i=0; i<4; i++){
      float objDist;
      objDist = sphereSDF(absoluteSamplePoint, lightPositions[i], 1.0/(10.0*lightIntensities[i].w));
      distance = min(distance, objDist);
      if(distance < EPSILON){
        hitWhich = 1;
        globalLightColor = lightIntensities[i];
        return distance;
      }
    }
    //Global Sphere Object
    float objDist;
    objDist = sphereSDF(absoluteSamplePoint, globalObjectBoost[3], globalObjectRadius);
    distance = min(distance, objDist);
    if(distance < EPSILON){
      hitWhich = 2;
    }
    return distance;
  }
  
  //NORMAL FUNCTIONS ++++++++++++++++++++++++++++++++++++++++++++++++++++
  vec4 estimateNormal(vec4 p) { // normal vector is in tangent hyperplane to hyperboloid at p
      // float denom = sqrt(1.0 + p.x*p.x + p.y*p.y + p.z*p.z);  // first, find basis for that tangent hyperplane
      float newEp = EPSILON * 10.0;
      vec4 basis_x = hypNormalize(vec4(p.w,0.0,0.0,p.x));  // dw/dx = x/w on hyperboloid
      vec4 basis_y = vec4(0.0,p.w,0.0,p.y);  // dw/dy = y/denom
      vec4 basis_z = vec4(0.0,0.0,p.w,p.z);  // dw/dz = z/denom  /// note that these are not orthonormal!
      basis_y = hypNormalize(basis_y - hypDot(basis_y, basis_x)*basis_x); // need to Gram Schmidt
      basis_z = hypNormalize(basis_z - hypDot(basis_z, basis_x)*basis_x - hypDot(basis_z, basis_y)*basis_y);
      if(hitWhich != 3){ //global light scene
        return hypNormalize( //p+EPSILON*basis_x should be lorentz normalized however it is close enough to be good enough
          basis_x * (globalSceneSDF(p + newEp*basis_x) - globalSceneSDF(p - newEp*basis_x)) +
          basis_y * (globalSceneSDF(p + newEp*basis_y) - globalSceneSDF(p - newEp*basis_y)) +
          basis_z * (globalSceneSDF(p + newEp*basis_z) - globalSceneSDF(p - newEp*basis_z)));
      }
      else{ //local scene
        return hypNormalize(
          basis_x * (localSceneSDF(p + newEp*basis_x) - localSceneSDF(p - newEp*basis_x)) +
          basis_y * (localSceneSDF(p + newEp*basis_y) - localSceneSDF(p - newEp*basis_y)) +
          basis_z * (localSceneSDF(p + newEp*basis_z) - localSceneSDF(p - newEp*basis_z)));
      }
  }
  
  // This function is intended to be hyp-agnostic.
  // We should update some of the variable names.
  bool isOutsideCell(vec4 samplePoint, out mat4 fixMatrix){
    vec4 kleinSamplePoint = samplePoint/samplePoint.w; //project to klein
    if(kleinSamplePoint.x > halfCubeWidthKlein){
      fixMatrix = invGenerators[0];
      return true;
    }
    if(kleinSamplePoint.x < -halfCubeWidthKlein){
      fixMatrix = invGenerators[1];
      return true;
    }
    if(kleinSamplePoint.y > halfCubeWidthKlein){
      fixMatrix = invGenerators[2];
      return true;
    }
    if(kleinSamplePoint.y < -halfCubeWidthKlein){
      fixMatrix = invGenerators[3];
      return true;
    }
    if(kleinSamplePoint.z > halfCubeWidthKlein){
      fixMatrix = invGenerators[4];
      return true;
    }
    if(kleinSamplePoint.z < -halfCubeWidthKlein){
      fixMatrix = invGenerators[5];
      return true;
    }
    return false;
  }
  
  void raymarch(vec4 rO, vec4 rD, out mat4 totalFixMatrix){
    mat4 fixMatrix;
    float globalDepth = MIN_DIST; float localDepth = globalDepth;
    vec4 localrO = rO; vec4 localrD = rD;
    totalFixMatrix = mat4(1.0);

    // Trace the local scene, then the global scene:
    for(int i = 0; i < MAX_MARCHING_STEPS; i++){
      vec4 localEndPoint = pointOnGeodesic(localrO, localrD, localDepth);
      if(isOutsideCell(localEndPoint, fixMatrix)){
        totalFixMatrix = fixMatrix * totalFixMatrix;
        vec4 localEndTangent = tangentVectorOnGeodesic(localrO, localrD, localDepth);
        localrO = hypNormalize(fixMatrix * localEndPoint);
        localrD = hypDirection(localrO, fixMatrix * localEndTangent);
        localDepth = MIN_DIST;
      }
      else{
        float localDist = min(0.5,localSceneSDF(localEndPoint));
        if(localDist < EPSILON){
          hitWhich = 3;
          sampleEndPoint = localEndPoint;
          sampleTangentVector = tangentVectorOnGeodesic(localrO, localrD, localDepth);
          break;
        }
        localDepth += localDist;
        globalDepth += localDist;
      }
    }

    // Set for localDepth to our new max tracing distance:
    localDepth = min(globalDepth, MAX_DIST);
    globalDepth = MIN_DIST;
    for(int i = 0; i < MAX_MARCHING_STEPS; i++){
      vec4 globalEndPoint = pointOnGeodesic(rO, rD, globalDepth);
      float globalDist = globalSceneSDF(globalEndPoint);
      if(globalDist < EPSILON){
        // hitWhich has now been set
        totalFixMatrix = mat4(1.0);
        sampleEndPoint = globalEndPoint;
        sampleTangentVector = tangentVectorOnGeodesic(rO, rD, globalDepth);
        return;
      }
      globalDepth += globalDist;
      if(globalDepth >= localDepth){
        break;
      }
    }
  }
  

  //--------------------------------------------------------------------
  // Lighting Functions
  //--------------------------------------------------------------------
  //SP - Sample Point | TLP - Translated Light Position | V - View Vector
  vec3 lightingCalculations(vec4 SP, vec4 TLP, vec4 V, vec3 baseColor, vec4 lightIntensity){
    //Calculations - Phong Reflection Model
    vec4 L = hypDirection(SP, TLP);
    vec4 R = 2.0*hypDot(L, N)*N - L;
    //Calculate Diffuse Component
    float nDotL = max(hypDot(N, L),0.0);
    vec3 diffuse = lightIntensity.rgb * nDotL;
    //Calculate Specular Component
    float rDotV = max(hypDot(R, V),0.0);
    vec3 specular = lightIntensity.rgb * pow(rDotV,10.0);
    //Attenuation - Inverse Square
    float distToLight = hypDistance(SP, TLP);
    float att = 0.6/(0.01 + lightIntensity.w * distToLight);
    //Compute final color
    return att*((diffuse*baseColor) + specular);
  }
  
  vec3 phongModel(mat4 totalFixMatrix){
    vec4 SP = sampleEndPoint;
    vec4 TLP; //translated light position
    vec4 V = -sampleTangentVector;
    vec3 color = vec3(0.0);
    //--------------------------------------------------
    //Lighting Calculations
    //--------------------------------------------------
    //usually we'd check to ensure there are 4 lights
    //however this is version is hardcoded so we won't
    for(int i = 0; i<4; i++){ 
        TLP = totalFixMatrix*invCellBoost*lightPositions[i];
        color += lightingCalculations(SP, TLP, V, vec3(1.0), lightIntensities[i]);
    }
    return color;
  }

  //--------------------------------------------------------------------
  // Tangent Space Functions
  //--------------------------------------------------------------------

  vec4 getRayPoint(vec2 resolution, vec2 fragCoord, bool isLeft){ //creates a point that our ray will go through
    if(isStereo == 1){
      resolution.x = resolution.x * 0.5;
      if(!isLeft) { fragCoord.x = fragCoord.x - resolution.x; }
    }
    vec2 xy = 0.2*((fragCoord - 0.5*resolution)/resolution.x);
    float z = 0.1/tan(radians(fov*0.5));
    vec4 p =  hypNormalize(vec4(xy,-z,1.0));
    return p;
  }

  //--------------------------------------------------------------------
  // Main
  //--------------------------------------------------------------------

  void main(){
    vec4 rayOrigin = ORIGIN;

    //stereo translations ----------------------------------------------------
    bool isLeft = gl_FragCoord.x/screenResolution.x <= 0.5;
    vec4 rayDirV = getRayPoint(screenResolution, gl_FragCoord.xy, isLeft);
    if(isStereo == 1){
      if(isLeft){
        rayOrigin = leftBoost * rayOrigin;
        rayDirV = leftBoost * rayDirV;
      }
      else{
        rayOrigin = rightBoost * rayOrigin;
        rayDirV = rightBoost * rayDirV;
      }
    }

    //camera position must be translated in hyperboloid -----------------------
    rayOrigin = currentBoost * rayOrigin;
    rayDirV = currentBoost * rayDirV;
    //generate direction then transform to hyperboloid ------------------------
    vec4 rayDirVPrime = hypDirection(rayOrigin, rayDirV);
    //get our raymarched distance back ------------------------
    mat4 totalFixMatrix = mat4(1.0);
    raymarch(rayOrigin, rayDirVPrime, totalFixMatrix);
  
    //Based on hitWhich decide whether we hit a global object, local object, or nothing
    if(hitWhich == 0){ //Didn't hit anything ------------------------
      gl_FragColor = vec4(0.0);
      return;
    }
    else if(hitWhich == 1){ // global lights
      gl_FragColor = vec4(globalLightColor.rgb, 1.0);
      return;
    }
    else{ // objects
      N = estimateNormal(sampleEndPoint);
      vec3 color;
      color = phongModel(totalFixMatrix);
      gl_FragColor = vec4(color, 1.0);
    }
  }
END FRAGMENT