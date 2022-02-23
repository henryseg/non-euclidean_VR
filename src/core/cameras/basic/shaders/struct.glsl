/***********************************************************************************************************************
 * @struct
 * Camera.
 * Mostly used to carry all informations linked to the camera (minDist, maxDist, maxSteps, etc)
 **********************************************************************************************************************/
struct Camera {
    float fov;/**< vertical field of view */
    float minDist;/**< minimal distance we ray-march */
    float maxDist;/**< maximal distance we ray-march */
    int maxSteps;/**< maximal number of steps during the ray-marching */
    float threshold;/**< threshold to stop the ray-marching */
    RelPosition position;/**< position of the camera (independent of the camera orientation in VR) */
    mat4 matrix;/**< orientation of the camera (mostly for VR) */
};