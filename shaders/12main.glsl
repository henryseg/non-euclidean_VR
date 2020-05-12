//----------------------------------------------------------------------------------------------------------------------
// Main
//----------------------------------------------------------------------------------------------------------------------

void main(){
    
    //in setup
    setResolution(res);
    setVariables();

    //in raymarch
    tangVector rayDir=setRayDir();
    
    
    // ------------------------
    //Isometry totalFixMatrix = identityIsometry;//this already happens right in raymarch
  
    //do the  raymarch    
    raymarch(rayDir, totalFixMatrix);
    
    //figuring out the color of the point we marched to
    resultingColor=marchedColor(hitWhich,totalFixMatrix,sampletv);
    
    //if we stop with no reflections: output this color
    //out_FragColor=resultingColor;
    

    //TRY REFLECTIONS!! ------------------------
    
    //have a uniform float mirror that says how shiny the surface is:
    if(mirror==0.||isMirrored(hitWhich)==false){//don't do a second round
        //out_FragColor=resultingColor;
        //attempt at  "Gamma correction" from shadertoy should take sqrt of the entries in  that case but left it out for now...
        out_FragColor=vec4(pow(clamp(resultingColor, 0., 1.),vec4(0.6)));
        return;
    }
    
    
    //---------DOING ONE REFLECTION ----------------------
    
    else{
    
    //do the raymarch again! starting from this position (sampletv)
    //first, reflect this direction wtih respect to the surface normal
    tangVector nVec=surfaceNormal(sampletv);
    tangVector newDir = reflectOff(sampletv, nVec);
    
    //randomly adjust the direction by a TINY ammount to simulate slight  roughness in the surface
//    float n = sin(dot(newDir.pos, vec4(27, 113, 57,0.)));
//    vec4 rnd = fract(vec4(2097152, 262144, 32768,0.)*n)*.16 - .08;
//    newDir.dir=newDir.dir+0.05*rnd;
    
    //move the new ray off a little bit
    newDir=geoFlow(newDir,0.01);
    //then, raymarch in this new direction
    reflectmarch(newDir, totalFixMatrix);
        
    //now, get the reflected color
    reflectedColor=marchedColor(hitWhich,totalFixMatrix,sampletv);
    
    //and then combine the first pass color and the  reflected color to output
    resultingColor= 0.2*resultingColor+0.8*((1.-mirror)*resultingColor+mirror* reflectedColor);
        
    //this is some sort of "Gamma correction" from shadertoy 
    out_FragColor=vec4(pow(clamp(resultingColor, 0., 1.),vec4(0.6)));
    return;
    }
        
    //Could keep going and add more and more relfection passes
    }