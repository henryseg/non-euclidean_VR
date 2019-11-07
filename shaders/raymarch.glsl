/// Edit this file, then run the python 3 script "shaderToPPScript.py" to convert it into a javascript file, "ray.js". 


//what does this vertex shader do?
BEGIN VERTEX
  void main()
  {
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position.xyz, 1.0);
  }
END VERTEX

BEGIN FRAGMENT







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
  



















  












  //--------------------------------------------
  //GEOM DEPENDENT
  //--------------------------------------------




  //--------------------------------------------
  //Geometry Constants
  //--------------------------------------------
  const float HalfCube=0.6584789485;
  const float HalfHeight=0.6584789485;
  const float modelHalfCube = 0.5773502692;
  const float modelHalfHeight=0.65847;//projection doesnt change w direction here
  const float vertexSphereSize = -0.98;//In this case its a horosphere
  const float centerSphereSize = 1.55* HalfCube;
//This next part is specific still to hyperbolic space as the horosphere takes an ideal point in the Klein Model as its center.
  const vec4 modelCubeCorner = vec4(modelHalfCube, modelHalfCube, modelHalfCube, 1.0);
  const float globalObjectRadius = 0.2;

  const vec4 ORIGIN = vec4(0,0,1,0);


//these translate the eyes along the x-axis (in the hyperbolic direction, so youre standing up vertically)
//NEED TO FIGURE OUT WHAT TO DO ABT Z DIRECTION IF ANYTHING
  const mat4 leftBoost = mat4(1., 0, -0.032, 0,
                              0, 1, 0, 0,
                              -0.032, 0, 1, 0,
                              0, 0, 0, 1.);
                              
  const mat4 rightBoost = mat4(1., 0,  0.032,0,
                               0, 1, 0, 0,
                               0.032, 0, 1, 0,
                               0, 0, 0, 1.);






//--------------------------------------------
  //Geometry of the Models
  //--------------------------------------------

//Hyperboloid Model

//there is a hyperbolic dot product on the slices tho
  float hypDot(vec4 u, vec4 v){
    return -u.x*v.x - u.y*v.y + u.z*v.z; // Neg Lorentz Dot
  }

//norm of a point in the xyz minkowski space
float hypNorm(vec4 v){
    return sqrt(abs(hypDot(v,v)));
}

//distance between two points projections into hyperboloid:
float hypDist(vec4 u, vec4 v){
     float bUV = hypDot(u,v);
    return acosh(bUV);
}

//norm of a point in the Euclidean direction
float eucDist(vec4 u,vec4 v){
    return abs(u.w-v.w);
}


//There won't be a geomDot here:
//Need to replace its uses in finding distance
  float geomDot(vec4 u, vec4 v){
    return -u.x*v.x - u.y*v.y + u.z*v.z; // Neg Lorentz Dot
  }

//There is NO NORM on this geometry (we aren't the leve set of anything.  This needs to go.)
  float geomNorm(vec4 v){
    return sqrt(abs(geomDot(v,v)));
  }



//dot product on the tangent spaces to H2xE
  float tangDot(vec4 u, vec4 v){
    return u.x*v.x + u.y*v.y - u.z*v.z + u.w*v.w; // Lorentz Dot for xyz, cartesian product with w-direction
  }


//Project onto the Klein Model, for each hyperbolic slice, which here means dividing by the z coordinate.
  vec4 modelProject(vec4 u){
    return u/u.z;
  }



//THESE SHOULD BE GOOD

  //--------------------------------------------
  //Geometry of Space
  //--------------------------------------------
  
//project point back onto the geometry: project onto hyperboloid, leave w direction unchanged.
  vec4 geomNormalize(vec4 u){
    return vec4(u.x/hypNorm(u),u.y/hypNorm(u),u.z/hypNorm(u),u.w);
  }

  
//measure the distance between two points in the geometry
  float geomDistance(vec4 u, vec4 v){
    return sqrt(eucDist(u,v)*eucDist(u,v)+hypDist(u,v)*hypDist(u,v));
  }

  float lightAtt(float dist){//light intensity as a fn of distance
      return dist; //fake linear falloff (worry about this later)
  }




//THESE SHOULD BE GOOD

  //--------------------------------------------
  //Geometry of the Tangent Space
  //--------------------------------------------

//calculate the length of a tangent vector
  float tangNorm(vec4 v){
    return sqrt(abs(tangDot(v,v)));
  }
  
//create a unit tangent vector in a given direction
  vec4 tangNormalize(vec4 u){
    return u/tangNorm(u);
  }
  
float cosAng(vec4 u, vec4 v){
    return tangDot(u,v);
}

mat4 tangBasis(vec4 p){
    vec4 basis_x = tangNormalize(vec4(p.z,0.0,p.x,0.0));  
      vec4 basis_y = vec4(0.0,p.z,p.y,0.0);  
      vec4 basis_z = vec4(0.0,0.0,0,1);  
    //make this orthonormal
      basis_y = tangNormalize(basis_y - cosAng(basis_y, basis_x)*basis_x); // need to Gram Schmidt but only one basis vector: the final direction is obvious!
      mat4 theBasis=mat4(0.);
      theBasis[0]=basis_x;
      theBasis[1]=basis_y;
      theBasis[2]=basis_z;
    return theBasis;
}











  //-------------------------------------------------------
  //GEODESIC FUNCTIONS
  //-------------------------------------------------------

//give the unit tangent to geodesic connecting u to v.
  vec4 tangDirection(vec4 u, vec4 v){
    vec4 w = v - geomDot(u,v)*u;
    return tangNormalize(w);
  }

  // Get point at distance dist on the geodesic from u in the direction vPrime
  vec4 geodesicEndpt(vec4 u, vec4 vPrime, float dist){
    return u*cosh(dist) + vPrime*sinh(dist);
  }
  
//get unit tangent vec at endpt of geodesic
  vec4 tangToGeodesicEndpt(vec4 u, vec4 vPrime, float dist){
    return u*sinh(dist) + vPrime*cosh(dist);
  }






  
  //---------------------------------------------------------------------
  //Raymarch Primitives
  //---------------------------------------------------------------------
  // A horosphere can be constructed by offseting from a standard horosphere.
  // Our standard horosphere will have a center in the direction of lightPoint
  // and go through the origin. Negative offsets will shrink it.
  float horosphereHSDF(vec4 samplePoint, vec4 lightPoint, float offset){
    return log(-geomDot(samplePoint, lightPoint)) - offset;
  }//im assuming the log here measures distance somehow (hence geomdot....log probably related to acosh somehow)
  
  float sphereSDF(vec4 samplePoint, vec4 center, float radius){
    return geomDistance(samplePoint, center) - radius;
  }


//NEXT: We are going to determine which of these functions gets used for building the cube (deleting centers/corners)

float centerSDF(vec4 samplePoint, vec4 cornerPoint, float size){
    return sphereSDF(samplePoint, cornerPoint,size);
}

float vertexSDF(vec4 samplePoint, vec4 cornerPoint, float size){
    return  horosphereHSDF(samplePoint, cornerPoint, size);
}

























 //--------------------------------------------
  //NOT GEOM DEPENDENT
  //--------------------------------------------


 //--------------------------------------------
  //Global Constants
  //--------------------------------------------
  const int MAX_MARCHING_STEPS = 48;
  const float MIN_DIST = 0.0;
  const float MAX_DIST = 100.0;
  const float EPSILON = 0.0001;
  const float fov = 90.0;
  



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
//NEED SOMETHING FOR THE REAL NUMBER COMPONENTS
  uniform mat4 currentBoost;
  uniform mat4 facing;
  uniform mat4 cellBoost; 
  uniform mat4 invCellBoost;
  //--------------------------------------------
  //Lighting Variables & Global Object Variables
  //--------------------------------------------
  uniform vec4 lightPositions[4];
  uniform vec4 lightIntensities[4];
  uniform mat4 globalObjectBoost;





































  
  //---------------------------------------------------------------------
  //Scene Definitions
  //---------------------------------------------------------------------
  float localSceneSDF(vec4 samplePoint){
    float sphere = centerSDF(samplePoint, ORIGIN, centerSphereSize);
   // float vertexSphere = 0.0;
   // vertexSphere = vertexSDF(abs(samplePoint), modelCubeCorner, vertexSphereSize);
   // float final = -min(vertexSphere,sphere); 
//unionSDF
      float final=-sphere;
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


  // This function is intended to be hyp-agnostic.
  // We should update some of the variable names.
  bool isOutsideCell(vec4 samplePoint, out mat4 fixMatrix){
    vec4 modelSamplePoint = modelProject(samplePoint); //project to klein
    if(modelSamplePoint.x > modelHalfCube){
      fixMatrix = invGenerators[0];
      return true;
    }
    if(modelSamplePoint.x < -modelHalfCube){
      fixMatrix = invGenerators[1];
      return true;
    }
    if(modelSamplePoint.y > modelHalfCube){
      fixMatrix = invGenerators[2];
      return true;
    }
    if(modelSamplePoint.y < -modelHalfCube){
      fixMatrix = invGenerators[3];
      return true;
    }
    if(modelSamplePoint.z > modelHalfCube){
      fixMatrix = invGenerators[4];
      return true;
    }
    if(modelSamplePoint.z < -modelHalfCube){
      fixMatrix = invGenerators[5];
      return true;
    }
    return false;
  }


























 //--------------------------------------------
  //GEOM DEPENDENT
  //--------------------------------------------




  
  //NORMAL FUNCTIONS ++++++++++++++++++++++++++++++++++++++++++++++++++++
  vec4 estimateNormal(vec4 p) { // normal vector is in tangent hyperplane to hyperboloid at p
      // float denom = sqrt(1.0 + p.x*p.x + p.y*p.y + p.z*p.z);  // first, find basis for that tangent hyperplane
      float newEp = EPSILON * 10.0;
      mat4 theBasis= tangBasis(p);
      vec4 basis_x = theBasis[0];
      vec4 basis_y = theBasis[1];
      vec4 basis_z = theBasis[2];
      if(hitWhich != 3){ //global light scene
        return tangNormalize( //p+EPSILON*basis_x should be lorentz normalized however it is close enough to be good enough
          basis_x * (globalSceneSDF(p + newEp*basis_x) - globalSceneSDF(p - newEp*basis_x)) +
          basis_y * (globalSceneSDF(p + newEp*basis_y) - globalSceneSDF(p - newEp*basis_y)) +
          basis_z * (globalSceneSDF(p + newEp*basis_z) - globalSceneSDF(p - newEp*basis_z)));
      }
      else{ //local scene
        return tangNormalize(
          basis_x * (localSceneSDF(p + newEp*basis_x) - localSceneSDF(p - newEp*basis_x)) +
          basis_y * (localSceneSDF(p + newEp*basis_y) - localSceneSDF(p - newEp*basis_y)) +
          basis_z * (localSceneSDF(p + newEp*basis_z) - localSceneSDF(p - newEp*basis_z)));
      }
  }
  




























 //--------------------------------------------
  // NOT GEOM DEPENDENT
  //--------------------------------------------

 void raymarch(vec4 rO, vec4 rD, out mat4 totalFixMatrix){
    mat4 fixMatrix;
    float globalDepth = MIN_DIST; 
    float localDepth = globalDepth;
    vec4 localrO = rO; 
    vec4 localrD = rD;
    totalFixMatrix = mat4(1.0);

    // Trace the local scene, then the global scene:
    for(int i = 0; i < MAX_MARCHING_STEPS; i++){
      vec4 localEndPoint = 
          geodesicEndpt(localrO, localrD, localDepth);
        
      if(isOutsideCell(localEndPoint, fixMatrix)){
        totalFixMatrix = fixMatrix * totalFixMatrix;
        vec4 localEndTangent = tangToGeodesicEndpt(localrO, localrD, localDepth);
        localrO = geomNormalize(fixMatrix * localEndPoint);
          //the version working in the other geometries is below.
          //there is flickering when we do this in hyperbolic space though
        //  localrD = tangNormalize(fixMatrix * localEndTangent);
          //used to be this, which seems to work better here
          localrD=tangDirection(localrO, fixMatrix * localEndTangent);
        localDepth = MIN_DIST;
      }
      else{
        float localDist = min(0.5,localSceneSDF(localEndPoint));
        if(localDist < EPSILON){
          hitWhich = 3;
          sampleEndPoint = localEndPoint;
          sampleTangentVector = tangToGeodesicEndpt(localrO, localrD, localDepth);
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
      vec4 globalEndPoint = geodesicEndpt(rO, rD, globalDepth);
      float globalDist = globalSceneSDF(globalEndPoint);
      if(globalDist < EPSILON){
        // hitWhich has now been set
        totalFixMatrix = mat4(1.0);
        sampleEndPoint = globalEndPoint;
        sampleTangentVector = tangToGeodesicEndpt(rO, rD, globalDepth);
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
    vec4 L = tangDirection(SP, TLP);
    vec4 R = 2.0*cosAng(L, N)*N-L;
    //Calculate Diffuse Component
    float nDotL = max(cosAng(N, L),0.0);
    vec3 diffuse = lightIntensity.rgb * nDotL;
    //Calculate Specular Component
    float rDotV = max(cosAng(R, V),0.0);
    vec3 specular = lightIntensity.rgb * pow(rDotV,10.0);
    //Attenuation - Inverse Square
    float distToLight = geomDistance(SP, TLP);
    float att = 0.6*lightIntensity.w /(0.01 + lightAtt(distToLight));
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

  vec4 getRayPoint(vec2 resolution, vec2 fragCoord, bool isLeft){ //creates a tangent vector for our ray 
    if(isStereo == 1){
      resolution.x = resolution.x * 0.5;
      if(!isLeft) { fragCoord.x = fragCoord.x - resolution.x; }
    }
    vec2 xy = 0.2*((fragCoord - 0.5*resolution)/resolution.x);
    float z = 0.1/tan(radians(fov*0.5));
    vec4 v =  tangNormalize(vec4(xy,-z,0.0));
    return v;
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
    
    if(isStereo == 1){
        rayOrigin = facing * rayOrigin;
    }
    rayOrigin = currentBoost * rayOrigin;
    rayDirV = facing * rayDirV;
    rayDirV = currentBoost * rayDirV;
    //generate direction then transform to hyperboloid ------------------------
//    vec4 rayDirVPrime = tangDirection(rayOrigin, rayDirV);
    //get our raymarched distance back ------------------------
    mat4 totalFixMatrix = mat4(1.0);
    raymarch(rayOrigin, rayDirV, totalFixMatrix);
  
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