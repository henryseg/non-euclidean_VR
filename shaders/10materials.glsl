

vec3 vertPlaneColor2(Vector sampletv){
    vec3 color=vec3(0.);
    
    vec3 color1=vec3(245./255.,74./255.,28./255.);//reddish
    vec3 color2=vec3(255./255.,206./255.,31./255.);//yellow
    vec3 color3=0.8*vec3(0./255.,219./255.,218./255.);//turquoise
    vec3 color4=0.8*vec3(1./255.,117./255.,251./255.);//blue
    

    float z=sampletv.pos.fiber;
    float y =asinh(toVec4(sampletv.pos).y);
    float x=asinh(toVec4(sampletv.pos).x);
    //float width=asinh(toKlein(sampletv.pos).y);
    
    //use to draw square pattern in the intensity
    float c1=fract(2.*y/1.+0.25);
    float c2=fract(2.*z/1.+0.25);
    vec3 origColor;
    
   origColor=0.5*vec3((2./3.14*atan(-y)+1.)/2.,(2./3.14*atan(z)+1.)/2.,(2./3.14*atan(z+y)+1.)/2.)+vec3(0.1,0.2,0.35);

    
    
        if(0.3<c1&&c1<0.45&& 0.3<c2&&c2<0.45){
     color=color4;
    }
    
           else if(0.29<c1&&c1<0.46&& 0.29<c2&&c2<0.46){
     color=vec3(0.9);
         //vec3(150./255.,30./255.,17./255.);//dark red
    }
    
    
    else if(0.16<c1&&c1<0.59&& 0.16<c2&&c2<0.59){
     color=color3;
    }
    
        else if(0.14<c1&&c1<0.6&& 0.14<c2&&c2<0.6){
     color=vec3(0.9);
    }
    
    else if(0.01<c1&&c1<0.75&& 0.01<c2&&c2<0.75){
     color=color2;
    }
    else if(c1<0.76&&c2<0.76){
        color=vec3(0.1);
    }
    else{
        color=color1;
    }
    
    return color;
}





vec3 vertPlaneColor3(Vector sampletv){
    vec3 color=vec3(0.);
    
    vec3 color1=0.8*vec3(245./255.,74./255.,28./255.);//reddish
    vec3 color2=vec3(255./255.,206./255.,31./255.);//yellow
    vec3 color3=vec3(0./255.,219./255.,218./255.);//turquoise
    vec3 color4=vec3(1./255.,117./255.,251./255.);//blue
    
    

    float z=sampletv.pos.fiber;
    float y =asinh(toVec4(sampletv.pos).y);
    float x=asinh(toVec4(sampletv.pos).x);
    //float width=asinh(toKlein(sampletv.pos).y);
    
    //use to draw square pattern in the intensity
    float c1=fract(2.*y/1.+0.25);
    float c2=fract(2.*z/1.+0.25);
    vec3 origColor;
    
   origColor=0.5*vec3((2./3.14*atan(-y)+1.)/2.,(2./3.14*atan(z)+1.)/2.,(2./3.14*atan(z+y)+1.)/2.)+vec3(0.1,0.2,0.35);

    
    
        if(0.3<c1&&c1<0.45&& 0.3<c2&&c2<0.45){
     color=color4;
    }
    
           else if(0.29<c1&&c1<0.46&& 0.29<c2&&c2<0.46){
     color=vec3(0.9);
         //vec3(150./255.,30./255.,17./255.);//dark red
    }
    
    
    else if(0.16<c1&&c1<0.59&& 0.16<c2&&c2<0.59){
     color=color2;
    }
    
        else if(0.14<c1&&c1<0.6&& 0.14<c2&&c2<0.6){
     color=vec3(0.9);
    }
    
    else if(0.01<c1&&c1<0.75&& 0.01<c2&&c2<0.75){
     color=color1;
    }
    else if(c1<0.76&&c2<0.76){
        color=vec3(0.1);
    }
    else{
        color=color3;
    }
    
    return color;
}





vec3 testColor(Vector sampletv){
    vec3 color=vec3(0.);
    
    vec3 color1=0.8*vec3(245./255.,74./255.,28./255.);//reddish
    vec3 color2=vec3(255./255.,206./255.,31./255.);//yellow
    vec3 color3=vec3(0./255.,219./255.,218./255.);//turquoise
    vec3 color4=vec3(1./255.,117./255.,251./255.);//blue
    
    

    float z=sampletv.pos.fiber;
    float y =asinh(toVec4(sampletv.pos).y);
    float x=asinh(toVec4(sampletv.pos).x);
    //float width=asinh(toKlein(sampletv.pos).y);
    
    //use to draw square pattern in the intensity
    float c1=fract(2.*y/1.+0.25);
    float c2=fract(2.*z/1.+0.25);
    vec3 origColor;
    
   origColor=0.5*vec3((2./3.14*atan(-y)+1.)/2.,(2./3.14*atan(z)+1.)/2.,(2./3.14*atan(z+y)+1.)/2.)+vec3(0.1,0.2,0.35);

    
    
    return origColor;
}


//----------------------------------------------------------------------------------------------------------------------
// DECIDING BASE COLOR OF HIT OBJECTS, AND MATERIAL PROPERTIES
//----------------------------------------------------------------------------------------------------------------------





//given the value of hitWhich, decide the initial color assigned to the surface you hit, before any lighting calculations
//in the future, this function will also contain more data, like its rerflectivity etc

vec3 materialColor(int hitWhich){
    switch(hitWhich){
        case 0:// Didnt hit anything
           return vec3(0.);
        
        case 1://Lightsource
            return vec3(0.8);
            
        case 2://Local Object
            return vec3(0.2);//black sphere
            
        case 3: //Local Tiling
            
            return testColor(sampletv);
           // return earthColor(sampletv);
//            if(planeNumber==2){
//                return vertPlaneColor2(sampletv);
//            }
//            else{
//                return vertPlaneColor3(sampletv);
//            }
            
        case 5://debug
            return vec3(1.,0.,1.);
    }
}