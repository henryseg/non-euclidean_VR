//----------------------------------------------------------------------------------------------------------------------
// Scene Definitions
//----------------------------------------------------------------------------------------------------------------------
// Turn off the local scene
// Local signed distance function : distance from p to an object in the local scene


int planeNumber;

float localSceneSDF(Point p){
    float sphDist;
//    float tilingDist;
//    float cylDist;
//    float lightDist;
    float distance = MAX_DIST;
    
    //in addition to the central sphere, how many levels above and below are cut out of a single fundamental domain?
    int level;
   int numSpheres;
    
    float sphereSep;
    float sphereRad;
    float cylDist;

    Point pt;
    
    
//SETTING THE PARAMETERS DEPENDING ON THE SPACE:
    
 if(display==1){//the genus 2 surface group
    level=1;
    numSpheres=2*level+1;
    sphereSep=2.*PI/float(numSpheres);
     
    sphereRad=sphereSep/2.+0.67;
     
    //no cylinder
    //cylDist=1000.;
   
     
 }
    
    if(display==2){//the sphere with cone points:
    level=2;
    numSpheres=2*level+1;
    sphereSep=2.*PI/float(numSpheres);
        
    sphereRad=sphereSep/2.+0.2;
    
    //only need a cylinder if sphere rad is less than sphereSep/2.
    //cylDist=cylSDF(p,0.5);
  }  

  
    //remove the central sphere;
    pt=fromVec4(vec4(0, 0, 0, 0.));
    distance=sphereSDF(p,pt,sphereRad);
    
    numSpheres=2*level+1;
    
    for(int i=1;i<level+1;i++){
        //remove the other levels of spheres:
        
        //level in positive direction
        pt=fromVec4(vec4(0, 0, 0, float(i)*sphereSep));
        sphDist=sphereSDF(p,pt,sphereRad);
        distance=min(distance,sphDist);
        
        //level in negative direction:
        pt=fromVec4(vec4(0, 0, 0, -float(i)*sphereSep));
        sphDist=sphereSDF(p,pt,sphereRad);
        distance=min(distance,sphDist);
        
    }

    
    //if you needed to remove a cylinder do this
    //distance=min(distance,cylDist);
    
    //take the complement to draw the tiling
    distance=-distance;
    

        if(distance<EPSILON){
        hitWhich=3;//coloring choice
        return distance;
    }

   return distance;
}
