/**
 * Computed color for this pixel
 */
out vec4 out_FragColor;

/**
 * Setup all the boost from the raw data passed to the shader
 */
void unserializeBoosts() {
    currentBoost = unserializeIsom(currentBoostRawA, currentBoostRawB);
    leftBoost = unserializeIsom(leftBoostRawA, leftBoostRawB);
    rightBoost = unserializeIsom(rightBoostRawA, rightBoostRawB);
    cellBoost = unserializeIsom(cellBoostRawA, cellBoostRawB);
    invCellBoost = unserializeIsom(invCellBoostRawA, invCellBoostRawB);
}

/**
 * Compute the initial direction for the ray-marching
 */
Vector setupDir(){}

/**
 * Main function. Wrap everything together:
 * - Compute the direction where to start the ray-marching.
 * - Ray-march in this direction.
 * - If we hit an object compute the correspondng color.
 */
void main() {

}
