//----------------------------------------------------------------------------------------------------------------------
// Scene Definitions
//----------------------------------------------------------------------------------------------------------------------
// Turn off the local scene
// Local signed distance function : distance from p to an object in the local scene


int planeNumber;

float localSceneSDF(Point p){

    float tilingDist;
    float earthDist;

    //in addition to the central sphere, how many levels above and below are cut out of a single fundamental domain?
    int level;
    int numSpheres;
    
    float sphereSep;
    float sphereRad;
    float earthRad;
    
    float cylDist;
    Point pt;
    
float fiberCoord;
    
    
//SETTING THE PARAMETERS DEPENDING ON THE SPACE:
    
 if(display==1){//the genus 2 surface group
    level=1;
    numSpheres=2*level+1;
    sphereSep=2.*PI/float(numSpheres);
     
    sphereRad=sphereSep/2.+0.67;
    earthRad=0.5;
    //no cylinder
    //cylDist=1000.;
   
     
 }
    
    if(display==2){//the sphere with cone points:
    level=2;
    numSpheres=2*level+1;
    sphereSep=2.*PI/float(numSpheres);
        
    sphereRad=sphereSep/2.+0.2;
    earthRad=0.3;
    //only need a cylinder if sphere rad is less than sphereSep/2.
    //cylDist=cylSDF(p,0.5);
  }  

  
    //remove the central sphere;
    pt=fromVec4(vec4(0, 0, 0, 0.));
    tilingDist=sphereSDF(p,pt,sphereRad);
    earthDist=sphereSDF(p,pt,earthRad);
    
    //check if we hit this earth, so we know the fiber height
    if(earthDist<EPSILON){
        fiberHeight=0.;
        hitWhich=2;
        return earthDist;
    }
    
    
    
    numSpheres=2*level+1;
    
    for(int i=1;i<level+1;i++){
        //remove the other levels of spheres:
        fiberCoord= float(i)*sphereSep;
        
        //level in positive direction
        pt=fromVec4(vec4(0, 0, 0, fiberCoord));
        
        earthDist=min(earthDist,sphereSDF(p,pt,earthRad));
        //check if we hit this earth, so we know the fiber height
    if(earthDist<EPSILON){
        fiberHeight=fiberCoord;
        hitWhich=2;
        return earthDist;
    }
        
        //take care of tiling sphere at same height
        tilingDist=min(tilingDist,sphereSDF(p,pt,sphereRad));
        
        
        
        //level in negative direction:
        pt=fromVec4(vec4(0, 0, 0, -fiberCoord));
        
        earthDist=min(earthDist,sphereSDF(p,pt,earthRad));
               //check if we hit this earth, so we know the fiber height
            if(earthDist<EPSILON){
        fiberHeight=-fiberCoord;
        hitWhich=2;
        return earthDist;
    }
        
        
        //take care of tiling sphere at same height
        tilingDist=min(tilingDist,sphereSDF(p,pt,sphereRad));
        
    }

    
    //if you needed to remove a cylinder do this
    //distance=min(distance,cylDist);
    
    //take the complement to draw the tiling
    tilingDist=-tilingDist;
    
        if(tilingDist<EPSILON){
        hitWhich=3;//coloring choice
        return tilingDist;
    }
    

   return min(tilingDist,earthDist);
}
