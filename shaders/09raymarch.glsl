


//----------------------------------------------------------------------------------------------------------------------
// Teleporting Back to Central Cell when raymarching the local scene
//----------------------------------------------------------------------------------------------------------------------


// check if the given point p is in the fundamental domain of the lattice.
// if it is not, then use one of the generlators to translate it back

bool isOutsideCell(vec4 p, out Isometry fixMatrix){
    //vec4 ModelP= modelProject(p);
    
    //lattice basis divided by the norm square
 //right now norm square is 1 so haven't put that in yet.
    vec4 v1 = V1;
    vec4 v2 = V2;
    vec4 v3 = V3;

    //right now this turns off the vertical translation generators for rendering the "plane" scene.  Need a better way of doing this in general, to be able to turn off some at will.
    //if (display!=2){
        if (dot(p, v3) > 0.5) {
            fixMatrix = Isometry(invGenerators[4]);
            return true;
        }
        if (dot(p, v3) < -0.5) {
            fixMatrix = Isometry(invGenerators[5]);
            return true;
        }
   // }

    if (dot(p, v1) > 0.5) {
        fixMatrix = Isometry(invGenerators[0]);
        return true;
    }
    if (dot(p, v1) < -0.5) {
        fixMatrix = Isometry(invGenerators[1]);
        return true;
    }
    if (dot(p, v2) > 0.5) {
        fixMatrix = Isometry(invGenerators[2]);
        return true;
    }
    if (dot(p, v2) < -0.5) {
        fixMatrix = Isometry(invGenerators[3]);
        return true;
    }
    return false;
}


// overload of the previous method with tangent vector
bool isOutsideCell(tangVector v, out Isometry fixMatrix){
    return isOutsideCell(v.pos, fixMatrix);
}


// overload of the previous method with local tangent vector
bool isOutsideCell(localTangVector v, out Isometry fixMatrix){
    return isOutsideCell(v.pos, fixMatrix);
}










//----------------------------------------------------------------------------------------------------------------------
// Measuring the  distance to the nearest wall of the fundamental domain
//----------------------------------------------------------------------------------------------------------------------


//fundamental domain  right  now is the cube of slide length   1 centered at the origin.
//that means, the distance to each wall is  
//in improved implementation; use the SDFs  for half spaces!
  float distToEdge(vec4 p){
      
      float d1=min(
          p.x+0.5,
          0.5-p.x
      );
      
            float d2=min(
          p.y+0.5,
          0.5-p.y
      );
      
            float d3=min(
          p.z+0.5,
          0.5-p.z
      );
      
      return min(d1,min(d2,d3));
      
  }

      



















//--------------------------------------------
// DOING THE RAYMARCH
//--------------------------------------------

// each step is the march is made from the previously achieved position,
// in contrast to starting over from currentPosition each time, and just tracing a longer distance.
//this is helpful in sol - but might lead to more errors accumulating when done in hyperbolic for example?




void raymarch(tangVector rayDir, out Isometry totalFixMatrix){
    Isometry fixMatrix;
    float marchStep = MIN_DIST;
    float globalDepth = MIN_DIST;
    float localDepth = MIN_DIST;
    distToViewer=MAX_DIST;
    
    tangVector localtv = rayDir;
    tangVector globaltv = rayDir;
    
    totalFixMatrix = identityIsometry;


    //before you start the march, step out by START_MARCH to make the bubble around your head
    localtv=geoFlow(localtv,START_MARCH);
    globaltv=geoFlow(globaltv,START_MARCH);
    
    
// Trace the local scene, then the global scene:
    if(TILING_SCENE){
    marchStep = MIN_DIST;
        
    for (int i = 0; i < MAX_MARCHING_STEPS; i++){
        
        //flow along the geodesic from your current position by the amount march step allows
        localtv = geoFlow(localtv, marchStep);

        if (isOutsideCell(localtv, fixMatrix)){
            //if you are outside of the central cell after the march done above
            //then translate yourself back into the central cell and set the next marching distance to a minimum
            totalFixMatrix = composeIsometry(fixMatrix, totalFixMatrix);
            localtv = translate(fixMatrix, localtv);
            marchStep = MIN_DIST;
        }
        
        else {//if you are still inside the central cell
            //find the distance to the local scene
            float localDist = localSceneSDF(localtv.pos);
            
            if (localDist < EPSILON||localDist>MAX_DIST){//if you hit something, or left the range completely
                distToViewer=localDepth;//set the total distance marched
                sampletv = localtv;//give the point reached
                break;
            }
            //if its not less than epsilon, keep marching
            
            //find the distance to  a wall of the fundamental chamber
            float wallDist=distToEdge(localtv.pos);
            //we want to let ourselves march either (1) just SLIGHTLY over the wall so we get teleported back, or (2) a little less than the SDF output, for safety.            
            marchStep = min(wallDist+0.1,marchProportion*localDist);//make this distance your next march step
            //marchStep=marchProportion*localDist;
            localDepth += marchStep;//add this to the total distance traced so far

        }
    }
        //set the local depth (how far you marched total in the local scene)
        //for use in marching the global scene below
    localDepth=min(localDepth, MAX_DIST);
    }
    else{localDepth=MAX_DIST;}//if you didn't march the tiling scene at all, then set this distance to max to make sure we see whatever is in the global scene when we trace it next.


    if(GLOBAL_SCENE){
    marchStep = MIN_DIST;
        
    for (int i = 0; i < MAX_MARCHING_STEPS; i++){
        globaltv = geoFlow(globaltv, marchStep);

        float globalDist = globalSceneSDF(globaltv.pos);
         
        if (globalDist < EPSILON||globalDist>MAX_DIST){
            // hitWhich has now been set
            totalFixMatrix = identityIsometry;//we are not in the local scene, so have no fix matrix
            distToViewer=globalDepth;//set the total distance marched
            sampletv = globaltv;//give the point reached
            return; 
        }
        //if not, add this to  your total distance traveled and march ahead by this amount 
         marchStep = marchProportion*globalDist;//make this distance your next march step
        globalDepth += marchProportion*globalDist;//add this to the total distance traced so far
      
        if (globalDepth >= localDepth){
            //if you have marched farther than you did in the local scene, the global object is behind something already, so stop.
            break;
        }
    }
    }
}







//--------------------------------------------
// RAYMARCHING A REFLECTION
//--------------------------------------------

//a cheaper variation on the raymarch for use in reflections.
//only runs on the local scene, and does so with less resolution, by only running MAX_REFL_MARCH number of times, and 
//only traveling out MAX_REFL_DIST amount of time whiel also having a more generous threshhold than the standard epsilon
//
void reflectmarch(tangVector rayDir, out Isometry totalFixMatrix){
    Isometry fixMatrix;
    totalFixMatrix = identityIsometry;
    
    float globalDepth = MIN_DIST;
    float localDepth = MIN_DIST;
    distToViewer=MAX_REFL_DIST;
    float marchStep;
    
    
    tangVector localtv = rayDir;
    tangVector globaltv = rayDir;
    float newEp = EPSILON * 5.0;
    
   
// Trace the local scene, then the global scene:
    if(TILING_SCENE){
        marchStep = newEp;//make first step tiny, but still push off the surface
        
    for (int i = 0; i < MAX_REFL_STEPS; i++){
        
        localtv = geoFlow(localtv, marchStep);

        if (isOutsideCell(localtv, fixMatrix)){
            //if you are outside of the central cell after the march done above
            //then translate yourself back into the central cell and set the next marching distance to a minimum
            totalFixMatrix = composeIsometry(fixMatrix, totalFixMatrix);
            localtv = translate(fixMatrix, localtv);
            marchStep = MIN_DIST;
        }
        
        else {//if you are still inside the central cell
            //set the local distance to a portion of the sceneSDF
            float localDist = localSceneSDF(localtv.pos,newEp);
            
            if (localDist < newEp||localDist>MAX_REFL_DIST){//if you hit something
                //setting epsilon like this might not trigger the global scene SDF to set hitWhich now though....
                distToViewer=localDepth;//set the total distance marched
                sampletv = localtv;//give the point reached
                return;
            }
            
            
            //if its not less than epsilon, keep marching
            
            
            //do we want to stop at the fundamental domain edge right away? or just keep marching and let fixOutsideCentralCell take care of it
            //I think there are issues with non-spherically symmetric distance functions in the first way, but its faster, and probably fine for reflections
            //in any case, the second option is commented out below:
            
            
            marchStep = 0.9*localDist;//make this distance your next march step
           localDepth += marchStep;//add this to the total distance traced so far
            
            //find the distance to  a wall of the fundamental chamber
//            float wallDist=distToEdge(localtv.pos);
//            //we want to let ourselves march either (1) just SLIGHTLY over the wall so we get teleported back, or (2) a little less than the SDF output, for safety.            
//            marchStep = min(wallDist+0.2,0.9*localDist);//make this distance your next march step
//            //marchStep=marchProportion*localDist;
//            localDepth += marchStep;//add this to the total distance traced so far
            
            
            

        }
    }
        
    }
    
     else{localDepth=MAX_REFL_DIST;}//if you didn't march the tiling scene at all, then set this distance to max to make sure we see whatever is in the global scene when we trace it next.


    if(GLOBAL_SCENE){
    marchStep = newEp;
        
    for (int i = 0; i < MAX_REFL_STEPS; i++){
        globaltv = geoFlow(globaltv, marchStep);

        float globalDist = globalSceneSDF(globaltv.pos);
         
        if (globalDist < newEp||globalDist>MAX_REFL_DIST){
            // hitWhich has now been set
            totalFixMatrix = identityIsometry;//we are not in the local scene, so have no fix matrix
            distToViewer=globalDepth;//set the total distance marched
            sampletv = globaltv;//give the point reached
            return; 
        }
        //if not, add this to  your total distance traveled and march ahead by this amount 
         marchStep = 0.9*globalDist;//make this distance your next march step
        globalDepth += 0.9*globalDist;//add this to the total distance traced so far
      
        if (globalDepth >= localDepth){
            //if you have marched farther than you did in the local scene, the global object is behind something already, so stop.
            break;
        }
    }
    }
}








//--------------------------------------------
// RAYMARCHING A SHADOW
//--------------------------------------------

//first attempt at raymarching shadows
float shadowMarch(tangVector toLight, float distToLight)
    {
    Isometry fixMatrix;
    
    float localDist=0.;
    float localDepth=0.;
    
    float marchStep=EPSILON;
    float newEp = 5.*EPSILON;
    
    //start the march on the surface pointed at the light
    //but marched out a little bit so it doesn't immediately report "zero" as the distance to local scene
    tangVector localtv=geoFlow(toLight,0.1);
    
    for (int i = 0; i < MAX_SHADOW_STEPS; i++){

     localtv = geoFlow(localtv, marchStep);   
//        
     if (isOutsideCell(localtv, fixMatrix)){
            //if you are outside of the central cell after the march done above
            //then translate yourself back into the central cell and set the next marching distance to a minimum
            localtv = translate(fixMatrix, localtv);
            marchStep = newEp;
        } 
        
   else {//if you are still inside the central cell
            
            //set the local distance to a portion of the sceneSDF
            float localDist = localSceneSDF(localtv.pos,newEp);
       
            //if you've made it to the light
       //subtract some bit from this - as otherwise since the light is a part of the local scene,
       //you always end up reaching the local scene! and thus the this algorithm thinks you're in shadow.
       //so for now, we fix this by only letting you get  "mostly" to the light (say, the radius of the light)
            if(localDepth>distToLight-0.5){
                return 1.;
            }
       
       
            //if you've hit something 
            if (localDist <newEp){//if you hit something
                return 0.;
            }

            //if neither of these, march  onwards
                marchStep = 0.9*localDist;//make this distance your next march step
                localDepth += marchStep;//add this to the total distance traced so far
            
        } 
    }
    
    //if you somehow run out of steps before reaching an object or a lightsource
    return 1.0;

}




//improving the shadows using some ideas of iq on shadertoy
float softShadowMarch(in tangVector toLight, float distToLight, float k)
    {
    Isometry fixMatrix;
    
    float shade=1.;
    float  localDist;
    float localDepth=0.;
    
    float marchStep;
    float newEp = EPSILON * 5.0;
    
    //start the march on the surface pointed at the light
    tangVector localtv=geoFlow(toLight,0.1);
    
    for (int i = 0; i < MAX_SHADOW_STEPS; i++){

     localtv = geoFlow(localtv, marchStep);   
        
     if (isOutsideCell(localtv, fixMatrix)){
            //if you are outside of the central cell after the march done above
            //then translate yourself back into the central cell and set the next marching distance to a minimum
            localtv = translate(fixMatrix, localtv);
            marchStep = newEp;
        } 
        
        else {//if you are still inside the central cell
            
                        //if neither of these, march  onwards
            marchStep = 0.9*localDist;//make this distance your next march step
            localDepth += marchStep;//add this to the total distance traced so far
            
            
            //set the local distance to a portion of the sceneSDF
            float localDist = localSceneSDF(localtv.pos,newEp);
             shade = min(shade, smoothstep(0.,1.,k*localDist/localDepth)); 
            //if you've hit something 
            if (localDist < newEp|| localDepth>distToLight-0.5){//if you hit something
                break;
            }


            
        } 
    }
    
    //at the end, return this value for the shadow deepness
    return clamp(shade,0.,1.); 

}








//
//
//
//
//
//
////OLD RAYMARCHER WITH A BINARY-SEARCH WAY  OF FINDING THE FUNDAMENTAL DOMAIN.
//
//
//int BINARY_SEARCH_STEPS=20;
//
//void raymarch(localTangVector rayDir, out Isometry totalFixMatrix){
//
//    Isometry fixMatrix;
//    Isometry testFixMatrix;
//    float marchStep = MIN_DIST;
//    float testMarchStep = MIN_DIST;
//    float globalDepth = MIN_DIST;
//    float localDepth = MIN_DIST;
//    localTangVector tv = rayDir;
//    localTangVector localtv = rayDir;
//    localTangVector testlocaltv = rayDir;
//    localTangVector bestlocaltv = rayDir;
//    totalFixMatrix = identityIsometry;
//    // Trace the local scene, then the global scene:
//
//    if (TILING_SCENE){
//        
//        
//        
//        for (int i = 0; i < MAX_MARCHING_STEPS; i++){
//            float localDist = localSceneSDF(localtv.pos);
//            
//            
//            if (localDist < EPSILON){
//                sampletv = toTangVector(localtv);
//                distToViewer=globalDepth;
//                  break;
//              }
//              marchStep = localDist;
//            
//            //localtv = flow(localtv, marchStep);
//
////            if (isOutsideCell(localtv, fixMatrix)){
////                totalFixMatrix = composeIsometry(fixMatrix, totalFixMatrix);
////                localtv = translate(fixMatrix, localtv);
////                localtv=tangNormalize(localtv);
////                marchStep = MIN_DIST;
////            }
//            
//        testlocaltv = geoFlow(localtv, marchStep);
//        if (isOutsideCell(testlocaltv, fixMatrix)){
//            bestlocaltv = testlocaltv;
//            
//            for (int j = 0; j < BINARY_SEARCH_STEPS; j++){
//              ////// do binary search to get close to but outside this cell - 
//              ////// dont jump too far forwards, since localSDF can't see stuff in the next cube
//              testMarchStep = marchStep - pow(0.5,float(j+1))*localDist;
//              testlocaltv = geoFlow(localtv, testMarchStep);
//              if ( isOutsideCell(testlocaltv, testFixMatrix) ){
//                marchStep = testMarchStep;
//                bestlocaltv = testlocaltv;
//                fixMatrix = testFixMatrix;
//              }
//            }
//            
//            localtv = bestlocaltv;
//            totalFixMatrix = composeIsometry(fixMatrix, totalFixMatrix);
//            localtv = translate(fixMatrix, localtv);
//            localtv=tangNormalize(localtv);
//            //globalDepth += marchStep; 
//            marchStep = MIN_DIST;
//      }
//            
//                  else{ 
//          localtv = testlocaltv; 
//          globalDepth += marchStep; 
//        }
//      }
//      localDepth=min(globalDepth, MAX_DIST);
//    }
//    else{localDepth=MAX_DIST;}
//
//
//    if (GLOBAL_SCENE){
//        globalDepth = MIN_DIST;
//        marchStep = MIN_DIST;
//
//        for (int i = 0; i < MAX_MARCHING_STEPS; i++){
//            tv = geoFlow(tv, marchStep);
//
//            float globalDist = globalSceneSDF(tv.pos);
//            if (globalDist < EPSILON){
//                // hitWhich has now been set
//                totalFixMatrix = identityIsometry;
//                sampletv = toTangVector(tv);
//                distToViewer=globalDepth;
//                //hitWhich = 5;
//                //debugColor = 0.1*vec3(globalDepth, 0, 0);
//                return;
//            }
//            marchStep = globalDist;
//            globalDepth += globalDist;
//            if (globalDepth >= localDepth){
//                //hitWhich = 5;
//                //debugColor = vec3(0, globalDepth, 0);
//                break;
//            }
//        }
//
//    }
//}
//
//











