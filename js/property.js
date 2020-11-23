/**
 * @module Properties
 *
 * @description
 * Module used to simplify the use of static and dynamic properties
 */


const SHADER_PASS = {
    NONE: 0,
    CONSTANT: 1,
    UNIFORM: 2,
}

/**
 * @class
 * @abstract
 *
 * @classdesc Abstract class to handle a generic property.
 *
 * @property {boolean} shaderCst - true if this property should be passed to the shader as a constant
 * @property {boolean} shaderUni - true if this property should be passed to the shader as a uniform
 * @property {string} shaderType - the type of the property on the shader side (when needed)
 */
class AbstractProp {

    /**
     * Constructor
     * @param {Object} options - the argument passed as an object
     */
    constructor(options = {}) {
        const defaultOptions = this.defaultOptions();
        for (const property in defaultOptions) {
            if (options.hasOwnProperty(property)) {
                this[property] = options[property];
            } else {
                this[property] = defaultOptions[property];
            }
        }
    }

    /**
     * Return the default value of the available options
     * @returns {{shaderType: undefined, shaderUniform: boolean, shaderConstant: boolean}}
     */
    defaultOptions() {
        return {
            shaderPass: undefined,
            shaderType: undefined
        }
    }

    /**
     * Return the value of the property
     */
    value() {
        throw new Error("This method should be implemented");
    }

    get isStatic() {
        throw new Error("This method should be implemented");
    }

    get isDynamic() {
        throw new Error("This method should be implemented");
    }
}

/**
 * @class
 *
 * @classdesc
 * Class for a constant property
 * It can be changed manually though.
 */
class StaticProp extends AbstractProp {

    constructor(value, options = {}) {
        super(options);
        /** @protected */
        this._value = value
    }

    /**
     * Set the value of the property.
     * @param value
     */
    set(value) {
        this._value = value;
    }

    /**
     * Return the value of the property.
     * @return {*}
     */
    value() {
        return this._value;
    }

    /**
     * Return the value of the property.
     * @return {*}
     */
    shaderValue() {
        return this._value;
    }

    get isStatic() {
        return true;
    }

    get isDynamic() {
        return false;
    }

}

/**
 * @class
 *
 * @classdesc
 * Class for a dynamical property.
 * Its value is given by a callback.
 */
class DynamicProp extends AbstractProp {

    constructor(callback, options = {}) {
        super(options);
        /** @protected */
        this._callback = callback
    }

    /**
     * Set the callback of the property.
     * @param callback
     */
    set(callback) {
        this._callback = callback;
    }

    /**
     * Return the value of the property.
     * The arguments are the ones passed to the callback function.
     * @param args
     * @return {*}
     */
    value(args) {
        return this._callback(args);
    }

    get isStatic() {
        return false;
    }

    get isDynamic() {
        return true;
    }
}


function addShaderPass(arg, shaderPass, shaderType) {
    switch (typeof (arg)) {
        case "object":
            if(arg.hasOwnProperty('shaderPass')){
                throw new Error('The property shaderPass is already defined for this object');
            }
            if(arg.hasOwnProperty('shaderType')){
                throw new Error('The property shaderType is already defined for this object');
            }
            arg.shaderPass = shaderPass;
            arg.shaderType = shaderType;
            arg.shaderValue = function () {
                return this;
            };
            return arg;
        case "number":
        case "boolean":
            return new StaticProp(arg, {shaderPass: shaderPass, shaderType: shaderType});
        default:
            throw new Error("This type of data is not covered");
    }
}

function getShaderPass(arg) {
    if (typeof (arg) !== 'object') {
        return SHADER_PASS.NONE;
    }
    if (arg.shaderPass === undefined) {
        return SHADER_PASS.NONE;
    }
    return arg.shaderPass;
}

function addShaderCst(arg, shaderType = undefined) {
    return addShaderPass(arg, SHADER_PASS.CONSTANT, shaderType);
}

function addShaderUni(arg, shaderType) {
    return addShaderPass(arg, SHADER_PASS.UNIFORM, shaderType);
}

function isShaderCst(arg) {
    return getShaderPass(arg) === SHADER_PASS.CONSTANT;
}

function isShaderUni(arg) {
    return getShaderPass(arg) === SHADER_PASS.UNIFORM;
}


export {
    SHADER_PASS,
    StaticProp,
    DynamicProp,
    getShaderPass,
    addShaderPass,
    isShaderCst,
    isShaderUni,
    addShaderCst,
    addShaderUni,

}