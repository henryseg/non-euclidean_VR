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
    
    

    
    //two spheres translated up and down:
    Point pt0=Point(vec4(1, 0, 0, 0), 0.);
    Point pt1=Point(vec4(1, 0, 0, 0),6.28/9.);
    Point pt2=Point(vec4(1, 0, 0, 0), 6.28/9.);
    Point pt3=Point(vec4(1, 0, 0, 0), 2.*6.28/9.);
    Point pt4=Point(vec4(1, 0, 0, 0), -2.*6.28/9.);
        Point pt5=Point(vec4(1, 0, 0, 0), 3.*6.28/9.);
    Point pt6=Point(vec4(1, 0, 0, 0), -3.*6.28/9.);
            Point pt7=Point(vec4(1, 0, 0, 0), 4.*6.28/9.);
    Point pt8=Point(vec4(1, 0, 0, 0), -4.*6.28/9.);
    
    distance=sphereSDF(p,pt0,2.25);
   distance=min(distance,sphereSDF(p,pt1,2.));
    distance=min(distance,sphereSDF(p,pt2,2.));
    distance=min(distance,sphereSDF(p,pt3,2.));
       distance=min(distance,sphereSDF(p,pt4,2.));
        distance=min(distance,sphereSDF(p,pt5,2.));
       distance=min(distance,sphereSDF(p,pt6,2.));
            distance=min(distance,sphereSDF(p,pt7,2.));
       distance=min(distance,sphereSDF(p,pt8,2.));
    
    
    distance=min(distance,cylSDF(p,1.5));
    distance=-distance;
    
    //NON-PLANE THINGS
  // distance= -ellipsoidSDF(p, 0.9, 2.5);
    //distance=sphereSDF(p,ORIGIN,1.);
        if(distance<EPSILON){
        hitWhich=3;
        planeNumber=3;
        return distance;
    }

   return distance;
}
