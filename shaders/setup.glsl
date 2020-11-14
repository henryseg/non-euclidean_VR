Isometry boost; /**< Current boost */
Isometry leftBoost; /**< Left eye boost */
Isometry rightBoost; /**< Right eye boost */
Isometry cellBoost; /**< Cell boost */
Isometry invCellBoost; /**< Inverse of the cell boot */
Isometry objectBoost; /**< objetBoost (model for the template) */

mat4 facing;
mat4 leftFacing;
mat4 rightFacing;


/**
 * Setup all the boost from the raw data passed to the shader
 */
void unserializeData() {
    boost = unserializeIsom(boostsRawA[0], boostsRawB[0]);
    leftBoost = unserializeIsom(boostsRawA[1], boostsRawB[1]);
    rightBoost = unserializeIsom(boostsRawA[2], boostsRawB[2]);
    cellBoost = unserializeIsom(boostsRawA[3], boostsRawB[3]);
    invCellBoost = unserializeIsom(boostsRawA[4], boostsRawB[4]);

    facing = facings[0];
    leftFacing = facings[1];
    rightFacing = facings[2];
}
