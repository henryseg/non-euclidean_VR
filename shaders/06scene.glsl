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



float lX=0.15;
float lY=0.15;
float lZ=0.25;


float localSceneSDF(vec4 p){
    float distance = MAX_DIST;
    
    float dX;
    float dY;
    float dZ;
    float dCube;
    float dPillars;

    
    //dist to xy plane
    float expZ=exp(p.z);
   dZ=max(p.z-lZ,-(p.z+lZ));
    
    //dist to Y hyperbolic sheet
    dX=max(asinh((p.x-lX)/expZ),-asinh((p.x+lX)/expZ));
    
    //dist to X hyperbolic sheet
  dY=max(asinh((p.y-lY)*expZ),-asinh((p.y+lY)*expZ));
    
    //dist to Cube
   dCube=smax(smax(dX,dY,0.03),dZ,0.03);
    
    
    //subtract pillars from cube
    
    //dist to xSheets
    dX=max(asinh((p.x-0.6*lX)/expZ),-asinh((p.x+0.6*lX)/expZ));
    
     //dist to Y hyperbolic sheet
    dY=max(asinh((p.y-0.6*lY)*expZ),-asinh((p.y+0.6*lY)*expZ));
    
    //dist to Z planes
   dZ=max(p.z-0.6*lZ,-(p.z+0.6*lZ));
   
    
    //distance to pillars
   dPillars=min(min(max(dY,dZ),max(dX,dZ)),max(dX,dY));
    
    distance=smax(dCube,-dPillars,0.03);
    

    if(distance<EPSILON){
        hitWhich=3;
        return distance;
    }
    
    return distance;

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
