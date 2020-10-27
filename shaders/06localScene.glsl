//----------------------------------------------------------------------------------------------------------------------
// Scene Definitions
//----------------------------------------------------------------------------------------------------------------------
// Turn off the local scene
// Local signed distance function : distance from p to an object in the local scene


int planeNumber;

float localSceneSDF(Point p){
    float sphDist;
    float tilingDist;
    float cylDist;
    float lightDist;
    float distance = MAX_DIST;

////
//  if(planes==1){
//      
//      distance=halfSpace(p);
//     distance= halfSpace2(p);
//    if(distance<EPSILON){
//        hitWhich=3;
//        planeNumber=2;
//        return distance;
//    }
//    
//    distance=min(distance,halfSpace3(p));
//        if(distance<EPSILON){
//        hitWhich=3;
//        planeNumber=3;
//        return distance;
//    }
//      
//      return distance;
//      
//  }  
//    
//      if(planes==2){
//      
//      distance=halfSpace(p);
//     distance= halfSpace2(p);
//    if(distance<EPSILON){
//        hitWhich=3;
//        planeNumber=2;
//        return distance;
//    }
//
//      
//      return distance;
//      
//  }  
//    
//      if(planes==3){
//      
//    
//    distance=min(distance,halfSpace3(p));
//        if(distance<EPSILON){
//        hitWhich=3;
//        planeNumber=3;
//        return distance;
//    }
//      
//      return distance;
//      
//  }  
    
    

   
    
    //NON-PLANE THINGS
   distance= -ellipsoidSDF(p, 0.9, 2.5);
    //distance=sphereSDF(p,ORIGIN,1.);
        if(distance<EPSILON){
        hitWhich=3;
        planeNumber=3;
        return distance;
    }

   return distance;
}
