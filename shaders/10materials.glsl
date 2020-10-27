



vec3 pastelColor(Vector sampletv){

    vec4 p=toVec4(sampletv.pos);
    
    float z=sampletv.pos.fiber;
    float y =asinh(p.y);
    float x=asinh(p.x);

    
   vec3 color=0.5*vec3((2./3.14*atan(-y)+1.)/2.,(2./3.14*atan(z)+1.)/2.,(2./3.14*atan(z+y)+1.)/2.)+vec3(0.1,0.2,0.35);
    
    return color;
}



vec3 goldenColor(Vector sampletv){
    vec4 p=toVec4(sampletv.pos);
    
    return vec3(1.,0.,0.);

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
            
        case 2://The Earth
            return vec3(0.2);//black sphere
            
        case 3: //Local Tiling
            if(colorScheme==2){
            return pastelColor(sampletv);}
            else if(colorScheme==1){
                return goldenColor(sampletv);
            }
            
        case 5://debug
            return vec3(1.,0.,1.);
    }
}