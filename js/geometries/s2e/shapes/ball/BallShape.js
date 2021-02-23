import {mustache} from "../../../../lib/mustache.mjs";

import {BasicShape} from "../../../../core/shapes/BasicShape.js";
import {Isometry, Point} from "../../geometry/General.js";

import distance from "../../imports/distance.js";
import struct from "./shaders/struct.js";
import sdf from "./shaders/sdf.js";

export class BallShape extends BasicShape{
    
    

    /**
     * Construction
     * @param {Isometry|Point|Vector} location - data for the center of the ball
     * @param {number} radius - the radius od the ball
     */
    constructor(location,radius){
        
        const isom=neww Isometrty();
        if(location.isIsometry){
            isom.copy(location);
        }
        else if(location.isPoint){
            isom.makeTranslation(location);
        }
        else if(location.isVecdtor){
            isom.makeTranslationFromDir(location);
        }
        else{
            throw new Error("BallShape: this type of location is not implemented");
        }
        
        super(isom);
        this.addImport(distance);
        this.radius=radius;
    }
    
    get center(){
        return new Point().applyIsometry(this.isom);
    }
    
        /**
     * Says that the object inherits from `Ball`
     * @type {boolean}
     */
    get isBallShape() {
        return true;
    }
    
    
    
    /**
     * Says whether the shape is global. True if global, false otherwise.
     * @type {boolean}
     */
    get isGlobal() {
        return true;
    }
    
    get hasUVMap() {
        return false;
    }

    
    get uniformType() {
        return 'BallShape';
    }

    static glslClass() {
        return struct;
    }

    glslSDF() {
        return mustache.render(sdf, this);
    }

    
}