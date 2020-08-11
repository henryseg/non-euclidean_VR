//----------------------------------------------------------------------------------------------------------------------
// Scene Definitions
//----------------------------------------------------------------------------------------------------------------------
// Turn off the local scene
// Local signed distance function : distance from p to an object in the local scene

float localSceneSDF(Point p){
    float sphDist;
    float tilingDist;
    float cylDist;
    float lightDist;
    float distance = MAX_DIST;


    lightDist=sphereSDF(p, localLightPos, lightRad);
    distance=min(distance, lightDist);
    if (lightDist < EPSILON){
        //LIGHT=true;
        isLocal=true;
        hitWhich = 1;
        colorOfLight=vec3(1., 1., 1.);
        return lightDist;
    }
    
    
    switch(display){
            
        case 1://ConeTorus
            tilingDist = -ellipsoidSDF(p, 0.5, 4.);
           // tilingDist = sphereSDF(p, ORIGIN, 0.2);
            distance = min(distance, tilingDist);
            if (tilingDist < EPSILON){
                isLocal=true;
                hitWhich=3;
                return tilingDist;
            }
             break;

        case 2://Surface
           // tilingDist = -ellipsoidSDF(p, 0.9, 2.5);
             tilingDist = sphereSDF(p, ORIGIN, 0.5);
           // tilingDist=cylSDF(p,0.5);
            distance = min(distance, tilingDist);
            if (tilingDist < EPSILON){
                isLocal=true;
                hitWhich=3;
                return tilingDist;
            }
             break;
    
        case 3://SL2Z
            tilingDist = -ellipsoidSDF(p, 0.5, 4.);
            //tilingDist = -sphereSDF(p, ORIGIN, PI+0.2);
            distance = min(distance, tilingDist);
            if (tilingDist < EPSILON){
                isLocal=true;
                hitWhich=3;
                return tilingDist;
            }
             break;
            
            
    
        case 4://Fiber
             cylDist = cylSDF(p, 0.4);
    distance = min(distance, cylDist);
    if (cylDist < EPSILON){
        isLocal=true;
        hitWhich=3;
        return cylDist;
    }
        break;
            
//            tilingDist = -ellipsoidSDF(p, 0.5, 4.);
//            //tilingDist = -sphereSDF(p, ORIGIN, PI+0.2);
//            distance = min(distance, tilingDist);
//            if (tilingDist < EPSILON){
//                isLocal=true;
//                hitWhich=3;
//                return tilingDist;
//            }  
        
    }

    // Sphere
    /*
    float aux = 0.;
    Point center = fromVec4(vec4(0., aux, sqrt(1. + aux * aux), 0));
    sphDist = sphereSDF(p, center, 0.1);
    distance = min(distance, sphDist);
    if (sphDist < EPSILON){
        hitWhich = 3;
        return sphDist;
    }
    */


    // Tiling

//    tilingDist = -ellipsoidSDF(p, 0.5, 4.);
//    //tilingDist = -sphereSDF(p, ORIGIN, PI+0.2);
//    distance = min(distance, tilingDist);
//    if (tilingDist < EPSILON){
//        isLocal=true;
//        hitWhich=3;
//        return tilingDist;
//    }


    // Cylinders
    /*
    cylDist = cylSDF(p, 0.4);
    distance = min(distance, cylDist);
    if (cylDist < EPSILON){
        hitWhich=3;
        return cylDist;
    }
    */


    return distance;
}
