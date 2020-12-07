/**
 * Transform a method attached to an object into a function.
 * @param {Object} scope - the object on which the method is called
 * @param {function} fn - the method to call
 * @return {function(): *}
 */
function bind(scope, fn) {
    return function () {
        return fn.apply(scope, arguments);
    };
}


export {
    bind
}