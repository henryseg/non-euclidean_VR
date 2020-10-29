//----------------------------------------------------------------------------------------------------------------------
// Raymarch Primitives
//----------------------------------------------------------------------------------------------------------------------



//Designed by IQ to make quick smooth minima
//found at http://www.viniciusgraciano.com/blog/smin/

// Polynomial smooth minimum by iq
float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5*(a-b)/k, 0.0, 1.0);
  return mix(a, b, h) - k*h*(1.0-h);
}

float smax(float a, float b, float k) {
  return -smin(-a,-b,k);
}






float sphereSDF(vec4 p, float radius){
    return sqrt(exp(-2.*p.z)*p.x*p.x+exp(2.*p.y)*p.y*p.y+p.z*p.z) - radius;
}


float halfSpZ(vec4 p, float h) {
    //signed distance function to the half space z < h
    return p.z - h;
}


float hypSheetX(vec4 p,float a){
    return asinh((p.x-a)*exp(-p.z));
}

float hypSheetY(vec4 p,float a){
    return asinh((p.y-a)*exp(p.z));
}


float pillarZ(vec4 p, float lX,float lY){
    //x slab
    float d1=hypSheetX(p,lX);
    float d2=-hypSheetX(p,-1.*lX);
    float distX=max(d1,d2);
    
    //y slab
    d1=hypSheetY(p,lY);
    d2=-hypSheetY(p,-1.*lY);
    float distY=max(d1,d2);
    
    return smax(distX,distY,0.03);
        
}

float pillarX(vec4 p, float lY,float lZ){
    //y slab
    float d1=hypSheetY(p,lY);
    float d2=-hypSheetY(p,-lY);
    float distY=max(d1,d2);
    
    //x slab
    d1=halfSpZ(p,lZ);
   d2=-halfSpZ(p,-1.*lZ);
    float distZ=max(d1,d2);
    
    return smax(distY,distZ,0.03);
        
}

float pillarY(vec4 p, float lX,float lZ){
    //x slab
    float d1=hypSheetX(p,lX);
    float d2=-hypSheetX(p,-lX);
    float distX=max(d1,d2);
    
    //z slab
    d1=halfSpZ(p,lZ);
   d2=-halfSpZ(p,-1.*lZ);
    float distZ=max(d1,d2);
    
    return smax(distX,distZ,0.03);
        
}

float cube(vec4 p,vec4 center,float lX,float lY, float lZ){
    
    p=translate(makeInvLeftTranslation(center),p);
    
    float d1=hypSheetX(p,lX);
    float d2=-hypSheetX(p,-1.*lX);
    float distX=max(d1,d2);
       
        
    d1=hypSheetY(p,lY);
   d2=-hypSheetY(p,-1.*lY);
    float distY=max(d1,d2);
        
        
                
    d1=halfSpZ(p,lZ);
   d2=-halfSpZ(p,-1.*lZ);
    float distZ=max(d1,d2);
        
 return smax(distZ,smax(distX,distY,0.03),0.03);
        
}

//----------------------------------------------------------------------------------------------------------------------
// Global Variables
//----------------------------------------------------------------------------------------------------------------------
tangVector N;//normal vector
tangVector sampletv;
vec4 globalLightColor;
Isometry identityIsometry=Isometry(mat4(1.0));

Isometry currentBoost;
Isometry leftBoost;
Isometry rightBoost;
Isometry cellBoost;
Isometry invCellBoost;
Isometry globalObjectBoost;



//----------------------------------------------------------------------------------------------------------------------
// Scene Definitions
//----------------------------------------------------------------------------------------------------------------------

float lX=0.1;
float lY=0.1;
float lZ=0.1;



float dCUBE(vec4 p,vec4 center){
    
    float dX;
    float dY;
    float dZ;
    
    
    vec4 q=translate(makeInvLeftTranslation(center),p);
    
    //dist to xy plane
    float expZ=exp(q.z);
   dZ=max(q.z-lZ,-(q.z+lZ));
    
    //dist to Y hyperbolic sheet
    dX=max(asinh((q.x-lX)/expZ),-asinh((q.x+lX)/expZ));
    
    //dist to X hyperbolic sheet
  dY=max(asinh((q.y-lY)*expZ),-asinh((q.y+lY)*expZ));
    
    //dist to Cube
  return smax(smax(dX,dY,0.01),dZ,0.01);
    
    
}

int cubeNumber;

float localSceneSDF(vec4 p){
    float distance1;
    float distance2;
    
  distance1=dCUBE(p,vec4(0.1,0.05,-0.25,1.));
               

    if(distance1<EPSILON){
        hitWhich=3;
        cubeNumber=1;
        return distance1;
    }
                 
    distance2=dCUBE(p,vec4(0.05,-0.1,0.15,1.));
    
    
    if(distance2<EPSILON){
        hitWhich=3;
        cubeNumber=2;
        return distance2;
    }
    
    return min(distance1,distance2);

//    float d1=hypSheetX(p,0.5);
//    float d2=-hypSheetX(p,-0.5);
//    float distX=max(d1,d2);
//       
//        
//    d1=hypSheetY(p,0.5);
//   d2=-hypSheetY(p,-0.5);
//    float distY=max(d1,d2);
//        
//        
//                
//    d1=halfSpZ(p,0.5);
//   d2=-halfSpZ(p,-0.5);
//    float distZ=max(d1,d2);
//        
//  distance=smax(distZ,smax(distX,distY,0.1),0.1);
//        
//        if(distance<EPSILON){
//            hitWhich=3;
//            
//            
//            if(distX>distY&&distX>distZ){
//                planeNumber=1;
//            }
//            
//                if(distY>distX&&distY>distZ){
//                planeNumber=2;
//            }
//            
//            
//            
//                      if(d1>distX&&d1>distY){
//                planeNumber=3;
//            }
//            
//                       if(d2>distX&&d2>distY){
//                planeNumber=4;
//            }
//            
//            
//            
//            
//            
//            return distance;
//            
//        }
//        
//
//          
// 
//
//    
//    return distance;
}

//GLOBAL OBJECTS SCENE ++++++++++++++++++++++++++++++++++++++++++++++++
// Global signed distance function : distance from cellBoost * p to an object in the global scene
float globalSceneSDF(vec4 p){

     return MAX_DIST;
}
