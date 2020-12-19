import {Solid} from "./Solid.js";
import {mustache} from "../../lib/mustache.mjs";

class SolidUnion extends Solid {

    /**
     *
     * @param {Solid} solid1
     * @param {Solid} solid2
     * @param {Material} material
     */
    constructor(solid1, solid2, material = undefined) {
        if(solid1.global !== solid2.global) {
            throw new Error("The solids should be both global or both local");
        }
        const data = {
            position: solid1.position,
            global: solid1.global,
            material: material
        };
        super(data);
        /**
         * The first object we take the union of
         * @type {Solid}
         */
        this.child1 = solid1;
        /**
         * The second object we take the union of
         * @type {Solid}
         */
        this.child2 = solid2;
    }

    /**
     * Return the path to the shader code of the item
     * @return {string} the path the the shader;
     * @todo The path is absolute with respect to the root of the server
     */
    get shaderSource() {
        return "/shaders/objects/abstract/SolidUnion.xml";
    }

    /**
     * build the GLSL code relative to the item (declaration, signed distance function and gradient)
     * @param {Object} globals - Global parameters needed to build the GLSL blocks
     * @return {Promise<void>}
     */
    async glslBuildData(globals = {}) {
        // build the shader chunk of the child
        await this.child1.glslBuildData();
        await this.child2.glslBuildData();

        const xml = await this.loadGLSLTemplate();
        const selector = `solid[class=${this.className}] shader`;
        const templates = xml.querySelectorAll(selector);
        let rendered;
        let type;
        for (const template of templates) {
            type = template.getAttribute('type');
            rendered = mustache.render(template.childNodes[0].nodeValue, this);
            switch (type) {
                case 'sdf':
                    // SDF for the solid
                    this.glsl[type] = `
                    ${this.child1.glsl[type]}
                    
                    ${this.child2.glsl[type]}
                    
                    float ${this.name}SDF(RelVector v){
                        ${rendered}
                    }`;
                    break;
                case 'gradient':
                    // gradient of SDF for the solid
                    this.glsl[type] = `
                    ${this.child1.glsl[type]}
                    
                    ${this.child2.glsl[type]}
                    
                    RelVector ${this.name}Grad(RelVector v){
                        ${rendered}
                    }`;
                    break;
                default:
                    this.glsl[type] = `
                    ${this.child1.glsl[type]}
                    
                    ${this.child2.glsl[type]}
                    
                    ${rendered}`;
            }
        }
    }

}

export {SolidUnion};