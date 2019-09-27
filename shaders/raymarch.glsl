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
  const float expHorosphereSize =  0.386115;
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
    // ARNAUD
  uniform mat4 cuspators[2]; 
  // END-ARNAUD
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
  
  // if u is on spacial hyperboloid, i.e. dot(u,u) = -1, 
  // then this function projects v to the dot-orthogonal of u
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

    // ARNAUD
  // advance the (point,vector) pair by dist on the geodesic they define
  void advanceOnGeodesic(inout vec4 point, inout vec4 vector, float dist){
    float c=cosh(dist);
    float s=sinh(dist);
    vec4 aux = c*point + s*vector;
    vector = s*point + c*vector;
    point = aux;
  }
  // END ARNAUD
  
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
    vec4 absoluteSamplePoint = samplePoint * cellBoost; // correct for the fact that we have been moving
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
  
  vec3 phongModel(mat4 totalFixMatrix, vec3 color){
    vec4 SP = sampleEndPoint;
    vec4 TLP; //translated light position
    vec4 V = -sampleTangentVector;
    // vec3 color = vec3(0.1);
    //--------------------------------------------------
    //Lighting Calculations
    //--------------------------------------------------
    //usually we'd check to ensure there are 4 lights
    //however this is version is hardcoded so we won't
    for(int i = 0; i<4; i++){ 
        TLP = lightPositions[i]*invCellBoost*totalFixMatrix;
        color += lightingCalculations(SP, TLP, V, vec3(1.0), lightIntensities[i]);
    }
    return color;
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

  const float sqrt2= 1.4142135623730950;
  const float oos2 = 0.7071067811865475;
  const float a0   = 0.7071067811865475;
  const float cosb = 0.5773502691896257;
  const float sinb = 0.8164965809277260;
  const float delta_0 = 0.05; // some security margin
  const float margin = 0.05; // some security margin
  const float sqrt3 = 1.7320508075688772;
  const vec4 cusp = vec4(cosb,cosb,cosb,1.0);
  
  // ADDITION by ARNAUD
  // tests whether samplePoint is in the principal cusp
  // (some horoball around (x,x,x) with x=1/sqrt(3))
  // and if so advance along the geodesic (samplePoint,sampleVector)
  // until were'out of the horoball, store the distance advanced in dist
  // assumes that samplePoint has self dot 1 and sampleVector has self dot -1
  bool cuspAcceleration(inout vec4 samplePoint, inout vec4 sampleVector, inout mat4 fixMatrix, inout float dist) {
    float aux = 0.0;
    
    fixMatrix = mat4(1.0);
    
    float sign_x = samplePoint[0] >= 0.0 ? 1.0 : -1.0;
    float sign_y = samplePoint[1] >= 0.0 ? 1.0 : -1.0;
    float sign_z = samplePoint[2] >= 0.0 ? 1.0 : -1.0;
    vec4 p = vec4(
      samplePoint[0]*sign_x,
      samplePoint[1]*sign_y,
      samplePoint[2]*sign_z,
      samplePoint[3]
    );
    
    // cusp test, runs fast

    float hohe = expHorosphereSize-delta_0;

    if(-hypDot(p,cusp) >= hohe-margin) return false; 
    
//    hitWhich = 5;
//    return true;
    
    // If we're in the cusp:
    
    // 1. We skip along the geodesic to the next intersection with the horosphere.
    // The equation to solve :
    //     hypDot(p',cusp) = -hohe
    // with p' = p*(ed+1/ed)/2 + v*(ed-1/ed)/2
    // with hypDot = +,+,+,-
    // with ed = exp(dist), p = origin (on hyperboloid), v=direction (orthogonal to p for hypDot)
    // with cusp = (1/sqrt(3),1/sqrt(3),1/sqrt(3),1) and hohe>0, hohe^2 = 1/height
    
    vec4 v = vec4(
      sampleVector[0]*sign_x,
      sampleVector[1]*sign_y,
      sampleVector[2]*sign_z,
      sampleVector[3]
    );
    
    // reducing to equation X^2+2bX+c = 0
    float a = hypDot(p+v,cusp);
    float b = hohe/a;
    float c = hypDot(p-v,cusp)/a;
    float delta = b*b-c;
    
    if(delta<0.0) return false; // Can't happen
    
    delta = sqrt(delta);
    float sol = -b + delta;

    if(sol<=0.0) return false; // Can't happen    

    // Note: below, a small optimization is possible by avoiding the log followed
    // by a cosh and sinh. Is it worth trying? Recall that the present function
    // outputs on dist.

    dist = log(sol);

    advanceOnGeodesic(p, v, dist); 
    
    // 2. then we move the new point (and vector) back to the fundamental domain

    float x = p[0];
    float y = p[1];
    float z = p[2];
    float t = p[3];
    
    // the composition of the two following rotations is an isometry chosen 
    // so that it would send the (all coords positive) vertex of the cube at (0,0,1)
    // I think that the formulas below are faster than multiplying by a 4x4 matrix
    
    // apply rotation by 1/8th of a turn along z axis
    aux = (x-y)*a0;
    y = (x+y)*a0;
    x = aux;
    // vx = aux;
    // apply appropriate rotation along x axis 
    aux = y*cosb-z*sinb;
    z =   y*sinb+z*cosb;
    y = aux;
    // apply projective transformation so as to send to infinity the point
    // (0,0,1) on the sphere and its tangent plane, its antipodal point to 0
    // and its tangent plane to the plane z=0
    aux = z+t;
    t = t-z;
    z = aux;
    
    // project by dividing by t and then
    // rescale so that the 3 edges of the cube at the cusp become
    // vertices of a triangle lying at the three roots of unity
    // in the complex plane proj_x+i.proj_y
    // oos2 = 1/sqrt(2)
    float proj_x = oos2*x/t;
    float proj_y = oos2*y/t;
    
    // move vector proj=(proj_x,proj_y) to fdtal domain of tesselation 
    // translation subgroup basis: e1 = (sqrt3,3), e2 = (sqrt3,-3)

    // solve for cu*e1+cv*e2 = a = proj-(-sqrt3,1)
    // sqrt3(cu+cv) = ax
    // 3(cu-cv) = ay
    float ax = proj_x+sqrt3;
    float ay = proj_y-1.0;
    float aux_x = ax / sqrt3;
    float aux_y = ay / 3.0;
    float cu = (aux_x+aux_y)/2.0;
    float cv = (aux_x-aux_y)/2.0;
    // take integer part
    cu=floor(cu);
    cv=floor(cv);

    // correction vector in ax,ay coordinates
    float proj_dx = -(cu+cv)*sqrt3;
    float proj_dy = -(cu-cv)*3.0;

    float tax = ax + proj_dx;
    float tay = ay + proj_dy;
    // I tested it: we are indeed in the fundamental domain rhombus
    
    // rescale to get translation vector in (x/t, y/t) coordinates
    float dx = sqrt2*proj_dx;
    float dy = sqrt2*proj_dy;
    
    // specs say matrices are input with the constructor in column major order
    // however, everywhere in this code we use the transpose multiplication vec4*mat4
    // so we can do as if we were inputing in row major a non-transposed matrix
    mat4 horo = mat4(
        1.0 , 0.0 , 0.0 , dx
      , 0.0 , 1.0 , 0.0 , dy
      , 2.0*dx, 2.0*dy , 1.0, dx*dx+dy*dy
      , 0.0, 0.0 , 0.0 , 1.0
    );

    // thanks to the choice of using the transposed product,
    // matrix composition is in the reading order (the opposite of std composition)!
    
    // half-turn in R^2 about (0,sqrt2) turned into a parabolic transformation
    if(tay > 0.0) {
      horo = horo * mat4(
         -1.0,  0.0, 0.0, 0.0
        , 0.0, -1.0, 0.0, 2.0*sqrt2
        , 0.0, -4.0*sqrt2, 1.0, 8.0 
        , 0.0,  0.0, 0.0, 1.0
      );
    }
            
    // compose matrices using reading order
    
    fixMatrix = cuspators[0] * horo * cuspators[1];

    // below we do a transposed product vec4 * mat4 which really means T(mat4) * vec4


    samplePoint  = p * fixMatrix;
    sampleVector = v * fixMatrix;
  
    // 3. we don't forget to correct for the sign

    samplePoint[0] *= sign_x;
    samplePoint[1] *= sign_y;
    samplePoint[2] *= sign_z;

    sampleVector[0] *= sign_x;
    sampleVector[1] *= sign_y;
    sampleVector[2] *= sign_z;

    // GLSL syntax is mat4[col][row]

    fixMatrix[0][1] *= sign_x*sign_y;
    fixMatrix[0][2] *= sign_x*sign_z;
    fixMatrix[0][3] *= sign_x;
    
    fixMatrix[1][0] *= sign_y*sign_x;
    fixMatrix[1][2] *= sign_y*sign_z;
    fixMatrix[1][3] *= sign_y;

    fixMatrix[2][0] *= sign_z*sign_x;
    fixMatrix[2][1] *= sign_z*sign_y;
    fixMatrix[2][3] *= sign_z;

    fixMatrix[3][0] *= sign_x;
    fixMatrix[3][1] *= sign_y;
    fixMatrix[3][2] *= sign_z;
  
    return true;
  }
  // END ADDITION
  
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
  
  // Ray Marching algorithm
  // inputs
  // r0: origin of the ray
  // rD: direction of the ray
  // outputs
  // totalFixMatrix: matrix that 
  // hitWhich: which object/kind is hit by the ray
  // this function also sets some 'global' variables:
  //   sampleEndPoint, sampleTangentVector, hitWhich
  // WARNING: global*** are local variables!
  void raymarch(vec4 rO, vec4 rD, out mat4 totalFixMatrix){
    mat4 fixMatrix = mat4(1.0);
    // ARNAUD - I did not understand MIN_DIST, I removed it
    float globalDepth = 0.0;
    float dist = 0.0; // initialization useless
    vec4 localrO = rO; vec4 localrD = rD;
    totalFixMatrix = mat4(1.0);

    // Trace the local scene, then the global scene:
    for(int i = 0; i < MAX_MARCHING_STEPS; i++){      
      if(cuspAcceleration(localrO, localrD, fixMatrix, dist)) {
        totalFixMatrix *= fixMatrix;
        globalDepth += dist;
        if(hitWhich==5)
          return;
      }
      else if(isOutsideCell(localrO, fixMatrix)){
        totalFixMatrix *= fixMatrix;
        localrO = localrO*fixMatrix;
        localrD = localrD*fixMatrix;  
      } 
      else{
        dist = min(0.5,localSceneSDF(localrO));
        if(dist < EPSILON){
          hitWhich = 3;
          sampleEndPoint = localrO;
          sampleTangentVector = tangentVectorOnGeodesic(localrO, localrD, dist);
          break;
        }
        advanceOnGeodesic(localrO, localrD, dist);
        globalDepth += dist;
      }
      // ARNAUD - There was an optimization avoiding normalization at each step
      // (normalization was done when a matrix was applied, not when advancing)
      // I removed this optimization because it made the code hard to modify
      localrO = hypNormalize(localrO);
      localrD = hypDirection(localrO, localrD);
    }


    //------------------------
    // mat4 fixMatrix;
    // float globalDepth = MIN_DIST; float localDepth = globalDepth;
    // vec4 localrO = rO; vec4 localrD = rD;
    // totalFixMatrix = mat4(1.0);

    // // Trace the local scene, then the global scene:
    // for(int i = 0; i < MAX_MARCHING_STEPS; i++){
    //   vec4 localEndPoint = pointOnGeodesic(localrO, localrD, localDepth);
    //   if(isOutsideCell(localEndPoint, fixMatrix)){
    //     totalFixMatrix *= fixMatrix;
    //     localrO = hypNormalize(localEndPoint*fixMatrix);
    //     localrD = hypDirection(localrO, localrD*fixMatrix);
    //     localDepth = MIN_DIST;
    //   }
    //   else{
    //     float localDist = min(0.5,localSceneSDF(localEndPoint));
    //     if(localDist < EPSILON){
    //       hitWhich = 3;
    //       sampleEndPoint = localEndPoint;
    //       sampleTangentVector = tangentVectorOnGeodesic(localrO, localrD, localDepth);
    //       break;
    //     }
    //     localDepth += localDist;
    //     globalDepth += localDist;
    //   }
    // }

    // // Set for localDepth to our new max tracing distance:
    // localDepth = min(globalDepth, MAX_DIST);
    // globalDepth = MIN_DIST;
    // for(int i = 0; i < MAX_MARCHING_STEPS; i++){
    //   vec4 globalEndPoint = pointOnGeodesic(rO, rD, globalDepth);
    //   float globalDist = globalSceneSDF(globalEndPoint);
    //   if(globalDist < EPSILON){
    //     // hitWhich has now been set
    //     totalFixMatrix = mat4(1.0);
    //     sampleEndPoint = globalEndPoint;
    //     sampleTangentVector = tangentVectorOnGeodesic(rO, rD, globalDepth);
    //     return;
    //   }
    //   globalDepth += globalDist;
    //   if(globalDepth >= localDepth){
    //     break;
    //   }
    // }
  }
  
  void main(){
    vec4 rayOrigin = ORIGIN;

    //stereo translations ----------------------------------------------------
    bool isLeft = gl_FragCoord.x/screenResolution.x <= 0.5;
    vec4 rayDirV = getRayPoint(screenResolution, gl_FragCoord.xy, isLeft);
    if(isStereo == 1){
      if(isLeft){
        rayOrigin *= leftBoost;
        rayDirV *= leftBoost;
      }
      else{
        rayOrigin *= rightBoost;
        rayDirV *= rightBoost;
      }
    }

    //camera position must be translated in hyperboloid -----------------------
    rayOrigin *= currentBoost;
    rayDirV *= currentBoost;
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
      
      float x=sampleEndPoint[0]/sampleEndPoint[3];
      float y=sampleEndPoint[1]/sampleEndPoint[3];
      float z=sampleEndPoint[2]/sampleEndPoint[3];
      x = x * sqrt3;
      y = y * sqrt3;
      z = z * sqrt3;
      x = (x+1.0)/2.0;
      y = (y+1.0)/2.0;
      z = (z+1.0)/2.0;
      vec3 color = vec3(x,y,z);
      N = estimateNormal(sampleEndPoint);
      color = phongModel(totalFixMatrix, 0.2*color);
      gl_FragColor = vec4(color, 1.0);
    }
  }
END FRAGMENT