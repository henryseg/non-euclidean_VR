
//--------Texturing the Earth -------------------

//special command for when the earth is just at the origin

//vec3 sphereOffset(vec4 pt){
//  //  pt = translate(cellBoost, pt);//move back to orig cell
//   // pt = inverse(globalObjectBoost.matrix) * pt;//move back to origin
//   // return tangDirection(ORIGIN, pt).dir.xyz;//get the direction you are pointing from the origin.
//    //this is a point on the unit sphere, and can be used to look up a  spherical  texture
//    return vec3(1.,0.,0.);
//}
//
//vec3 earthColor(Vector sampletv){
//        
//        vec3 color = texture(earthCubeTex, sphereOffset(sampletv.pos));
// 
//    return color;
//    }
//
//
//
//
//
//
//





//----------------------------------------------------------------------------------------------------------------------
// DECIDING BASE COLOR OF HIT OBJECTS, AND MATERIAL PROPERTIES
//----------------------------------------------------------------------------------------------------------------------





//given the value of hitWhich, decide the initial color assigned to the surface you hit, before any lighting calculations
//in the future, this function will also contain more data, like its rerflectivity etc

vec3 materialColor(int hitWhich){
    switch(hitWhich){
        case 0:// Didnt hit anything
           return vec3(0.1);
        
        case 1://Lightsource
            return vec3(0.2);
            
        case 2://Local Object
            return vec3(0.,0.,0.);//black sphere
            
        case 3: //Local Tiling
            return vec3(0.2,0.3,0.55)+0.2*sampletv.pos.proj.xyz;
            
        case 5://debug
            return vec3(1.,0.,1.);
    }
}
    


float materialReflectivity(int hitWhich){
    
    switch(hitWhich){
        case 0:
            return 0.;
            
        case 1://Lightsource
            return 0.2;
            
        case 2://Local Object
            return 0.3;//shiny
                
        case 3: //Tiling
            return 0.2;
            
        case 5://debug
            return 0.;
            
    }
    
}