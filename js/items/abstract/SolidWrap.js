import {Solid} from "./Solid.js";
import {mustache} from "../../lib/mustache.mjs";

class SolidWrap extends Solid {

    /**
     * @param {Solid} wrap - wrapping object
     * @param {Solid} solid - the object to render. It should be entirely contained in the wrap
     */
    constructor(wrap, solid) {
        if (wrap.global !== solid.global) {
            throw new Error("The solid and the wrap be both global or both local");
        }
        const data = {
            position: wrap.position,
            global: wrap.global,
            material: solid.material
        };
        super(data);
        /**
         * The first object we take the union of
         * @type {Solid}
         */
        this.wrap = wrap;
        /**
         * The second object we take the union of
         * @type {Solid}
         */
        this.solid = solid;
    }

    /**
     * Return the path to the shader code of the item
     * @return {string} the path the the shader;
     * @todo The path is absolute with respect to the root of the server
     */
    get shaderSource() {
        return "/shaders/items/abstract/SolidWrap.xml";
    }

    /**
     * build the GLSL code relative to the item (declaration, signed distance function and gradient)
     * @param {Object} globals - Global parameters needed to build the GLSL blocks
     * @return {Promise<void>}
     */
    async glslBuildData(globals = {}) {
        // build the shader chunk of the child
        await this.wrap.glslBuildData();
        await this.solid.glslBuildData();

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
                    ${this.wrap.glsl[type]}
                    
                    ${this.solid.glsl[type]}
                    
                    float ${this.name}SDF(RelVector v){
                        ${rendered}
                    }`;
                    break;
                case 'gradient':
                    // gradient of SDF for the solid
                    this.glsl[type] = `
                    ${this.solid.glsl[type]}
                    
                    RelVector ${this.name}Grad(RelVector v){
                        ${rendered}
                    }`;
                    break;
                default:
                    this.glsl[type] = `
                    ${this.wrap.glsl[type]}
                    
                    ${this.solid.glsl[type]}
                    
                    ${rendered}`;
            }
        }
    }

}

export {SolidWrap};